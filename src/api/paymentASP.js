import { get, post, patch, put } from './httpASP'
//银行汇款，委托喷绘，退货赔偿都放在这里
//根据id查找汇款单
export function GetPaymentById(data, config = {}) {
    return post('/PAYMENT_BILL/GetPaymentById', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//插入委托喷绘记录
export function InsertBrush(data, config = {}) {
    return post('/AIRBRUSHDESIGNREASSURE/InsertBrush', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//插入退货赔偿记录
export function InsertCompensation(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/InsertCompensation', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//查找退货赔偿记录
export function GetAllCompensation(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetAllCompensation', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//根据查找退货赔偿记录和明细
export function GetCompensationById(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetCompensationById', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//查找未打印退货赔偿记录
export function GetNoPrinted(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetNoPrinted', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//修改退货赔偿记录打印标识
export function UpdatePrintedById(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/UpdatePrintedById', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//更新退货赔偿记录
export function UpdateCompensation(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/UpdateCompensation', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//删除退货赔偿记录
export function DeleteCompensation(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/DeleteCompensation', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//修改退货赔偿记录状态
export function UpdateState(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/UpdateState', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}