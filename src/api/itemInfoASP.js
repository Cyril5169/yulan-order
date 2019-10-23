import { get, post, patch, put } from './httpASP'

//通过productType和授权的仓库查询物料
export function GetItemByProductType(data, config = {}) {
    return post('/ITEM/GetItemByProductType', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//通过stockId查询物料
export function GetStockByItemNo(data, config = {}) {
    return post('/ITEM/GetStockByItemNo', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//根据userid查询仓库权限
export function GetStockByUser(data, config = {}) {
    return post('/STOCK_USER/GetStockByUser', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//根据item_no查询item详情
export function GetItemDetailById(data, config = {}) {
    return post('/ITEM/GetItemDetailById', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//根据item_no获取窗帘全部用量
export function GetDosageAll(data, config = {}) {
    return post('/ITEM/GetDosageAll', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//根据item_no获取单个用量
export function GetDosageByNo(data, config = {}) {
    return post('/ITEM/GetDosageByNo', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}