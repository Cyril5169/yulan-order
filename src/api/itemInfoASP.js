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
//通过itemNo和userId查询库存
export function GetStockDataByItemNoAndUser(data, config = {}) {
    return post('/ITEM/GetStockDataByItemNoAndUser', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//通过所有版本
export function GetProductVersionData(data, config = {}) {
    return post('/ITEM/GetProductVersionData', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//通过itemNo和batchNo查询预留
export function GetAllocatByItemAndBatch(data, config = {}) {
    return post('/ITEM/GetAllocatByItemAndBatch', data, config).then((res) => {
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
//窗帘
export function GetCurtainByCondition(data, config = {}) {
    return post('/ITEM/GetCurtainByCondition', data, config).then(res => {
        return Promise.resolve(res);
    }).catch(err => {
        return Promise.reject(err)
    })
}
//软装
export function GetSoftByProductType(data, config = {}) {
    return post('/ITEM/GetSoftByProductType', data, config).then(res => {
        return Promise.resolve(res);
    }).catch(err => {
        return Promise.reject(err)
    })
}
//墙纸查询,type='barcode'为条形码查询
export function GetWallpaperInfo(data, config = {}) {
    return post('/ITEM/GetWallpaperInfo', data, config).then(res => {
        return Promise.resolve(res);
    }).catch(err => {
        return Promise.reject(err)
    })
}
//一口价
export function GetFixPriceShopsByCondition(data, config = {}) {
    return post('/SAL_PROMOTION_SPECIAL/GetFixPriceShopsByCondition', data, config).then(res => {
        return Promise.resolve(res);
    }).catch(err => {
        return Promise.reject(err)
    })
}
export function GetFixPriceShopsByItemNo(data, config = {}) {
    return post('/SAL_PROMOTION_SPECIAL/GetFixPriceShopsByItemNo', data, config).then(res => {
        return Promise.resolve(res);
    }).catch(err => {
        return Promise.reject(err)
    })
}
export function GetProductVersion(data, config = {}) {
    return post('/SAL_PROMOTION_SPECIAL/GetProductVersion', data, config).then(res => {
        return Promise.resolve(res);
    }).catch(err => {
        return Promise.reject(err)
    })
}
//获得热销榜
export function GetHotSales(data, config = {}) {
    return post('/HOTSALES/GetHotSales', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获得报备
export function GetSalPutonRecord(data, config = {}) {
    return post('/ITEM/GetSalPutonRecord', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获得墙纸库存
export function GetItemStock(data, config = {}) {
    return post('/ITEM/GetItemStock', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获得墙纸库存判断
export function GetItemStoreCheckData(data, config = {}) {
    return post('/ITEM/GetItemStoreCheckData', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获得生产状态
export function GetProductStatus(data, config = {}) {
    return post('/ITEM/GetProductStatus', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获得外销限价
export function GetLimitPriceByProVersion(data, config = {}) {
    return post('/ITEM/GetLimitPriceByProVersion', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获得旧窗帘可替换列表
export function GetChangeItemByProductType(data, config = {}) {
    return post('/ITEM/GetChangeItemByProductType', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//面料提示
export function GetMLTipByList(data, config = {}) {
    return post('/ITEM_NOTE/GetMLTipByList', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//墙板运费预估，获取全部省份
export function GetProvinceDataList(data, config = {}) {
    return post('/WL_MONEY/GetProvinceDataList', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//墙板运费预估，获取计算的数据
export function GetFeeEstimateByProvince(data, config = {}) {
    return post('/WL_MONEY/GetFeeEstimateByProvince', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
