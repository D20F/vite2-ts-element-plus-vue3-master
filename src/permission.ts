import router, { asyncRoutes } from '@/router'
import store from './store'
import settings from './settings'
import { getToken, getStorage } from '@/utils/auth.ts'
import NProgress from 'nprogress'
NProgress.configure({ showSpinner: false }) // NProgress Configuration
import 'nprogress/nprogress.css'
import getPageTitle from '@/utils/getPageTitle'
import { getInfoReq } from '@/api/user'
let testdata = [
    {
        path: '/form',
        component: 'Layout',
        name: 'Forms',
        redirect: '/form/index',
        meta: { title: '用户组', icon: 'table' },
        children: [
            {
                path: 'index',
                name: 'Form',
                component: 'form/index',
                meta: { title: '用户组', icon: 'table', roles: ['admin', '测试专用账号组'], button: ["group_add", "group_edit", "group_del"] },
            }
        ]
    }
]
let accessRoutes: any = []
// console.log(accessRoutes);
const whiteList = ['/login'] // no redirect whitelist
router.beforeEach((to: any, from, next: any) => {
    // start progress bar
    if (settings.isNeedNprogress) NProgress.start()
    // set page title 
    document.title = getPageTitle(to.meta.title)
    /* 
     * 总的来说：过滤动态路由
     * 1.是否与token 没有去登录页 ,有 如果要去登录页则重定向到首页。没有, 重新定向到登录页
     * 2.判断是否权限筛选,是,直接放行。没有，筛选动态路由后，添加动态路由然后放行，
     * */

    if (whiteList.indexOf(to.path) !== -1) {
        next();
    } else {
        const token = getToken()
        const user = getStorage('USERID');
        let userRouter: any = getStorage('USER_ROUTER')
        if (token && user) {
            if (accessRoutes.length === 0) {
                if (userRouter == undefined) {
                    getInfoReq().then((result: any) => {
                        accessRoutes = store.dispatch('permission/generateRoutes', result.data)
                        go(to, next)
                    }).catch((err: any) => {
                    });
                } else {
                    accessRoutes = JSON.parse(userRouter);
                    accessRoutes = store.dispatch('permission/geneRoutes', accessRoutes)
                    go(to, next)
                }
            } else {
                next();
            }
        } else {
            if (to.path === '/login') {
                next({ path: '/' });
            } else {
                next(`/login`)
            }
        }
    }
})

function go(to: any, next: any) {
    next({ ...to, replace: true });
}
router.afterEach(() => {
    if (settings.isNeedNprogress) NProgress.done()
})
