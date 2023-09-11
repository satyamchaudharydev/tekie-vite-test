const getColorBasedOnPercentage = (num) => {
    if (num >= 75) {
        return '#01AA93'
    } else if (num >= 40) {
        return '#FAAD14'
    } else {
        return '#D34B57'
    }
}

export default getColorBasedOnPercentage