import React, { useState, useEffect } from 'react'
import details from '../../../../../../../assets/teacherApp/classDetail/open-outline.png'
import styles from './CourseDetail.module.scss'
import moment from 'moment'
import getPath from '../../../../../../../utils/getPath'
import ReactTooltip from 'react-tooltip'
import FileText from "../../../../../../../assets/teacherApp/classroom/file-text.svg"
import GroupSvg from "../../../../../../../assets/teacherApp/classroom/Group.svg"
import LearningObjective from "../../../../../../../assets/teacherApp/classroom/Learning Objectives.svg"
import repeat from "../../../../../../../assets/teacherApp/classroom/repeat.svg"
import ClassType from "../../../../../../../assets/teacherApp/classroom/Class Type.svg"
import Add from "../../../../../../../assets/teacherApp/classroom/Add.svg"
import CreateSessionModal from '../../../../../pages/TimeTable/components/CreateSessionModal/CreateSessionModal'
import { useLocation } from 'react-router'
import { get } from 'lodash'
import { Link } from "react-router-dom"
import { connect } from 'react-redux'

const Tag = ({ value }) => {
    return (
        <div className={styles.Course_tag}>
            {value}
        </div>
    )
}
const Course = ({ classroomDetail, batchId, src = "not_ClassroomDetail", getClasroomDetail,showAddSessionModalHandler,...props }) => {

    const [learning, setLearning] = useState(0)
    const [tests, setTests] = useState(0)
    const [progress, setProgress] = useState(0)
    const [revisions, setRevisions] = useState(0)
    const [assignments, setAssignments] = useState(0)
    const [courseTitle, setCourseTitle] = useState('')
    const [courseCreationDate, setCourseCreationDate] = useState('')
    const [courseThumbnail, setCourseThumbnail] = useState('')
    const [tags, setTags] = useState([])

    useEffect(() => {
        if (classroomDetail) {
            setLearning(classroomDetail.learingCount)
            setTests(classroomDetail.testCount)
            setRevisions(classroomDetail.revisionCount)
            setAssignments(classroomDetail.assignmentCount)
            if (classroomDetail.sessions) {
                getProgress()
            }

            if (classroomDetail.classroomCourse) {
                setCourseTitle(classroomDetail.classroomCourse.title)
                if(getPath(classroomDetail.classroomCourse.thumbnail) !== ''){
                    setCourseThumbnail(getPath(classroomDetail.classroomCourse.thumbnail))
                }else{
                    setCourseThumbnail(getPath('python/clasroomThumbnail_1.png'))
                }
                setCourseCreationDate(moment(classroomDetail.createdAt).format('DD MMMM, YYYY'))
            }
            const tags = []
            if (classroomDetail.classroomCourse) {
                classroomDetail.classroomCourse.theory.forEach((obj) => {
                    tags.push(obj.value)
                })
                classroomDetail.classroomCourse.tools.forEach((obj) => {
                    tags.push(obj.value)
                })
                classroomDetail.classroomCourse.programming.forEach((obj) => {
                    tags.push(obj.value)
                })
                setTags(tags)
            }
        }
    }, [classroomDetail])
    const getProgress = () => {
        const sessions = classroomDetail.sessions
        if (sessions.length === 0) {
            setProgress(0)
        }
        else {
            let p = 0
            sessions.forEach((session) => {
                if (session.sessionStatus === 'completed' && session.documentType === 'batchSession') {
                    p += 1
                }
            })
            const progress = Math.round((p / sessions.length) * 100)
            setProgress(progress)
        }
    }

    const renderTags = () => {
        if(tags.length < 6){
            return(
                <>
                    {tags.map((tag) => <Tag value={tag} />)}
                </>
            )
        }else{
            const show = tags.slice(0,6)
            const unshow = tags.slice(6)
            return(
                <>
                    {show.map((tag) => <Tag value={tag} />)}
                    <>  
                        <div  className={styles.Course_tag} data-tip="data-tag-tooltips" data-for="data-tag-tooltips">{`+${tags.length - show.length}`}</div>
                        <ReactTooltip
                            id="data-tag-tooltips"
                            place="top"
                            effect="solid"
                            >
                                {unshow.map((tag, index) => {
                                        return (
                                        <>
                                            <span key={index}>{`${tag}${index+1 !== unshow.length ? ",":"" }`}</span>
                                        </>
                                        );
                                    })}
                        </ReactTooltip>
                    </>
                </>
            )
        }
    }
    

    return (
        <div className={styles.Course_main}>
            <div style={{ width: '90%' }}>
                <div className={styles.Course_heading}>Course</div>
                <div className={styles.Course_name}>{courseTitle}</div>
                <div className={styles.Course_date}>Created on {courseCreationDate} </div>

                <div className={styles.Course_container}>
                    <div className={styles.Course_container2}>
                        <img className={styles.Course_icon} src={LearningObjective} alt='icon' />
                        <div style={{ marginLeft: '9px' }}>
                            <div className={styles.Course_text}>Learnings</div>
                            <div className={styles.Course_text2}>{learning}</div>
                        </div>
                    </div>
                    <div className={styles.Course_container2}>
                        <img className={styles.Course_icon} src={FileText} alt='icon' />
                        <div style={{ marginLeft: '9px' }}>
                            <div className={styles.Course_text}>Tests</div>
                            <div className={styles.Course_text2}>{tests}</div>
                        </div>
                    </div>
                    <div className={styles.Course_container2}>
                        <img className={styles.Course_icon} src={repeat} alt='icon' />
                        <div style={{ marginLeft: '9px' }}>
                            <div className={styles.Course_text}>Revisions</div>
                            <div className={styles.Course_text2}>{revisions}</div>
                        </div>
                    </div>
                    <div className={styles.Course_container2}>
                        <img className={styles.Course_icon} src={GroupSvg} alt='icon' />
                        <div style={{ marginLeft: '9px' }}>
                            <div className={styles.Course_text}>Assignments</div>
                            <div className={styles.Course_text2}>{assignments}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.Course_container2}>
                    <img className={styles.Course_icon} src={ClassType} alt='icon' />
                    <div style={{ marginLeft: '9px' }}>
                        <div className={styles.Course_text}>Type</div>
                        <div className={styles.Course_tags}>
                            {renderTags()}
                            {/* {tags.map((tag) => <Tag value={tag} />)} */}
                        </div>
                    </div>
                </div>
                <div style={{paddingTop : tags.length > 0 ? '2%' : '4%'}}  className={styles.Course_text3}>Progress</div>
                <div className={styles.Course_Progress1}>
                    <div className={styles.Course_Progressbar}>
                        <div style={{ width: `${progress}%` }} className={styles.Course_Progress} />
                    </div>
                    <div className={styles.Course_ProgressPercentage}>{progress}%</div>
                </div>
            </div>
            <div>
                {courseThumbnail !== '' ? (
                    <div className={styles.Course_imageContainer}>
                        <img className={styles.Course_CourseImage} alt='img' src={courseThumbnail} />
                    </div>
                ) : (
                    <div className={styles.Course_imageContainer2}></div>
                )}
                {src === 'clasroomDetail' ? (
                    <Link className={styles.Course_DetailButton}
                    to={`/classroom/course/?id=${batchId}`}
                    >
                        <img src={details} alt='details' style={{ paddingRight: '11px' }} />
                        View Details
                    </Link>
                ) : (
                    null
                    // <>
                    //     <div className={styles.Course_DetailButton} onClick={() => showAddSessionModalHandler(true)}>
                    //         <img style={{ marginRight: "12px" }} src={Add} alt="+" />
                    //         Add Sessions
                    //     </div>
                    // </>
                )}
            </div>
        </div>
    )
}


export default Course