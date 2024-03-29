import { get, post, patch, put } from './http'
//用户登录
export function userLogin(data) {
    return post('/web_user/login.do', data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}