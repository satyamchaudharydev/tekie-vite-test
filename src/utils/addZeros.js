const addZeros = num => {
  // Convert input string to a number and store as a variable.
  let value = Number(num);
  value = Math.round((value) * 100) / 100
  // Split the input string into two arrays containing integers/decimals
  const res = value && value.toString() && value.toString().split('.');
  // If there is no decimal point or only one decimal place found.
  if (res && (res.length === 1 || res[1].length < 3)) {
    // Set the number to two decimal places
    value = value && Number.parseFloat(value).toFixed(2);
    value = Number.parseFloat(value);
  }
  // Return updated or original number.
  return value;
}

export default addZeros
