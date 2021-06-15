import { get, post, patch, put } from './http'

//增加收货地址
export function addAddress(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//编辑收货地址
export function editAddress(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//删除收货地址
export function deleteAddress(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//使用优惠券
export function usetheCoupon(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//查看返利记录
export function CouponbackRecord(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//订单详情新接口
export function orderDetail(url, data) {
    return post(url, data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
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


