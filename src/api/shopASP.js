import { get, post, patch, put } from './httpASP'
//根据用户ID，类型查找购物车数据
export function GetCartItem(data, config = {}) {
    return post('/CART_ITEM/GetCartItem', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//根据用户ID，类型查找购物车数据
export function GetCartItemCount(data, config = {}) {
    return post('/CART_ITEM/GetCartItemCount', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function UpdateCartItem(data, config = {}) {
    return post('/CART_ITEM/UpdateCartItem', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//一口价添加到购物车
export function FixPriceShopAddToCart(data, config = {}) {
    return post('/SAL_PROMOTION_SPECIAL/FixPriceShopAddToCart', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//一口价批量添加购物车
export function FixPriceShopAddListToCart(data, config = {}) {
    return post('/SAL_PROMOTION_SPECIAL/FixPriceShopAddListToCart', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//删除墙纸，软装购物车
export function DeleteCommodities(data, config = {}) {
    return post('/CART_ITEM/DeleteCommodities', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//删除窗帘购物车
export function DeleteCartItems(data, config = {}) {
    return post('/CART_ITEM/DeleteCartItems', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
