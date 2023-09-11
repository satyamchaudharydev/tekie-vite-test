
const getGrade = (grade) => {
  return grade
}

const getDateAndDayString=(str)=>{
  if(str){
    const y = str.split(',')
    const day = y[0]
    const date = y[1]
    let modDate=date.split(' ')
    modDate = modDate.filter(str=>str!=='')
    modDate = modDate.reverse().slice(0,2).join(' ')
    return day+', '+modDate
  }
}

export {getGrade,getDateAndDayString}