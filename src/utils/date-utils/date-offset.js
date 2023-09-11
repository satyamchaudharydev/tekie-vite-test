const offsetDate = (date, numberOfOffsetDays, action) => {
  const offset = (24 * 60 * 60 * 1000) * numberOfOffsetDays
  let modifiedDate = date.setHours(0, 0, 0, 0)
  if (action === 'ADD') {
    modifiedDate = new Date(date.setHours(0, 0, 0, 0) + offset)
  } else if (action === 'SUBTRACT') {
    modifiedDate = new Date(date.setHours(0, 0, 0, 0) - offset)
  }

  return modifiedDate
}

export default offsetDate
