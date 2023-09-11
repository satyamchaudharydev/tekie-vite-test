const getSlotNames = () => {
    let slots = ''
    for (let i = 0; i < 24; i += 1) {
        slots += `slot${i}\n`
    }
    return slots
}

const getSelectiveSlotNames = (slotNumberArray) => {
    const slotNamesArray = []
    const slotNameObj = {}
    if (slotNumberArray && slotNumberArray.length > 0) {
        for (let i = 0; i < 24; i += 1) {
            if (slotNumberArray.includes(i)) {
                slotNamesArray.push(`slot${i}`)
                slotNameObj[`slot${i}`] = true
            } else {
                slotNameObj[`slot${i}`] = false
            }
        }
    }
    return {
        slotNamesArray,
        slotNameObj
    }
}

export {
    getSlotNames,
    getSelectiveSlotNames
}
