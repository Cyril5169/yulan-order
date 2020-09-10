let numberFilter = data =>{
    if(typeof(data) !== 'number')   return '';
    return data.toFixed(2);
}
let dosageFilter = data =>{
    if(typeof(data) !== 'number')   return '';
    return Math.round(data.mul(100)) / 100;
}
export {
    numberFilter,
    dosageFilter
}