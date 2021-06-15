import { get, post, patch, put } from './httpASP'

//查找文档
export function GetAllFile(data, config = {}) {
    return post('/FILE_CENTER/GetAllFile', data, config).then((res) => {
        return Promise.resolve(res);
    }).catch((err) => {
        return Promise.reject(err);
    })
}