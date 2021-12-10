import router, { constantRoutes, asyncRoutes } from '@/router'
import settings from '@/settings'
import { PermissionTy } from '@/types/store'
import { RouteItemTy, RouterRowTy, RouterTy } from '@/types/router'
import { ObjTy } from '@/types/common'
import Layout from '@/layout'
import { getStorage, setStorage, removeStorage } from '@/utils/auth.ts'
import { UserTy } from '@/types/store'
import { getInfoReq } from '@/api/user'
const moduleView = import.meta.glob('../../views/**/**.vue')

/**
 * Use meta.code to determine if the current user has permission
 * @param codeArr
 * @param routeItem
 */
function hasCodePermission(codeArr: Array<number>, routeItem: RouteItemTy) {
    if (routeItem.meta && routeItem.meta.code) {
        return codeArr.includes(routeItem.meta.code) || routeItem.hidden
    } else {
        return true
    }
}
/**
 * Use meta.code to determine if the current user has permission
 * @param codeArr
 * @param asyncRoutes
 */
function filterRouterByCodeArr(codeArr: Array<number>, asyncRoutes: RouterTy): Promise<RouterTy> {
    return new Promise((resolve) => {
        const filterRouter: RouterTy = []
        asyncRoutes.forEach(async (routeItem: RouterRowTy) => {
            if (hasCodePermission(codeArr, routeItem)) {
                if (routeItem.children) {
                    routeItem.children = await filterRouterByCodeArr(codeArr, routeItem.children)
                }
                filterRouter.push(routeItem)
            }
        })
        resolve(filterRouter)
    })
}

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles: Array<string>, route: RouteItemTy) {
    if (route.meta && route.meta.roles) {
        return roles.some((role) => route.meta?.roles?.includes(role))
    } else {
        return true
    }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes: RouterTy, roles: Array<string>) {
    const res: RouterTy = []
    routes.forEach((route) => {
        const tmp = { ...route }
        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAsyncRoutes(tmp.children, roles)
            }
            res.push(tmp)
        }
    })
    return res
}

const state: PermissionTy = {
    isGetUserInfo: false, // get userInfo
    routes: [], //将过滤后的异步路由和静态路由集合
    addRoutes: [] //过滤后的异步路由
}

const actions = {
    generateRoutes({ commit }: ObjTy, data: any, roles: any) {
        return new Promise(async (resolve) => {
            setStorage("USER_ROUTER", JSON.stringify(data))
            let accessedRoutes
            accessedRoutes = routerPackag(data)
            accessedRoutes = [...asyncRoutes, ...data]
            commit('M_routes', accessedRoutes)
            resolve(accessedRoutes)
        })
    },
    geneRoutes({ commit }: ObjTy, data: any, roles: any) {
        return new Promise(async (resolve) => {
            getInfoReq().then((res: any) => {
                if (!res) {

                    resolve("请重新登录")
                }
            }).catch((error: any) => {
                console.log(error);
            })
            let accessedRoutes
            accessedRoutes = routerPackag(data)
            accessedRoutes = [...asyncRoutes, ...data]
            // accessedRoutes = await filterRouterByCodeArr(codeArr, accessedRoutes)

            commit('M_routes', accessedRoutes)
            resolve(accessedRoutes)
        })
    }
}
export function routerPackag(routes: any) {
    if (routes) {
        return routes.filter((res: any) => {
            const component = res.component;
            if (component) {
                if (res.component !== "Layout") {
                    res.component = moduleView[`../../views/${res.component}.vue`]
                } else {
                    res.component = Layout
                }
                if (res.children && res.children.length) {
                    routerPackag(res.children)
                }
                return true;
            }
        })
    }
}
const mutations = {
    M_routes: (state: PermissionTy, routes: RouterTy) => {
        routes.forEach((route: RouterRowTy) => {
            // router.addRoute(route)
            router.addRoute(route)
        })
        state.addRoutes = routes
        state.routes = routes
    },
    M_isGetUserInfo: (state: PermissionTy, data: boolean) => {
        state.isGetUserInfo = data
    }
}
export default {
    namespaced: true,
    state,
    mutations,
    actions
}
