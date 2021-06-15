import { get, post, patch, put } from './httpASP'

//查询满足相应条件的当前用户的兰居软装设计申请记录
export function GetAllData(data, config = {}) {
    return post('/Lanju/GetAllData', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
} 

//查询满足相应条件的所有用户的兰居软装设计申请记录
export function GetAllUserData(data, config = {}) {
    return post('/Lanju/GetAllUserData', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}


//提交申请单
export function addSubmit(data,config = {}) {
    return post('/Lanju/AddRecord', data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}


//市场部和广美修改申请单
export function editSubmit(data, config = {}) {
    return post('/Lanju/EditRecord', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//供应商修改申请单
export function editByCustomer(data,config = {}) {
    return post('/Lanju/EditByCustomer', data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}


//查看兰居软装设计单详情
export function CheckDetailByID(data, config = {}) {
    return post('/Lanju/CheckDetailByID', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//新增单据时得到系统带出的信息
export function GetInitialInfo(data, config = {}) {
    return post('/Lanju/GetInitialInfo', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}



