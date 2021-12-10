import store from '@/store'
import axios from 'axios'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { getToken, setToken, getStorage, removeStorage } from '@/utils/auth.ts'
import { AxiosConfigTy, AxiosReqTy } from '@/types/common'
import router from '@/router'
let requestData: any
let loadingE: any

const service: any = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL as string,
    timeout: 30000,
    headers: {
        'tokenType': 1,
    }// 超时时间
})
// 请求拦截
service.interceptors.request.use(
    (request: AxiosReqTy) => {
        request.headers['userId'] = getStorage("USERID")
        request.headers['token'] = getToken()
        /* 下载文件*/
        // if (request.isDownLoadFile) {
        //   request.responseType = 'blob'
        // }
        // if (request.isUploadFile) {
        //   console.log('上传的是文件', request)
        //   request.headers['Content-Type'] = 'multipart/form-data'
        // }
        requestData = request
        // if (request.bfLoading) {
        //   loadingE = ElLoading.service({
        //     lock: true,
        //     text: '数据载入中',
        //     spinner: 'el-icon-ElLoading',
        //     background: 'rgba(0, 0, 0, 0.1)'
        //   })
        // }
        /*
         *params会拼接到url上
         * */
        // console.log(request.isParams);

        // if (request.isParams) {
        //   request.params = request.data
        //   request.data = {}
        // }
        return request
    },
    (err: any) => {
        Promise.reject(err)
    }
)
// 响应拦截
service.interceptors.response.use(
    (response: any) => {
        const res = response.data
        // 状态码报错
        if (res.status !== 200) {
            if (res.status == 401) {
                ElMessage({
                    message: '登陆过期请重新登录',
                    type: 'error',
                    duration: 3 * 1000
                })
                store.dispatch('user/logout').then(() => {
                    //此处reload清空路由和重置部分状态
                    location.reload()
                    removeStorage("USER_ROUTER");
                    removeStorage("USERID");
                    removeStorage("TO_KEN");
                })
                router.push(`/login`)
            } else {
                ElMessage({
                    message: res.message || 'Error',
                    type: 'error',
                    duration: 3 * 1000
                })
            }
            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res
        }
    },
    (error: any) => {
        if (!error.response) {
            ElMessage({
                message: '登陆过期请重新登录',
                type: 'error',
                duration: 3 * 1000
            })
            location.reload()
            removeStorage("USER_ROUTER");
            removeStorage("USERID");
            removeStorage("TO_KEN");
            router.replace('/login')
        } else {
            ElMessage({
                message: error.response.data.message,
                type: 'error',
                duration: 3 * 1000
            })
        }
        return Promise.reject(error)
        //   if (requestData.afHLoading && loadingE) {
        //     loadingE.close()
        //   }
        //   // 如果是下载文件直接返回
        //   if (requestData.isDownLoadFile) {
        //     return res.data
        //   }
        //   const { flag, msg, isNeedUpdateToken, updateToken } = res.data
        //   //更新token保持登录状态
        //   if (isNeedUpdateToken) {
        //     setToken(updateToken)
        //   }
        //   if (flag) {
        //     return res.data
        //   } else {
        //     if (requestData.isAlertErrorMsg) {
        //       ElMessage({
        //         message: msg,
        //         type: 'error',
        //         duration: 2 * 1000
        //       })
        //       return Promise.reject(msg)
        //     } else {
        //       return res.data
        //     }
        //   }
        // },
        // (err: any) => {
        //   if (loadingE) loadingE.close()
        //   if (err && err.response && err.response.code) {
        //     if (err.response.code === 403) {
        //       ElMessageBox.confirm('请重新登录', {
        //         confirmButtonText: '重新登录',
        //         cancelButtonText: '取消',
        //         type: 'warning'
        //       }).then(() => {
        //         store.dispatch('user/resetToken').then(() => {
        //           location.reload()
        //         })
        //       })
        //     } else {
        //       ElMessage({
        //         message: err,
        //         type: 'error',
        //         duration: 2 * 1000
        //       })
        //     }
        //   } else {
        //     ElMessage({
        //       message: err,
        //       type: 'error',
        //       duration: 2 * 1000
        //     })
        //   }
        //   return Promise.reject(err)
    }
)
export const postData = (url: any, data: any) => {
    return new Promise((resolve, reject) => {
        service({ url, data, method: 'post' })
            .then((res: any) => {
                resolve(res.data)
            })
            .catch(err => reject(err))
    })
}
export const getData = (url: any, params: any) => {
    return new Promise((resolve, reject) => {
        service({ url, params, method: 'get' })
            .then((res: any) => resolve(res.data))
            .catch(err => reject(err))
    })
}
export const putData = (url: any, data: any) => {
    return new Promise((resolve, reject) => {
        service({ url, data, method: 'put' })
            .then((res: any) => resolve(res.data))
            .catch(err => reject(err))
    })
}
export const deleteData = (url: any, params: any) => {
    return new Promise((resolve, reject) => {
        service({ url, params, method: 'DELETE' })
            .then((res: any) => resolve(res.data))
            .catch(err => reject(err))
    })
}
export default function khReqMethod({
    url,
    data,
    method,
    isParams,
    bfLoading,
    afHLoading,
    isUploadFile,
    isDownLoadFile,
    baseURL,
    timeout,
    isAlertErrorMsg = true
}: AxiosConfigTy): any {
    return service({
        url: url,
        method: method ?? 'post',
        data: data ?? {},
        isParams: isParams ?? false,
        bfLoading: bfLoading ?? false,
        afHLoading: afHLoading ?? true,
        isUploadFile: isUploadFile ?? false,
        isDownLoadFile: isDownLoadFile ?? false,
        isAlertErrorMsg: isAlertErrorMsg,
        baseURL: baseURL ?? import.meta.env.VITE_APP_BASE_URL,
        timeout: timeout ?? 30000
    })
}
