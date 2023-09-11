import React from "react"
import DataTable from "../../SchoolDashboard/components/DataTable/DataTable"
import ArrowImage from "../../../assets/teacherApp/classroom/arrow-forward-outline.svg"
import Arrow from "../../../assets/teacherApp/classroom/Group 16452.svg"
import Code from "../../../assets/teacherApp/classroom/Group 16678.svg"
import grayCode from "../../../assets/teacherApp/classroom/Group 16775.svg"
import QuizImage from "../../../assets/teacherApp/classroom/Qyuz Status.svg"
// import Code from "../../../../../../assets/teacherApp/classroom/Group 16678.svg"
import ShareIcon from "../../../assets/teacherApp/classroom/Component 29.svg"
import AttemptedIcon from "../../../assets/teacherApp/classroom/Doublw Check.svg"
import AttemptingIcon from "../../../assets/teacherApp/classroom/Timer (1).svg"
import unAttemptedIcon from "../../../assets/teacherApp/classroom/Warning.svg"
import grayArrow from "../../../assets/teacherApp/classroom/grayArrow.svg"
import { get } from "lodash"

export const updateTableQuiz = [
    {
        title: "Roll no.",
        key: "id",
    }, {
        title: "Student Name",
        key: "studentname",
    },
    {
        title: "Status",
        key: "status",
        render: (value) => {
            return <>
                <div style={value === "completed" ? {
                    color: "#166453", background: "#F8FFF9",
                    borderRadius: "4px", padding: "1px 4px", width: "fit-content", fontSize: "12px"
                } : value === "attempting" ?
                    {
                        color: "#7D3F3A", background: "#FFFAF0",
                        borderRadius: "4px", padding: "1px 4px", width: "fit-content", fontSize: "12px"
                    } : value === "unattempted" ?
                        {
                            color: "#FF5744", background: "#FFF5F3",
                            borderRadius: "4px", padding: "1px 4px", width: "fit-content", fontSize: "12px"
                        } : {}} >
                    <img style={{ marginRight: "5px" }} src={value === "completed" ? AttemptedIcon : value === "attempting" ? AttemptingIcon : value === "unattempted" ? unAttemptedIcon : ""} />
                    {value.toUpperCase()}</div>
            </>
        },

    },
    {
        title: "Code",
        key: "code",
        render: (codeBoolean) => {
            return <>
                {codeBoolean ? <img src={Arrow} />: <img src={grayCode} />}
                
            </>
        }
    },
    {
        title: " ",
        key: "arrow2",
        render: (codeBoolean) => {
            return <>
                <div>
                    {codeBoolean 
                        ?
                        <img src={ArrowImage} />
                        :
                        <img src={grayArrow} />
                    }
                </div>
            </>
        },
    },{
        title: "Practice",
        key: "code",
        render: (codeBoolean) => {
            return <>
                {codeBoolean ? <img src={Arrow} />: <img src={grayCode} />}
                
            </>
        }
    },
        {
            title: "Action",
            key: "action",
            render: (action) => {
                return <>
                    <div style={{ color: "#8C61CB" }}>{action}</div>
                </>
            }
        },
        {
            title: "Comment",
            key: "comment",
            render: () => {
                return <>
                    <div><img src={ShareIcon}/> </div>
                </>
            }
        
        },

]


export const allStudentSelectColumns1 = [
    {
        title: "Roll no.",
        key: "id",
    }, {
        title: "Student Name",
        key: "studentname",
    },
    {
        title: "Status",
        key: "status",
        render: (value) => {
            return <>
                <div style={value === "completed" ? {
                    color: "#166453", background: "#F8FFF9",
                    borderRadius: "4px", padding: "1px 4px", width: "fit-content", fontSize: "12px"
                } : value === "attempting" ?
                    {
                        color: "#7D3F3A", background: "#FFFAF0",
                        borderRadius: "4px", padding: "1px 4px", width: "fit-content", fontSize: "12px"
                    } : value === "unattempted" ?
                        {
                            color: "#FF5744", background: "#FFF5F3",
                            borderRadius: "4px", padding: "1px 4px", width: "fit-content", fontSize: "12px"
                        } : {}} >
                    <img style={{ marginRight: "5px" }} src={value === "completed" ? AttemptedIcon : value === "attempting" ? AttemptingIcon : value === "unattempted" ? unAttemptedIcon : ""} />
                    {value.toUpperCase()}</div>
            </>
        },

    },
    
    {
        title: " ",
        key: "arrow1",
        render: (quizBoolean) => {
            return <>
                <div>
                    {quizBoolean 
                        ?
                        <img src={ArrowImage} />
                        :
                        <img src={grayArrow} />
                    }
                </div>
            </>
        },
    },
    {
        title: "Code",
        key: "code",
        render: (codeBoolean) => {
            return <>
                {codeBoolean ? <img src={Arrow} />: <img src={grayCode} />}
                
            </>
        }
    },
    {
        title: " ",
        key: "arrow2",
        render: (codeBoolean) => {
            return <>
                <div>
                    {codeBoolean 
                        ?
                        <img src={ArrowImage} />
                        :
                        <img src={grayArrow} />
                    }
                </div>
            </>
        },
    },{
        title: "Practice",
        key: "code",
        render: (codeBoolean) => {
            return <>
                {codeBoolean ? <img src={Arrow} />: <img src={grayCode} />}
                
            </>
        }
    },
        {
            title: "Action",
            key: "action",
            render: (action) => {
                return <>
                    <div style={{ color: "#8C61CB" }}>{action}</div>
                </>
            }
        },
        {
            title: "Comment",
            key: "comment",
            render: () => {
                return <>
                    <div><img src={ShareIcon}/> </div>
                </>
            }
        
        },
    
]