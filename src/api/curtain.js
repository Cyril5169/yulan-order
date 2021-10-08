/*
 *存放除了查询窗帘之外的窗帘所有接口，因为实在是太多了
*/
import { get, post, patch, put } from './http'
//获取单个窗帘信息
export function getCurtainDetailMsg(data, config = {}) {
    return post('/item/getCurtainInfo.do', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//通过型号获取工艺类型
export function getGY(data) {
    return post('/item/getGYList.do', data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//更改帘头、纱的用量
export function changeDosageByNo(data) {
    return post('/item/changeCurtainItem.do', data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//添加入购物车
export function addCurtainToCar(data) {
    return post('/cart/addCurtainCartItem.do', data).then((res) => {
        return Promise.resolve(res.data);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//删除窗帘购物车的多个产品
export function deleteCurtains(data) {
    return post('/cart/deleteCommodities.do', data).then((res) => {
        return Promise.resolve(res.data);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//删除窗帘购物车一个组
export function deleteTheGroup(data) {
    return post('/cart/deleteCartItems.do', data).then((res) => {
        return Promise.resolve(res.data);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//修改窗帘购物车的一个产品
export function updateCurtain(data) {
    return post('/cart/updateCurtainCartItem.do', data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获取窗帘下的产品可更换列表及其信息
export function changeItem(data, config = {}) {
    return post('/item/getCurtainItemTypeAll.do', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获取每个窗帘可更换产品--模糊搜索
export function changeItemBlur(data, config = {}) {
    return post('/item/searchCurtainItemTypeAll.do', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//修改窗帘数量
export function alterCount(data) {
    return get('/cart/alterCurtainCartItemCount.do', data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//窗帘提交审核
export function commitLook(data) {
    return post('/order/insertCurtain.do', data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//提交审核后删除购物车条目
export function deleteCurtain(data) {
    return post('/commodity/alterCommoditiesStatusByCartItemID.do', data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}