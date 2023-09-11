import React, { useState,useEffect } from "react"
import "./HomeworkSelectTable.scss"
import Filter from "./dropdownFilter"
import Sort from "./dropdownSort"
import HomeworkTableTitleComponent from "./homeworkTableComponents/HomeworkTableTitle"
import StudentReviewModal from "../../../../TeacherApp/components/Classroom/ClasroomDetail/components/ClassModal/StudentReviewModal"
import HomeworkDescription from "./homeworkTableComponents/HomeworkDescription"
import SearchIcon from "../../../../../assets/teacherApp/classroom/Search.svg"
import HomeworkProgressBar from "./HomeworkProgressBar"
import { get } from "lodash"



function HomeworkTable({value,propsRedux,topicComponentRule,selectStudent ,
    idTopic,setSelectStudent ,setClicked, sessions,
    loggedInUser, startingValue, sessionStatusHandle,reviewStatus,classroomTitle,mentorName,setFirstStudent , setCurrentStudentObject
}) {

    const [searchTerm, setSearchTerm] = useState("")
    const [sort, setSort] = useState("")
    const [filter, setFilter] = useState("")
    const [selectedStudent,setSelectedStudent] = useState("")
    const { homeworkStudentsDataFetchStatus } = value
    const currentStatusObject = homeworkStudentsDataFetchStatus && homeworkStudentsDataFetchStatus.toJS()
    const currentStatus = get(currentStatusObject, "homeworkStudentsData.loading", true)
    const [openModal, setOpenModal] = useState(false)
    const [currentTopicId, setCurrentTopicId] = useState()
    const [batchId, setBatchId] = useState('')

    const { homeworkStudentsData } = value
    const currentHomeworkDataStatus = homeworkStudentsData && homeworkStudentsData.toJS()

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const id = queryParams.get('id');
        setBatchId(id)
    },[idTopic])

    function checker() {
        const emptyArray = []
        const emptyArray1 = []
        for (let index = 0; index < currentHomeworkDataStatus.length; index++) {
            const element = currentHomeworkDataStatus[index]
            if (get(element, "isAssignmentSubmitted") == false && get(element, "isQuizSubmitted") == false && get(element, "isPracticeSubmitted") == false) {
                emptyArray.push(element)
            }
            emptyArray1.push(element)
        }
        
        // if (emptyArray.length === emptyArray1.length) {
        //     return true
        // } else {
        //     return false
        // }
        return false
    }

    
    function EmptySessionHomeworkHandle() {
        return <>
            <div className="empty_session_handle">
                <span>Homework will be given after session is completed </span>
            </div>
        </>
    }
    function UnAttemptedHandle() {
        return <>
            <div className="empty_session_handle">
                <span>Homework yet to begin </span>
            </div>
        </>
    }
    return <>

        {sessionStatusHandle != "completed" ? <EmptySessionHomeworkHandle /> :
                checker() ? <UnAttemptedHandle />:
            <div>{currentStatus && <HomeworkProgressBar /> }

                <section style={currentStatus ? {display:"none"} :{display:"block"}} class="homework_table">
                    <div class="heading_homework__title">
                        Student List
                    </div>
                    <div class="search_and_sort_container">
                        <div>
                            <div class="search_bar">
                                <input onChange={(e) => setSearchTerm(e.target.value)} class="input_search_tag" placeholder="Search Student" />
                                <img class="search_icon_class" src={SearchIcon} />
                            </div>
                        </div>
                        <div class="filter_sort_container">
                            <div>
                                <Filter setSort={setSort} />
                            </div>
                            <div>
                                <Sort setFilter={setFilter} />
                            </div>
                        </div>
                    </div>
                    {openModal && <StudentReviewModal selectedStudent={selectedStudent} mentorName={mentorName} classroomTitle={classroomTitle}
                        setOpenModal={setOpenModal} loggedInUser={loggedInUser} batchId={batchId} topicId={idTopic} reviewStatus={reviewStatus} />}
                    <div style={{ position: "relative", zIndex: "0" }} class="title_homework_main_container">
                        <HomeworkTableTitleComponent setOpenModal={setOpenModal} setSelectedStudent={setSelectedStudent} reviewStatus={reviewStatus}  sessions={sessions} value={value} propsRedux={propsRedux} topicComponentRule={topicComponentRule} searchTerm={searchTerm} setSelectStudent={setSelectStudent} selectStudent={selectStudent} sortName={sort} filterName={filter} idTopic={idTopic} setClicked={setClicked} startingValue={startingValue} setFirstStudent={setFirstStudent} setCurrentStudentObject={setCurrentStudentObject}/>
                    </div>

                </section>
            
            </div>
        }





    </>
}

export default HomeworkTable