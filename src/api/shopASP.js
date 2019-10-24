import { get, post, patch, put } from './httpASP'
//根据用户ID，类型查找购物车数据
export function GetCartItem(data, config = {}) {
    return post('/CART_ITEM/GetCartItem', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}