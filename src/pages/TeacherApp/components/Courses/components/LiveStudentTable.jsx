import React from "react"
import "./LiveStudentTable.scss"
import DataTable from "../../../../SchoolDashboard/components/DataTable/DataTable"
import ArrowImage from "../../../../../assets/teacherApp/classroom/arrow-forward-outline.svg"
import Code from "../../../../../assets/teacherApp/classroom/Group 16678.svg"
import Arrow from "../../../../../assets/teacherApp/classroom/Group 16452.svg"
import VideoIcon from "../../../../../assets/teacherApp/classroom/Group 16764.svg"
import ChatIcon from "../../../../../assets/teacherApp/classroom/Group 16673.svg"
import QuestionIcon from "../../../../../assets/teacherApp/classroom/Group 16763.svg"
import PinIcon  from "../../../../../assets/teacherApp/classroom/Frame.svg"
import HomeworkTable from "../../Homework/components/HomeworkSelectTable"
import Filter from "./DropdownSort"
import Sort from "./DropdownFilter"
import SearchIcon from "../../../../../assets/teacherApp/classroom/Search.svg"



function LiveStudentTable(){

const data =[
            {id:"1",name:"birdie" , attendance:"TRUE" , status:"active", video:"video", chat:"chat",quiz:"quiz",code:"code",quizScore:"quizscore",codeOutput:"codeOutput"},
            {id:"2",name:"shilpa" , attendance:"TRUE" , status:"active", video:"ocbibci", chat:"chat",quiz:"quiz",code:"code",quizScore:"quizscore",codeOutput:"codeOutput"},
            {id:"3",name:"pasha" , attendance:"TRUE" , status:"inactive", video:"pandey", chat:"chat",quiz:"quiz",code:"code",quizScore:"quizscore",codeOutput:"codeOutput"},  
]

const tableData = data.map(item =>  ({
    id:item.id,
    studentname:item.name,
    attendance:item.attendance,
    status:item.status,
    video:item.video,
    chat:item.chat,
    quiz:item.quiz,
    code:item.code,
    quizScore:item.quizScore,
    codeOutput:item.codeOutput
})) 

const pop = (
    <div></div>
)

const allStudentColumns = [
    {
        title:"Pin",
        key:"Pin",
        render:()=>{
            return <>
            <img src={PinIcon} />
            </>
        }
    },
    {
        title:(
            <img src={VideoIcon} />

        ),
            

        
        
        key:"studentname"
    },
    {
        title:"Attendance",
        key:"attendance"
    },
    {
        title:"Status",
        key:"status",
        render:(status)=>{
            return <>
            <div style={status === "active" ? {color: "#166453" , fontSize:"12px"} :{color:"#FF5744", fontSize:"12px"}}>{status.toUpperCase()}</div>
            </>
        }
    },
    {
        title:"Video",
        key:"video",
        render:()=>{
            return <>
            <img src={VideoIcon} />
            </>
        }
    },
    {
        title:" ",
        key:null,
        render:()=>{
            return <>
            <img src={ArrowImage}/>
            </>
        },
    },
    {
        title:"Chat",
        key:"chat",
        render:()=>{
            return <>
            <img src={ChatIcon}/>
            </>
        },
    },
    {
        title:" ",
        key:null,
        render:()=>{
            return <>
            <img src={ArrowImage}/>
            </>
        },
    },
    {
        title:"Quiz",
        key:"quiz",
        render:()=>{
            return <>
            <img src={QuestionIcon}/>
            </>
        },
    },
    {
        title:" ",
        key:null,
        render:()=>{
            return <>
            <img src={ArrowImage}/>
            </>
        },
    },
    {
        title:"Code",
        key:"code",
        render:()=>{
            return <>
            <img src={Arrow }/>
            
            </>
        }

    },
    {
        title:"Quiz Score",
        key:"quizScore",
        render:()=>{
            return <>
                <div style={{color:"#8C61CB"}}>Check Score</div>
            </>
        }
    },
    {
        title:"Code output",
        key:"codeOutput",
        render:()=>{
            return <>
                <div style={{color:"#8C61CB"}}>Check OutputF</div>
            </>
        }
    },
]


    return <>

    <section class="student_table_section">

<div class="heading_table_live">Live Student Progress</div>

<div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",height:"80px",zIndex:"1",position:"relative"}}>

<div class="search_bar">
                        <input class="input_search_tag" placeholder="Search" /> 
                        <img src={SearchIcon} />
                    </div>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",height:"120px"}}>
    <Filter />
        <Sort />
    </div>
</div>

    
    
    <div style={{zIndex:"0",position:"relative"}}>
    <DataTable
        columns={allStudentColumns}
        tableData={tableData}
        tableHeight='60vh'
     /></div>    
    
    </section>
       
    </>
}

export default LiveStudentTable