
const compareDateTime=(d1=new Date(),d2=new Date(),typeOfComparison='greaterThan')=>{
    if(d1&&d2){
        if(typeOfComparison==='greaterThan') return d1.getTime()>d2.getTime()
        if(typeOfComparison==='smallerThan') return d1.getTime()<d2.getTime()
        if(typeOfComparison==='equalsTo') return d1.getTime()===d2.getTime()
    }
    return false
}

export default compareDateTime