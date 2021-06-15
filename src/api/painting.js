import { get, post, patch, put} from './http'
import Cookies from 'js-cookie'



//角标数据
export function getIconNumber(data){
    let url = 'http://14.29.223.114:10250/yulan-capital/AirbrushDesignerAssure/getAirbrushDesignerAssure.do';
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}







//流水号和客户信息
export function getWaterNumber(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}

//获取喷绘列表 
export function getPaintingList(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}

//增加喷绘列表 
export function AddPainting(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}
//删除喷绘列表 
export function DeletePainting(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}

//确认与否 
export function changeStatus(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}

//增加图片
export function AddImage(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}
//增加图片
export function getPictureList(url,data){
    return post(url,data).then((res) => {
        return Promise.resolve(res);
    }).catch((err) =>{
        return Promise.reject(err);
    })
}
