let numberFilter = data =>{
    if(typeof(data) !== 'number')   return '';
    return data.toFixed(2);
}
let dosageFilter = data =>{
    if(typeof(data) !== 'number')   return '';
    return Math.round(data.mul(100)) / 100;
}
function dateFilter(value, format) {
    if (!value || value == "9999-12-31" || value == "9999/12/31" || value == "9999/12/31 00:00:00") return "";
    if (typeof value == "string" && value.indexOf('T') == -1) {
        var reg = new RegExp('-', "g")
        value = value.replace(reg, '/')
    }
    let date = new Date(value);
    let y = date.getFullYear();
    let MM = date.getMonth() + 1;
    MM = MM < 10 ? "0" + MM : MM;
    let d = date.getDate();
    d = d < 10 ? "0" + d : d;
    let h = date.getHours();
    h = h < 10 ? "0" + h : h;
    let m = date.getMinutes();
    m = m < 10 ? "0" + m : m;
    let s = date.getSeconds();
    s = s < 10 ? "0" + s : s;

    const opt = {
        "y+": y, // 年
        "M+": MM, // 月
        "d+": d, // 日
        "H+": h, // 时
        "m+": m, // 分
        "s+": s, // 秒
    };
    if (format) {
        let fmt = format;
        let ret;
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], opt[k])
            };
        };
        return fmt
    }
    return y + "-" + MM + "-" + d; //默认返回这个，需要格式请加格式
}
export {
    numberFilter,
    dosageFilter,
    dateFilter
}