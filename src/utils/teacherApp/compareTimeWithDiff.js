const compareTimeWithDiff=(d1,d2,diff=600000)=>{
  
 return d1.getTime() - d2.getTime()<=diff
}

export default compareTimeWithDiff