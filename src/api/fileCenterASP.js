import { get, post, patch, put } from './httpASP'

var baseUrl = 'http://47.107.56.156:1001/';//测试
//var baseUrl = 'http://14.29.223.114:1001/';//正式

//查找文档
export function GetAllFile(data, config = {}) {
    return post('/FILE_CENTER/GetAllFile', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}