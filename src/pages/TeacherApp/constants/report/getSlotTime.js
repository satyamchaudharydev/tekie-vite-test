export const getSelectedSlotsStringArray = (slots = {}) => {
    const slotTimeStringArray = []
    Object.keys(slots).forEach(slot => {
      if (slot.includes('slot')) {
        if (slots[slot]) {
          slotTimeStringArray.push(slot)
        }
      }
    })
    return slotTimeStringArray
}
  

const getSlotLabel = (slotNumberString, isCapital = true) => {
    const slotNumber = Number(slotNumberString)
    let AM = 'AM'
    let PM = 'PM'
    if (!isCapital) {
      AM = 'am'
      PM = 'pm'
    }
    let startTime = ''
    let endTime = ''
    if (slotNumber < 12) {
      if (slotNumber === 0) {
        startTime = `12:00 ${AM}`
      } else {
        startTime = `${slotNumber}:00 ${AM}`
      }
      if (slotNumber === 11) {
        endTime = `12:00 ${PM}`
      } else {
        endTime = `${slotNumber + 1}:00 ${AM}`
      }
    } else if (slotNumber > 12) {
      startTime = `${slotNumber - 12}:00 ${PM}`
      if (slotNumber === 23) {
        endTime = `12:00 ${AM}`
      } else {
        endTime = `${slotNumber - 11}:00 ${PM}`
      }
    } else {
      startTime = `12:00 ${PM}`
      endTime = `1:00 ${PM}`
    }
    return {
      startTime,
      endTime
    }
}

export const getSlotTime = (batchSession) => {
    const slotTimeStringArray = getSelectedSlotsStringArray(batchSession)
    if (slotTimeStringArray && slotTimeStringArray.length) {
        const slotNumber = slotTimeStringArray[0].split('slot')[1]
        const label = getSlotLabel(slotNumber, false)
        return label
    }
    return null
}