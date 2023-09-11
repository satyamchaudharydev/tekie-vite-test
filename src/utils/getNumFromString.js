const getNumFromString = (str, type = 'num') => {
    if(type === 'str') return str.replace(/[^0-9]/g, '');
    return str.replace(/[^0-9]/g, '') * 1;
}
export default getNumFromString
