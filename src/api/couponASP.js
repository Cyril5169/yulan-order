import { get, post, patch, put } from './httpASP'

//获得所有优惠券
export function GetAllCoupon(data, config = {}) {
  return post('/SAL_REBATE_CERTIFICATE/GetAllCoupon', data, config).then((res) => {
    return Promise.resolve(res);
  }).catch((err) => {
    return Promise.reject(err);
  })
}
//获得能用的优惠券
export function GetCanUseCoupon(data, config = {}) {
  return post('/SAL_REBATE_CERTIFICATE/GetCanUseCoupon', data, config).then((res) => {
    return Promise.resolve(res);
  }).catch((err) => {
    return Promise.reject(err);
  })
}
//优惠券使用记录
export function getUseRecord(data, config = {}) {
    return post('/SAL_REBATE_CERTIFICATE_RECORD/getUseRecord', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//使用记录汇总
export function getTotalRecordSum(data, config = {}) {
    return post('/SAL_REBATE_CERTIFICATE_RECORD/getTotalRecordSum', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}
//获得返利记录
export function GetSalReturnRecord(data, config = {}) {
  return post('/SAL_RETURN_RECORD/GetSalReturnRecord', data, config).then((res) => {
    return Promise.resolve(res);
  }).catch((err) => {
    return Promise.reject(err);
  })
}
