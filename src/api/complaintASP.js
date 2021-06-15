import { get, post, patch, put } from './httpASP'

//加载所有用户的投诉信息
export function GetAllComplaintInfo(data, config = {}) {
    return post('/Complaint/GetAllComplaintInfo', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//查询满足相应条件的所有用户的投诉信息
export function GetAllUserComplaint(data, config = {}) {
    return post('/Complaint/GetAllUserComplaint', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//查询满足相应条件的当前用户的投诉信息
export function GetAllComplaint(data, config = {}) {
    return post('/Complaint/GetAllComplaint', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//提交或者修改投诉单
export function addSubmit(data, config = {}) {
    return post('/Complaint/AddRecord', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//提交或者修改投诉单
export function editSubmit(data, config = {}) {
    return post('/Complaint/EditRecord', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//查看投诉单详情
export function CheckDetailByID(data, config = {}) {
    return post('/Complaint/CheckDetailByID', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//得到公司名
export function GetCustomerName(data, config = {}) {
    return post('/Complaint/GetCustomerName', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获得pack_detail中某单据出货的总数量
export function GetQtyDeliver(data, config = {}) {
    return post('/Complaint/GetQtyDeliver', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//查询是否已经对该订单该型号产品进行投诉
export function CheckOrderAndItemNo(data, config = {}) {
    return post('/Complaint/CheckOrderAndItemNo', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

