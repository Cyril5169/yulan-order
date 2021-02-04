import { get, post, patch, put } from './httpASP'

//parttype字典
export function GetPartTypeDataTabale(data, config = {}) {
  return post('/NEWCURTAIN_PART_TYPE/GetDataTable', data, config).then((res) => {
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
//获得远程搜索的数据
export function GetAsyncItemData(data, config = {}) {
  return post('/NEWCURTAIN_TEMPLATE/GetAsyncItemData', data, config).then((res) => {
      return Promise.resolve(res);
  }).catch((err) => {
      return Promise.reject(err);
  })
}
