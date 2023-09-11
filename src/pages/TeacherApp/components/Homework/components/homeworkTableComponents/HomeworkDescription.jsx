import React,{useState} from "react";
import "./HomeworkDescription.scss"

function HomeworkDescription(){

    const [colorBoolean , setColorBoolean] = useState(false)
    const [idContainer , setIdContainer] = useState(0);

const obj = [
    {id:"1",name:"Shailesh pandey", status:"Completed",quiz:"1/20",code:"arrow",action:"view details",comment:"comment"},
    {id:"2",name:"Khabib nurmagomedov", status:"un-attempted",quiz:"2/20",code:"arrow",action:"view details",comment:"comment"},
    {id:"3",name:"Conor mcgregor", status:"Completed",quiz:"5/20",code:"arrow",action:"view details",comment:"comment"},
    {id:"4",name:"Usman khawaja", status:"Completed",quiz:"6/30",code:"arrow",action:"view details",comment:"comment"},
    {id:"5",name:"Israel adesanya", status:"Completed",quiz:"2/20",code:"arrow",action:"view details",comment:"comment"}
]


function colorPicker(id){
  const value =  obj.find(item => item.id === id)
  if(value.id === id){
    setColorBoolean(true)
    setIdContainer(value.id)
  }
}

    return <>
    <section class="Homework_description_main_container">

    {obj.map((item,id) => 
         <div onMouseEnter={()=>{
            colorPicker(item.id)
         }} onMouseLeave={()=>{setIdContainer(null)}} style={ colorBoolean && idContainer === item.id ?{backgroundColor: "rgba(140, 97, 203, 0.1)"}:{backgroundColor:"#FFFFFF"}} class="Homework_description_individual_container">
         <div class="serial_no_Homework_desc">{item.id}</div>
         <div class="session_name_Homework_desc">{item.name}</div>
         <div class="session_type_Homework_desc">{item.status}</div>
         <div class="session_time_Homework_desc">{item.quiz}</div>
         <div class="session_time_Homework_desc">=ar</div>
         <div class="session_date_Homework_desc">{item.code}</div>
         <div class="share_Homework_desc">{item.action}</div>
         <div class="share_Homework_desc">{item.comment}</div>
         </div>
        )}
    </section>
    </>
}

export default HomeworkDescription