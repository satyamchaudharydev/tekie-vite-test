import React, { useState } from "react";
import "./RecordingDescription.scss"
import { PlayButton } from "../../../../../constants/icons";
import { get } from 'lodash'
import { getDuration } from "../../../../../utils/getDuration"

function RecordingDescription({ value, searchTerm }) {

  const [idContainer , setIdContainer] = useState()
  const [colorBoolean , setColorBoolean ] = useState(false)
  const {recordingBatches} = value
  const newObject = recordingBatches.toJS() 
  
const withHttps = (url) => url ? url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => schemma ? match : `https://${nonSchemmaUrl}`) : '';
  

function recordingDate(dateNew){
  const date = new Date(dateNew)
  const currentDate = date.getDate()
  const currentMonth = date.getMonth()
  const currentYear = date.getFullYear().toString().slice(2)
  let value1;

  const array =["01","02","03","04","05","06","07","08","09","10","11","12"]
 
  for(let i=0;i<array.length;i++){
    if(i === currentMonth){
      value1 = array[i]
    }
  }
  return `${currentDate}/${value1}/${currentYear}`
}

const pop = newObject.filter(val => {
  if( searchTerm == ""){    
      return val
  }else if ( get(val, 'topicData.title', "").toLowerCase().includes(searchTerm.toLowerCase()) ){
      return val
  } 
})

const showsec = false

function colorPicker(id){
  const value =  newObject.find(item => item.id === id)
  
  if(value.id === id){
    setColorBoolean(true)
    setIdContainer(value.id)
  }
}
function notColorPicker(id){
  const value =  newObject.find(item => item.id === id)
  
  if(value.id === id){
    setColorBoolean(false)
    setIdContainer("")
  }
}

function EmptyRecordingState(){
  return <>
  <div class="empty_recording_state">No recordings available to show</div>
  </>
}
    return <>
    <section class="recording_description_main_container">

      {newObject.length == 0 ? <EmptyRecordingState /> : 
    
      pop.length == 0 ? <div className="empty_search_handle">No recording found</div> :
      <div>
    {newObject.filter(val => {
        if( searchTerm == ""){    
            return val
        }else if ( get(val, 'topicData.title', "").toLowerCase().includes(searchTerm.toLowerCase()) ){
            return val
        } 
    }) .map((item,index) => 
         
         <div onMouseEnter={()=>colorPicker(item.id)} onMouseLeave={()=>notColorPicker(item.id)} style={colorBoolean && item.id === idContainer ?{backgroundColor:"#FAF7FF"}:{backgroundColor:"#FFFFFF"}} class="recording_description_individual_container">
         
        
         <div class="serial_no_recording_desc">{colorBoolean && item.id === idContainer? <a href={withHttps(item.sessionRecordingLink)} target='_blank' rel="noopener noreferrer"><PlayButton/></a>  :index+1}</div>
         <div class="session_name_recording_desc">
         {get(item , "topicData.title","")}
         </div>
         <div class="session_type_recording_desc">-</div>
         <div class="session_time_recording_desc">
          {getDuration(item.sessionStartDate,item.sessionEndDate,showsec)}
         </div>
         <div class="session_date_recording_desc">
         {recordingDate(item.bookingDate)}
         </div>
         </div>
        )}
        </div>
       
}
    </section>
    </>
}

export default RecordingDescription