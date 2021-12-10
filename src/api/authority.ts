import request from '@/utils/axiosReq'
import { getData } from '@/utils/axiosReq'
export function adminRoleAll() {
    return request({
        url: '/auth/admin/logout',
        method: 'post',
        isParams: true,
        isAlertErrorMsg: false
    })
}
export function adminUserPage() {
    return request({
        url: '/adminPermissionButton/info/own',
        method: 'get',
        isAlertErrorMsg: false
    })
}
export function adminUserModify() {
    return request({
        url: '/adminPermissionButton/info/own',
        method: 'get',
        isAlertErrorMsg: false
    })
}
export function adminUserPasswordReset() {
    return request({
        url: '/adminPermissionButton/info/own',
        method: 'get',
        isAlertErrorMsg: false
    })
}
export function adminUserDelete() {
    return request({
        url: '/adminPermissionButton/info/own',
        method: 'get',
        isAlertErrorMsg: false
    })
}
export function adminUserAdd() {
    return request({
        url: '/adminPermissionButton/info/own',
        method: 'get',
        isAlertErrorMsg: false
    })
}
export function adminRoleAdd(data: any) {
    return request({
        url: '/adminRole',
        data,
        method: 'post',
        isAlertErrorMsg: false
    })
}

export function adminRoleModify(id: any, data: any) {
    return request({
        url: '/adminRole/' + id,
        data,
        method: 'put',
        isAlertErrorMsg: false
    })
}

export function adminRoleAllA(data: any) {
    return request({
        url: '/adminRole/all',
        data,
        method: 'get',
        isAlertErrorMsg: false
    })
}

export function adminRoleDelete(id: any) {
    return request({
        url: '/adminRole/' + id,
        method: 'delete',
        isAlertErrorMsg: false
    })
}



export function adminUserModifyS(id: any, data: any) {
    return request({
        url: '/adminPermissionButton/' + id,
        data,
        method: 'put',
        isAlertErrorMsg: false
    })
}
export function adminUserPasswordResetS(id: any) {
    return request({
        url: '/adminPermissionButton/password/reset/' + id,
        method: 'put',
        isAlertErrorMsg: false
    })
}
export function adminUserDeleteS(id: any) {
    return request({
        url: '/adminPermissionButton/' + id,
        method: 'delete',
        isAlertErrorMsg: false
    })
}

export function adminUserAddS(data: any) {
    return request({
        url: '/adminPermissionButton',
        data,
        method: 'post',
        isAlertErrorMsg: false
    })
}

export function adminUserPageA(params: any) {
    const ulr = "/adminPermissionButton/page"
    const data = params
    return getData(ulr, data);
}