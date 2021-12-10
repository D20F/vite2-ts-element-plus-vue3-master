const TokenKey = 'Admin-Token'

export function getToken() {
  return localStorage.getItem(TokenKey)
}

export function setToken(token: string) {
  return localStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return localStorage.removeItem(TokenKey)
}
export function getStorage(key:string) {
  return localStorage.getItem(key)
}
export function setStorage(key:string,data:any) {
  return localStorage.setItem(key,data)
}
export function removeStorage(key:string) {
  return localStorage.removeItem(key)
}