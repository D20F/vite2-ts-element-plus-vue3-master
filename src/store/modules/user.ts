import { loginReq, logoutReq, getInfoReq } from '@/api/user'
import { setToken, removeToken, setStorage, getStorage } from '@/utils/auth.ts'
import { ObjTy } from '@/types/common'
import { UserTy } from '@/types/store'
import db from '@/utils/localstorage'
//token: getToken(),

const getDefaultState = () => {
  return {
    //token: getToken(),
    username: '',
    avatar: '',
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  M_username: (state: UserTy, username: string) => {
    state.username = username
  },
  M_roles: (state: UserTy, roles: Array<string>) => {
    let robuton: any = []
    robuton = getStorage("robuton")
    if (robuton) {
      state.roles = JSON.parse(robuton)
    } else {
      state.roles = roles
      setStorage("robuton", JSON.stringify(roles))
    }
    // state.roles = roles

  }
}

const actions = {
  // user login
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login({ commit }: ObjTy, data: ObjTy) {
    return new Promise((resolve, reject) => {
      loginReq(data)
        .then((res: ObjTy) => {
          if (res.status === 200) {
            //commit('SET_Token', res.data?.jwtToken)
            // localStorage.setItem("TO_KEN",res.data.token.accessToken)
            // localStorage.setItem("USERID",res.data.token.userId)
            localStorage.setItem("roles", res.data.username)
            setStorage("USERID", res.data.token.userId);
            setToken(res.data.token.accessToken)
            commit('M_username', res.data.name)
            commit('M_roles', res.data.token.permissionCodes)
            resolve(null)
          } else {
            reject(res)
          }
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  },
  // get user info
  getInfo({ commit }: ObjTy) {
    return new Promise((resolve, reject) => {
      getInfoReq().then((response: ObjTy) => {
        const { data } = response
        if (!data) {
          return reject('Verification failed, please Login again.')
        }
        //此处模拟数据
        const rolesArr: any = localStorage.getItem('roles')
        if (rolesArr) {
          data.roles = JSON.parse(rolesArr)
        } else {
          data.roles = ['admin']
          localStorage.setItem('roles', JSON.stringify(data.roles))
        }
        const { roles, username } = data
        commit('M_username', username)
        commit('M_roles', roles)
        // commit('SET_AVATAR', avatar)
        resolve(data)
      })
        .catch((error: any) => {
          reject(error)
        })
    })
  },
  // user logout
  logout() {
    return new Promise((resolve, reject) => {
      logoutReq()
        .then(() => {
          db.clear()
          removeToken() // must remove  token  first
          // resetRouter()
          resolve(null)
        })
        .catch((error: any) => {
          reject(error)
        })
    })
  },
  // remove token
  resetToken() {
    return new Promise((resolve) => {
      removeToken() // must remove  token  first
      resolve(null)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
