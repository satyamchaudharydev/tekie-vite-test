
const removeQuoteInArrForQuery = (arr = []) => {
    let arrCopy = [...arr]
    for (let i = 0; i < arrCopy.length; i++) {
        if (arrCopy[i]) arrCopy[i].replaceAll("'", "");
    }
    return arrCopy
}

export default removeQuoteInArrForQuery