import request from '@/utils/axiosReq'
import { ObjTy } from '@/types/common'

export function loginReq(data: ObjTy) {
  return request({
    url: '/auth/admin/login',
    data,
    method: 'post',
    bfLoading: false,
    isParams: true,
    isAlertErrorMsg: false
  })
}

export function getInfoReq() {
  return request({
    url: '/adminPermissionButton/info/own',
    method: 'get',
    bfLoading: false,
    isParams: true,
    isAlertErrorMsg: false
  })
}

export function logoutReq() {
  return request({
    url: '/auth/admin/logout',
    method: 'post',
    isParams: true,
    isAlertErrorMsg: false
  })
}

export function adminPermissionPage() {
  return request({
    url: '/adminPermission/page',
    method: 'get',
    isAlertErrorMsg: false
  })
}
export function adminPermissionAdd(data: ObjTy) {
  return request({
    url: '/adminPermission',
    data,
    method: 'post',
    bfLoading: false,
    isParams: true,
    isAlertErrorMsg: false
  })
}
export function adminPermissionDelete(data: ObjTy) {
  return request({
    url: '/adminPermission/' + data,
    method: 'delete',
    bfLoading: false,
    isParams: true,
    isAlertErrorMsg: false
  })
}
export function adminPermissionModify(id: any, data: any) {
  return request({
    url: '/adminPermission/' + id,
    data: data,
    method: 'put',
    bfLoading: false,
    isParams: true,
    isAlertErrorMsg: false
  })
}