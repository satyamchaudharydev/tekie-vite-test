
export const convertTime = (time) => {
  const date = new Date(time);
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const hoursStr = hours12 < 10 ? `0${hours12}` : hours12;

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${day}-${month}-${date.getFullYear()} | ${hoursStr}:${minutesStr} ${ampm}`;
};

export const convertTimeEvaluation = (time) => {
  if (time) {
    const datetime = new Date(time);
    const date = datetime.getDate()
    const month = datetime.toLocaleString('default', { month: 'long' });
    const year = datetime.getFullYear()
    return `Uploaded on ${date} ${month} ${year}`
  }
};

export const convertTimeGSuit = (time) => {
  if(time){
    const date = new Date(time);
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    return `Last saved on: ${day}-${month}-${date.getFullYear()}`
  }
}