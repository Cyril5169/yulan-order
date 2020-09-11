import { get, post, patch, put } from './httpASP'

export function GetPoDetail(data, config = {}) {
    return post('/PUR_HEAD/GetPoDetail', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function GetPoDetail_1(data, config = {}) {
    return post('/PUR_HEAD/GetPoDetail_1', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function GetRelativePo(data, config = {}) {
    return post('/PUR_HEAD/GetRelativePo', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function GetTransDetail(data, config = {}) {
    return post('/PUR_HEAD/GetTransDetail', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function SaveHeadNotes(data, config = {}) {
    return post('/PUR_HEAD/SaveHeadNotes', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function Submit(data, config = {}) {
    return post('/PUR_HEAD/Submit', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function SubmitX(data, config = {}) {
    return post('/PUR_HEAD/SubmitX', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function AsyncBuJingLing(data, config = {}) {
    return post('/PUR_HEAD/AsyncBuJingLing', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function GetBJLData(data, config = {}) {
    return post('/PUR_HEAD/GetBJLData', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function UpdateCheckFlag(data, config = {}) {
    return post('/PUR_HEAD/UpdateCheckFlag', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function UpdatePartDetail(data, config = {}) {
    return post('/PUR_HEAD/UpdatePartDetail', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
export function UpdateCheckFlagBatch(data, config = {}) {
    return post('/PUR_HEAD/UpdateCheckFlagBatch', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

export function CreateExcel(data, config = {}) {
    return post('/PUR_HEAD/CreateExcel', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}



//付款委托书查询表头
export function GetRelativePay(data, config = {}) {
    return post('/PUR_HEAD/GetRelativePay', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//付款委托书查询明细
export function CheckDetailByID(data, config = {}) {
    return post('/PUR_HEAD/CheckDetailByID', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//客户上传附件
export function editByCustomer(data,config = {}) {
    return post('/PUR_HEAD/EditByCustomer', data,config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//兰居审核付款委托书
export function editSubmit(data, config = {}) {
    return post('/PUR_HEAD/EditRecord', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}


//查询当前用户的付款委托书表头信息
export function GetCurrentDelegation(data, config = {}) {
    return post('/PUR_HEAD/GetCurrentDelegation', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}


//查询所有用户的付款委托书表头信息
export function GetAllDelegation(data, config = {}) {
    return post('/PUR_HEAD/GetAllDelegation', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

export function GetRelativeDelivery(data, config = {}) {
    return post('/PUR_HEAD/GetRelativeDelivery', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

export function GetDeliveryDetail(data, config = {}) {
    return post('/PUR_HEAD/GetDeliveryDetail', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

export function AddDelivery(data, config = {}) {
    return post('/PUR_HEAD/AddDelivery', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

export function UpdateDelivery(data, config = {}) {
    return post('/PUR_HEAD/UpdateDelivery', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

export function DeleteDelivery(data, config = {}) {
    return post('/PUR_HEAD/DeleteDelivery', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//修改已确认单的打印标志
export function UpdatePrintedById(data, config = {}) {
    return post('/PUR_HEAD/UpdatePrintedById', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}

//查找未打印记录
export function GetNoPrinted(data, config = {}) {
    return post('/PUR_HEAD/GetNoPrinted', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}