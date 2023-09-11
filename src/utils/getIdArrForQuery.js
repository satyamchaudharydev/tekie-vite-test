const getIdArrForQuery = (idArr) => {
    let arr = ''
    if (idArr) {
        idArr.forEach(id => {
            arr += `"${id}",`
        })
        if (arr.length && arr[arr.length - 1] === ',') {
            arr.substring(0, arr.length - 1)
        }
    }
    return arr
}

export default getIdArrForQuery
