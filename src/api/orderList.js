import { get, post, patch, put } from './http'

//对账单详细信息
export function billDetail(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//对账单用户反馈
export function userReturn(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}


//
export function statementDetail(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}


