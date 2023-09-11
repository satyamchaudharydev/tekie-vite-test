const getSlotLabel = (slotNumber, options = { appendMinutes: false }) => {
    let startTime = ''
    let endTime = ''
    let minutesString = ''
    if (options && options.appendMinutes) {
        minutesString = ':00'
    }
    if (slotNumber < 12) {
        if (slotNumber === 0) {
            startTime = `12${minutesString} am`
        } else {
            startTime = `${slotNumber}${minutesString} am`
        }
        if (slotNumber === 11) {
            endTime = `12${minutesString} pm`
        } else {
            endTime = `${slotNumber + 1}${minutesString} am`
        }
    } else if (slotNumber === 12) {
        startTime = `12${minutesString} pm`
        endTime = `1${minutesString} pm`
    } else if (slotNumber > 12) {
        startTime = `${slotNumber - 12}${minutesString} pm`
        if (slotNumber === 23) {
            endTime = `12${minutesString} am`
        } else {
            endTime = `${slotNumber - 11}${minutesString} pm`
        }
    }
    return {
        startTime,
        endTime
    }
}

export default getSlotLabel
