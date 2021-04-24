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
//插入退货赔偿记录
export function InsertCompensationOld(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/InsertCompensationOld', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//查找所有的退货赔偿记录（原）
export function GetAllCompensationOld(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetAllCompensationOld', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//查找所有的退货赔偿记录（新需求）
export function GetAllCompensation(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetAllCompensation', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//查找当前用户的退货赔偿记录（新需求）
export function GetUserCompensation(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetUserCompensation', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//查找退货赔偿记录和明细(原)
export function GetCompensationByIdBefore(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetCompensationByIdBefore', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//查找退货赔偿记录和明细(新需求)
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
//查找未打印退货赔偿记录
export function GetNoPrinted2(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetNoPrinted2', data, config).then((res) => {
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
//更新玉兰处理意见
export function UpdateFirstAudition(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/UpdateFirstAudition', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//更新玉兰处理结果
export function UpdateProcess(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/UpdateProcess', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//更新玉兰处理意见
export function ApprovedUpdate(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/ApprovedUpdate', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//退回修改
export function SendBackUpdate(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/SendBackUpdate', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//检查某订单某型号的产品是否有退货赔偿的记录
export function CheckOrderAndItemNo(data, config = {}) {
    return post('/PACK_DETAIL/CheckOrderAndItemNo', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//根据输入的订单号获取相应的产品型号集合
export function GetItemArray(data, config = {}) {
    return post('/PACK_DETAIL/GetItemArray', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//上传附件
export function NewUploadFiles(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/NewUploadFiles', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function GetUserAfterSale(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetUserAfterSale', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function GetAllAfterSale(data, config = {}) {
    return post('/RETURNCOMPENSATIONBILL/GetAllAfterSale', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
