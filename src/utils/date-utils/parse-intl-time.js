import getSlotLabel from '../slots/slot-label'

const minutesParser = (value) => Math.floor(value*60)

const getAction = (value) => value < 0 ? 'ADD' : 'SUBTRACT'

const getSlotLabelWithMinutes = (hrs, min) => {
    let startTime = getSlotLabel(hrs).startTime
    min = min.toString().length == 1 ? '0' + min.toString() : min.toString()
    startTime = startTime.replace(' ', ':' + min + ' ')
    return startTime
}

const getSelectedHrsWithOffset = (selectedSlot, action, offsetHrs, selectedMin) => {
    let selectedHrs = 0
    if (action == 'ADD') {
        selectedHrs = selectedSlot + Math.floor(offsetHrs) > 23
            ? (selectedSlot + Math.floor(offsetHrs)) - 24
            : selectedSlot + Math.floor(offsetHrs)
    } else if (action == 'SUBTRACT') {
        selectedHrs = selectedSlot - Math.floor(offsetHrs) < 0
            ? (selectedSlot - Math.floor(offsetHrs)) + 24
            : selectedSlot + Math.floor(offsetHrs)
        if (selectedMin > 0) {
            selectedHrs -= 1
        }
    }

    return selectedHrs
}


export {
    minutesParser,
    getAction,
    getSlotLabelWithMinutes,
    getSelectedHrsWithOffset
}
