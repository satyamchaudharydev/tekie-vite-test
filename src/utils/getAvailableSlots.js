import { get } from 'lodash'
import config from '../config'

export const getSlotsObject = (slotName, count, areAllSlotsOpened = false) => {
  let slots = {}
  for (let i = 0; i < 24; i++) {
    const currSlotString = 'slot' + i
    if (slotName === currSlotString && count > 0) {
      slots[currSlotString] = true
    } else {
      slots[currSlotString] = areAllSlotsOpened ? config.slotsWindow.includes(i) : false
    }
  }
  return slots
}

const mergeSlotsArray = (prevArr, curArr) => {
  for (let i = 0; i < 24; i++) {
    if (prevArr[`slot${i}`]) {
      curArr[`slot${i}`] = prevArr[`slot${i}`]
    }
  }return curArr

}

const getAvailableSlots = (availableSlots) => {
  let slots = []
  availableSlots = availableSlots.map(slot => ({
      ...slot,
      batchSessionsMeta: {
        count: (
          get(slot, 'batchSessions', [])
          || []
        ).length,
      }
    })
  )
  for (let i = 0; i < availableSlots.length; i++) {
    const availableSlot = availableSlots[i];
    const existingSlotIndex = slots.findIndex(slot => slot.date === availableSlot.date);
    const slotCount = get(availableSlot, 'count') - (get(availableSlot, 'menteeSessionsMeta.count') + get(availableSlot, 'batchSessionsMeta.count'))
    if (existingSlotIndex !== -1) {
      slots[existingSlotIndex] = {
        ...availableSlot,
        ...mergeSlotsArray(slots[existingSlotIndex], getSlotsObject(get(availableSlot, 'slotName'), slotCount))
      }
    } else {
      slots.push({
        ...availableSlot,
        ...getSlotsObject(get(availableSlot, 'slotName'), slotCount)
      })
    }
  }
  return slots
}

export default getAvailableSlots
