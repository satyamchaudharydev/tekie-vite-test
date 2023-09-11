import { get } from 'lodash'
import React from 'react'
import { hs } from '../../../../utils/size'
import Dropdown, { customStyles } from '../../../TeacherApp/components/Dropdowns/Dropdown'
import ProgressBar from '../../../TeacherApp/pages/Classroom/components/BatchCarousel/ProgressBar'
import '../../SessionCoursePage.scss'
import CoursePill from '../CoursePill'
import styles from './TopicsSectionHeader.module.scss'

const topicStatusOptions = [{ label: 'All Classes', value: 'allClasses' }, { label: 'Upcoming', value: 'upcoming' }, { label: 'Completed', value: 'completed' }]

const newStyles = {
    ...customStyles,
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        cursor: 'pointer',
        fontSize:`${hs(20)}px!important`,
        backgroundColor: isSelected ? '#00ade6' : null,
        '&:hover': {
            backgroundColor: isSelected ? '#00ade6' : '#f5f5f5',
            color: isSelected ? 'white' : '#000',
        },
        display: 'block',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    }),
    control: (styles) => ({
        ...styles,
        cursor: "pointer",
        fontFamily: "Nunito",
        minWidth: hs(180),
        minHeight: hs(56),
        maxHeight: hs(36),
        border: "1.4px solid #AAAAAA !important",
        boxShadow: "0 0 0 0px black",
        borderRadius: "12px",
        // "&:hover": {
        //     border: `1.4px solid ${getThemeColor()}`,
        //     boxShadow: "0 0 0 0px black",
        // },
    }),
    placeholder: (styles) => ({
        ...styles,
        fontSize: `${hs(20)}px!important`,
        color: "#282828 !important",
        fontWeight: "600",
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        paddingTop: '3.5px',
        paddingLeft: '8px',
        paddingRight: '0',
        color: "#333333",
        position: 'relative',
        transform: 'translateX(-5px)',
        // "&:hover": {
        //     color: "#AAA",
        // },
    }),
    singleValue: (styles) => ({
        ...styles,
        fontSize: `${hs(20)}px!important`,
        fontWeight: 600
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        backgroundColor: 'transparent'
    }),
    input: (styles) => ({
        ...styles,
        color: "transparent",
    }),
};

const TopicsSectionHeader = (props) => {
    const { coursePackage,selectCourse,selectedCourse,clearAllSelectedCourses,filterSessionsBy,sessionStatus,courseCompletionPercentage, renderBatchSelector = () => {}} = props

    const getCoursesWithLabSessions=(courses=[])=>{
        if(courses && courses.length){
            const labCategoryCourses = courses.filter(course=>get(course,'category')!=='theory')
            const coursesWithLabSessions=labCategoryCourses.filter(course=>{
                const sessionsForThisCourse = props.allSessions.filter(session=>get(session,'course.id')===get(course,'id'))
                if(sessionsForThisCourse && sessionsForThisCourse.length){
                    return sessionsForThisCourse.find(topic=>get(topic,'classType') === 'lab')
                }
                return false
            })
            return coursesWithLabSessions
        }
        return []
    }
    
    const sortCoursesByTopicOrder=(courses=[])=>{
        if (courses && courses.length) {
            return [...courses].sort((courseA, courseB) => {
                const sessionsForCourseA = props.allSessions.filter(session=>get(session,'course.id')===get(courseA,'id'))
                const sessionsForCourseB = props.allSessions.filter(session=>get(session,'course.id')===get(courseB,'id'))
                const minTopicOrderForCourseA = Math.min(...sessionsForCourseA.map(session=>get(session,'i')))
                const minTopicOrderForCourseB = Math.min(...sessionsForCourseB.map(session=>get(session,'i')))
                return minTopicOrderForCourseA - minTopicOrderForCourseB
            })
        }
        return []
    }
    const totalLabCourses = getCoursesWithLabSessions(get(coursePackage, 'courses', [])).length

    return (
        <div className={`${styles.spContainer} ${styles.allTopicsContainer} ${get(props, 'fromTeacherApp') && styles.spContainerTeacherApp}`}>
            <div className={`${styles.coursePackageTitleAndProgressBar} ${get(props, 'fromTeacherApp') && styles.coursePackageTitleAndProgressBarTeacherApp}`}>
                {get(props, 'fromTeacherApp') ? (
                    <div className={styles.coursePackageTitleAndBatchSelector}>
                        <h3 className={`${styles.coursePackageTitle} ${styles.coursePackageTitleTeacherApp}`}>{get(coursePackage, 'title')} - <span className={styles.courseCompletionPercent}>{courseCompletionPercentage}%</span></h3>
                        {renderBatchSelector()}
                    </div>
                ) : <h3 className={`${styles.coursePackageTitle}`}>{get(coursePackage, 'title')} - <span className={styles.courseCompletionPercent}>{courseCompletionPercentage}%</span></h3>}
                <ProgressBar usingForSessionsPage done={courseCompletionPercentage} customStyle={{ width:  get(props, 'fromTeacherApp')? '100%' : '85vw', height: hs(16), borderRadius:hs(12), background: 'linear-gradient(270deg, #029883 0%, #52C6B5 115.74%)' }} />
            </div>
            {!get(props, 'fromTeacherApp') ? (
                <div className={`${styles.courseFiltersContainer} ${get(props, 'fromTeacherApp') && styles.courseFiltersContainerTeacherApp}`}>
                <div className={styles.dropdownAndPillsContainer}>
                    <div>
                        <Dropdown
                            components={{ IndicatorSeparator: () => null }}
                            placeholder='All Classes'
                            isMulti={false}
                            className='classHome-select'
                            classNamePrefix='classHome-select'
                            styles={newStyles}
                            isSearchable={false}
                            defaultValue={{label:'All classes',value:'allClasses'}}
                            options={topicStatusOptions}
                            onChange={(sessionStatus) => {
                                filterSessionsBy(get(sessionStatus,'value'))
                            }} />
                    </div>
                    <div className={styles.coursePillsContainer}>
                        {sortCoursesByTopicOrder(getCoursesWithLabSessions(get(coursePackage, 'courses', []))).map(course =>
                            <CoursePill
                                selectCourse={selectCourse}
                                course={course}
                                selectedCourse={selectedCourse}
                                totalCourses={totalLabCourses}
                                onRadioButtonClick={()=>clearAllSelectedCourses()}
                            />
                        )}
                    </div>
                </div>
                {(selectedCourse) && <button onClick={()=>clearAllSelectedCourses()} className={styles.clearFilter}>
                    Clear Filters
                </button>}
            </div>
            ) : null}
        </div>
    )
}

export default TopicsSectionHeader