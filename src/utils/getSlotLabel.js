const getSlotLabel = slotName => {
  let slots = {}
  for (let i = 0; i < 24; i++) {
    const currSlotString = 'slot' + i
    if (slotName === currSlotString) {
      slots[currSlotString] = true
    } else {
      slots[currSlotString] = false
    }
  }
  return slots
}

export default getSlotLabel
