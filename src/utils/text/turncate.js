export const truncateStr = (str, length) => {
    if(!str) return str
    if (str.length > length) {
        return str.slice(0, length) + '...'
    }
    return str
    }
