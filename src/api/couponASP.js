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