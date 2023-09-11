
const getTimeFromSlot=(session)=>{
    let trueSlot
for(let key in session){
    if(key.includes('slot')){
        if(session[key]){
            trueSlot=key
        }
    }
}
const trueSlotNumber = trueSlot.substring(4)  // using 4 coz, 'slot' has 4 letters
return new Date(new Date().setHours(trueSlotNumber, 0, 0, 0)).toISOString()
}

export default getTimeFromSlot