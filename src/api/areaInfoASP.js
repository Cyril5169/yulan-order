import { get, post, patch, put } from './httpASP'
//根据用户ID查找用户区域
export function getAreaCode(data, config = {}) {
    return post('/PACK_DETAIL/getAreaCode', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//通过区域查片区
export function getDistrictByAreaCode(data, config = {}) {
    return post('/PACK_DETAIL/getDistrictByAreaCode', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//通过区域查客户
export function getCustomerByAreaCode(data, config = {}) {
    return post('/PACK_DETAIL/getCustomerByAreaCode', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function getCustomerByAreaCode2(data, config = {}) {
    return post('/PACK_DETAIL/getCustomerByAreaCode2', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//通过提货单查详情
export function getPackDetailsBySaleNo(data, config = {}) {
    return post('/PACK_DETAIL/getPackDetailsBySaleNo', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//根据时间及客户编码查提货单
export function getPackDetails(data, config = {}) {
    return post('/PACK_DETAIL/getPackDetails', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//获取所有提货单类型
export function getPackDetailsType(config = {}) {
    return post('/PACK_DETAIL/getPackDetailsType',config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//获取用户名称
export function getCustomerName(data,config = {}) {
    return post('/PACK_DETAIL/getCustomerName',data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//获取所选用户总金额
export function getTotalMoneySum(data,config = {}) {
    return post('/PACK_DETAIL/getTotalMoneySum',data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//获取所有版本
export function getAllVersion(config = {}) {
    return post('/PACK_DETAIL/getAllVersion',config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//获取销售提货单信息
export function getProductSales(data,config = {}) {
    return post('/PACK_DETAIL/getProductSales',data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//获取销售提货单信息金额汇总
export function getSumMoneyBySales(data,config = {}) {
    return post('/PACK_DETAIL/getSumMoneyBySales',data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//获取提货单信息金额汇总
export function getPackData(data,config = {}) {
    return post('/PACK_DETAIL/getPackData',data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

export function getCustomerData(data,config = {}) {
    return post('/CUSTOMER/getCustomerData',data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}