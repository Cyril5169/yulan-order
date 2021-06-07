import { get, post, patch, put } from './httpASP'

//查询参数
export function GetSupplySetting(data, config = {}) {
  return post('/PUR_SUPPLY_SETTING/GetSupplySetting', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//查询周期数据
export function GetSafeStockData(data, config = {}) {
  return post('/PUR_PLAN_BASE/GetSafeStockData', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//查询本月数据
export function GetPlanBaseByMounth(data, config = {}) {
  return post('/PUR_PLAN_BASE/GetPlanBaseByMounth', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//插入数据
export function InsertPlanBaseList(data, config = {}) {
  return post('/PUR_PLAN_BASE/InsertPlanBaseList', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//预警查询
export function GetNewPlanBaseData(data, config = {}) {
  return post('/PUR_PLAN_BASE/GetNewPlanBaseData', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//插入需求计划表
export function InsertPurPlanList(data, config = {}) {
  return post('/PUR_PLAN/InsertPurPlanList', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//查询需求计划
export function GetPurPlanListByCondition(data, config = {}) {
  return post('/PUR_PLAN/GetPurPlanListByCondition', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//修改需求计划
export function EditPruPlan(data, config = {}) {
  return post('/PUR_PLAN/EditPruPlan', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//手工新增需求计划
export function InsertPurPlanByHand(data, config = {}) {
  return post('/PUR_PLAN/InsertPurPlanByHand', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//删除需求计划单
export function DeletePurPlan(data, config = {}) {
  return post('/PUR_PLAN/DeletePurPlan', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}