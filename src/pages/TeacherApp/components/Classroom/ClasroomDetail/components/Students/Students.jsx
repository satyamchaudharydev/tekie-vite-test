import React, { useState, useEffect } from 'react'
import StudentReviewModal from '../ClassModal/StudentReviewModal'
import batch from '../../../../../../../assets/teacherApp/classDetail/Batch.png'
import link from '../../../../../../../assets/teacherApp/classDetail/link.svg'
import message from '../../../../../../../assets/teacherApp/classDetail/message-square.svg'
import messagePurple from '../../../../../../../assets/teacherApp/classDetail/message-square(1).svg'
import search from '../../../../../../../assets/teacherApp/classDetail/Search.svg'
import { Toaster, getToasterBasedOnType } from '../../../../../../../components/Toaster'
import ClassImg from '../../../../../../../assets/b2bLandingPage/CodersJourney/class1-2.png'
import styles from './Students.module.scss'
import { get } from 'lodash'
import getPath from '../../../../../../../utils/getPath'
import extractSubdomain from '../../../../../../../utils/extractSubdomain'
import { MessageIcon } from '../../../../../../../constants/icons'


const Students = ({ classroomDetail, loggedInUser, batchId, schoolId, mentorName, reviewStatus }) => {
    const [openModal, setOpenModal] = useState(false)
    const [students, setStudents] = useState([])
    const [currentTopicId, setCurrentTopicId] = useState()
    const [selectedStudent, setSelectedStudent] = useState('')
    const [searchedStudent, setSearchedStudent] = useState('')
    const [classroomTitle, setClassroomTitle] = useState('')
    const [classSesctionMap, setClassSesctionMap] = useState(new Map())

    useEffect(() => {
        if (classroomDetail && classroomDetail.classroomData) {
            setStudents(classroomDetail.classroomData.students)
            setClassroomTitle(get(classroomDetail, 'classroomData.classroomTitle'))
            if (classroomDetail.classroomData.classes !== null) {
                const classes = classroomDetail.classroomData.classes
                const tempMap = classSesctionMap
                for (let i = 0; i < classes.length; i++) {
                    const grade = classes[i].grade
                    const section = classes[i].section
                    if (classSesctionMap.has(grade)) {
                        const sections = classSesctionMap.get(grade)
                        let flag = false
                        for (let j = 0; j < sections.length; i++) {
                            if (sections[j] === section) {
                                flag = true
                                break
                            }
                        }
                        if (flag) {
                            sections.push(section)
                            classSesctionMap.set(grade, [sections])
                        }
                    } else {
                        classSesctionMap.set(grade, [section])
                    }
                }
                setClassSesctionMap(tempMap)
            }
            getCurrentTopicId()
        }
    })

    const getCurrentTopicId = () => {
        if (classroomDetail) {
            let topicId = ''
            const sessions = classroomDetail.sessions
            for (let i = 0; i < sessions.length; i++) {
                const currentSessionType = sessions[i].documentType
                const currentSessionStatus = sessions[i].sessionStatus
                if (currentSessionType === "notYetBooked") {
                    break
                }

                if (currentSessionType === 'adhocSession') {
                    topicId = sessions[i].previousTopic.id
                } else if (currentSessionType === 'batchSession') {
                    topicId = sessions[i].topic.id
                }
                if (currentSessionStatus === 'started') {
                    break
                }
            }
            setCurrentTopicId(topicId)
        }
    }
    const handleModal = (student) => {
        setOpenModal(true)
        setSelectedStudent(student)
    }
    const handleSearch = (e) => {
        setSearchedStudent(e.target.value)
    }
    const getStudentImage = (student) => {
        return getPath(get(student, 'user.profilePic.uri', ''))
    }

    const createInviteLink = () => {
        let link = extractSubdomain()
        if (link !== null) {
            link += `.tekie.in/login?schoolId=${schoolId}&batchId=${batchId}`
        } else {
            link = `import.meta.env.REACT_WEB_URL/login?schoolId=${schoolId}&batchId=${batchId}`
        }
        navigator.clipboard.writeText(link)
        getToasterBasedOnType({
            type: 'success',
            message: 'Invite Link Copied',
            className: 'teacher-app-theme'
        })
    }
    const renderClasses = () => {
        let grade = get(students[0], 'grade', '')
        if (grade.length === 6) {
            grade = grade.charAt(5)
        } else if (grade.length === 7) {
            grade = grade.charAt(5) + grade.charAt(7)
        }
        return (
            <div className={styles.Students_Container}>
                <img className={styles.Students_Icon} src={batch} alt='icon' /><span className={styles.Students_text2} >Class</span><span className={styles.Students_text3}>{grade}-{get(students[0], 'section', '')}</span>
            </div>
        )
        // if(Object.keys(classSesctionMap).length !== 0){
        //     const grades = Object.keys(classSesctionMap)
        //     for(let i=0;i<grades.length;i++){
        //         const grade = grades[i]
        //         const sections = classSesctionMap.get(grade)
        //         sections.map((section) =>
        //                 <div className={styles.Students_Container}>
        //                     <img className={styles.Students_Icon} src={batch} alt='icon'/><span className={styles.Students_text2} >Class</span><span className={styles.Students_text3}>{grade}-{section}</span>
        //                 </div>
        //         )
        //     }
        // }
    }
    return (
        <div className={styles.Students_main}>
            <div className={styles.Students_flexbox}>
                <div className={styles.Students_flexbox3}>
                    <div className={styles.Students_text1}>All Students</div>
                    {renderClasses()}
                </div>
                <div className={styles.Students_flexbox2}>
                    <div className={styles.Students_inputContainer}>
                        <input
                            placeholder='Search'
                            className={styles.Students_input}
                            onChange={(e) => handleSearch(e)}
                        />
                        <img className={styles.Students_search} src={search} alt='icon' />
                    </div>
                    <div className={styles.Students_linkButton} onClick={() => createInviteLink()}>
                        <img className={styles.Students_link} src={link} alt='icon' />
                        <span style={{ fontSize: '12px' }}>Invite By Link</span>
                    </div>
                </div>
            </div>
            <div className={styles.table_wrapper}>
                <table className={styles.customers}>
                    <thead>
                        <tr className={styles.topRow}>
                            <th className={styles.topHeading} style={{ textAlign: 'center', borderBottom: 'none', fontSize: '12px' }}>Roll Number</th>
                            <th className={styles.topHeading} style={{ borderBottom: 'none', fontSize: '12px' }}>Student</th>
                            <th className={styles.topHeading} style={{ borderBottom: 'none', fontSize: '12px' }}>Parent Name</th>
                            <th className={styles.topHeading} style={{ borderBottom: 'none', fontSize: '12px' }}>Parent Phone</th>
                            <th className={styles.topHeading} style={{ borderBottom: 'none', fontSize: '12px' }}>Parent Email</th>
                            {currentTopicId !== '' && <th style={{ borderBottom: 'none' }}><img src={message} alt='feedback' style={{ paddingLeft: '5px' }} /></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            students.filter((student) => {
                                if (searchedStudent === "") {
                                    return student
                                } else if (student.user.name.toLowerCase().includes(searchedStudent.toLowerCase())) {
                                    return student
                                }
                            }).map((student, key) => (
                                <tr className={styles.row}>
                                    <th className={styles.heading} style={{ textAlign: 'center', fontWeight: 'normal' }}>{key + 1}</th>
                                    <th style={{ fontWeight: '600' }} className={get(student, 'user.profilePic.uri', '') !== '' ? styles.heading1 : styles.heading}>{get(student, 'user.profilePic.uri', '') !== '' && <img src={getStudentImage()} alt='studentImage' className={styles.studentImage} />}{get(student, 'user.name', '')}</th>
                                    <th style={{ fontWeight: 'normal' }} className={styles.heading}>{get(student, 'parents[0].user.name', '')}</th>
                                    <th style={{ fontWeight: 'normal' }} className={styles.heading}>{get(student, 'parents[0].user.phone.number', '')}</th>
                                    <th style={{ fontWeight: 'normal' }} className={styles.email}>{get(student, 'parents[0].user.email', '')}</th>
                                    {currentTopicId !== '' && <th style={{ fontWeight: 'normal' }}><div className={styles.feedbackImage2} style={{ cursor: 'pointer', maxWidth: 'fit-content' }} alt='feedback' onClick={() => handleModal(student)}>
                                        <MessageIcon />
                                    </div></th>}
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
                {
                    students.length === 0 && (
                        <div className={styles.noStudent}>No student found</div>
                    )
                }
            </div>
            {openModal &&
                <StudentReviewModal
                    selectedStudent={selectedStudent}
                    classroomTitle={classroomTitle}
                    setOpenModal={setOpenModal}
                    mentorName={mentorName}
                    reviewStatus={reviewStatus}
                    loggedInUser={loggedInUser}
                    batchId={batchId}
                    topicId={currentTopicId} />}

        </div>
    )
}

export default Students