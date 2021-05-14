import { get, post, patch, put } from './httpASP'

//parttype字典
export function GetPartTypeDataTable(data, config = {}) {
  return post('/NEWCURTAIN_PART_TYPE/GetDataTable', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//params集合
export function GetNewCurtainParams(data, config = {}) {
  return post('/NEWCURTAIN_PARAM/GetNewCurtainParams', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//通过帘款获得窗帘结构
export function GetCurtainTemplateAndModel(data, config = {}) {
  return post('/NEWCURTAIN_TEMPLATE/GetCurtainTemplateAndModel', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//获得远程搜索的帘款数据
export function GetAsyncItemData(data, config = {}) {
  return post('/NEWCURTAIN_TEMPLATE/GetAsyncItemData', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//获得替换的组件数据
export function GetExchangeModel(data, config = {}) {
  return post('/NEWCURTAIN_TEMPLATE_MODEL/GetExchangeModel', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//获得替换的子件数据
export function GetExchangeModelItem(data, config = {}) {
  return post('/NEWCURTAIN_MODEL_ITEM/GetExchangeModelItem', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//加入购物车
export function AddNewCurtainToCart(data, config = {}) {
  return post('/CART_ITEM/AddNewCurtainToCart', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//修改购物车
export function UpdateNewCurtainCart(data, config = {}) {
  return post('/CART_ITEM/UpdateNewCurtainCart', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//修改，退回，客户修改，审核通过
export function newCurtainUpdateCurtainOrder(data, config = {}) {
  return post('/CTM_ORDER/newCurtainUpdateCurtainOrder', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//购物车窗帘详情
export function GetNewCurtainDetail(data, config = {}) {
  return post('/CART_ITEM/GetNewCurtainDetail', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//导出生产模板
export function newCurtainExportProductExcel(data, config = {}) {
  return post('/CTM_ORDER/newCurtainExportProductExcel', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//采购单明细（工单）
export function GetPurOrderDetails(data, config = {}) {
  return post('/PUR_HEAD/GetPurOrderDetails', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
//停产新闻
export function GetStopProductionData(data, config = {}) {
  return post('/STOP_PRODUCTION_ITEM/GetStopProductionData', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
