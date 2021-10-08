import { get, post, patch, put} from './http'

//获取银行列表 
export function getBankList(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}


//获取详细汇款凭证
export function getPayBillContent(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}


// //生成流水号
// export function getPayId(url,data){
//     return post(url,data).then((res) => {
//         return Promise.resolve(res);
//     }).catch((err) =>{
//         return Promise.reject(err);
//     })
// }

//修改凭证状态
export function changeStatus(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}

//提交或者修改
export function sumbitForm(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}


//提交或者修改
export function getHistory(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}

