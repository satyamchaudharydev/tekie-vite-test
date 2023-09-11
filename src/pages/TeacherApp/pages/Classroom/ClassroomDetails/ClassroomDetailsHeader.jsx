import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'   
import Breadcrumb from './Breadcrumb'
import Select from 'react-select'
import styles from './classroomDetails.module.scss'
import cx from 'classnames'
import getThemeColor from '../../../../../utils/teacherApp/getThemeColor'
import  { customStyles } from '../../../components/Dropdowns/Dropdown'
import hs from '../../../../../utils/scale'
import { get } from 'lodash'
import fetchClassroomBatches from '../../../../../queries/teacherApp/fetchClassroomBatches'
import { getClassroomTitle } from './ClassroomDetails.helpers'
import { ClassroomIcon } from '../../../components/svg'
import { Reports } from '../../../../../constants/icons'
import { backToPageConst } from '../../../constants'
import getMe from '../../../../../utils/getMe'
import { gtmEvents } from '../../../../../utils/analytics/gtmEvents'
import { fireGtmEvent } from '../../../../../utils/analytics/gtmActions'
import { getUserParams } from '../../../../../utils/getUserParams'

export const newStyles = {
    ...customStyles,
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        cursor: 'pointer',
        backgroundColor: isSelected ? getThemeColor() : null,
        '&:hover': {
            backgroundColor: '#f5f5f5',
            color: '#000',
        },
        display: 'block',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    }),
    control: (styles) => ({
        ...styles,
        cursor: "pointer",
        fontFamily: "Inter",
        minHeight: "36px",
        maxHeight: "36px",
        border: "1.4px solid #AAAAAA !important",
        boxShadow: "0 0 0 0px black",
        borderRadius: "8px",
        "&:hover": {
            border: `1.4px solid ${getThemeColor()}`,
            boxShadow: "0 0 0 0px black",
        },
    }),
    placeholder: (styles) => ({
        ...styles,
        fontSize: `${hs(16)}!important`,
        color: "#333333 !important",
        fontWeight: "400",
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        paddingTop: '2.5px',
        paddingLeft: '8px',
        paddingRight: '0',
        lineHeight: '100%',
        color: "#AAA",
        position: 'relative',
        transform: 'translateX(-5px)',
        "&:hover": {
            color: "#AAA",
        },
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
const ClassroomDetailsHeader = ({ fetchedClassrooms = [], loggedInUser, batchId, fromClassroomCoursePage = false, fromReportsPage = false, fromTeacherTrainingBatch }) => {
    const history = useHistory()
    let iconLabel = <ClassroomIcon color={`${getThemeColor()}`} className={styles.classroomIcon} />
    if (fromReportsPage) {
        iconLabel = <Reports color={`${getThemeColor()}`} className={cx(styles.classroomIcon, styles.classroomIconReports)} />
    }
    const historyList=[{label: iconLabel,route:'/teacher/reports'}, {label:getClassroomTitle(batchId,fetchedClassrooms),route:`/teacher/reports/classroom/${batchId}`}]
    if (fromClassroomCoursePage) {
        historyList[0].route = '/teacher/classrooms'
        historyList[1].route = `/teacher/classrooms/${batchId}`
    }
    if (fromTeacherTrainingBatch) {
        historyList[0].route = `/${backToPageConst.trainingClassrooms}`
        historyList[1].route = `/${backToPageConst.trainingClassrooms}/${batchId}`
    }
    const modifiedfetchedClassrooms = fetchedClassrooms.map(classroom => ({ label: get(classroom, 'groupName'), value: get(classroom, 'groupId'), key: get(classroom, 'groupId') }))
    const defaultBatch=modifiedfetchedClassrooms.find(batch=>get(batch,'value')===batchId)

    // useEffect(() => {
    //     (async function () {
    //         try{
    //             if (!fromClassroomCoursePage) await fetchClassroomBatches(get(loggedInUser, 'id')).call()
    //           }catch(error){
    //             console.log(error)
    //           }
    //     })()
    // }, [])
    const gtmEventsTrigger = () =>{
        const me = getMe()
        const userParams = {...getUserParams(),
          batchId: batchId,
        }
        fireGtmEvent(gtmEvents.classroomSwitchedViaDropdown,{userParams})
    } 
    return <div className={cx(styles.headerContainer, fromClassroomCoursePage && styles.classroomCourseStyle)}>
        <Breadcrumb historyList={historyList} />

        <div className={cx(styles.dropdownContainer, fromClassroomCoursePage && styles.dropdownContainerForClassroom)}>
            <Select
                components={{ IndicatorSeparator: () => null }}
                value={defaultBatch}
                controlShouldRenderValue={true}
                placeholder='All Classrooms'
                styles={newStyles}
                isSearchable={false}
                options={modifiedfetchedClassrooms}
                onChange={(batch, action) => {
                    gtmEventsTrigger(batch)
                    if (fromTeacherTrainingBatch) return history.push(`/${backToPageConst.trainingClassrooms}/${batch.value}`)
                    if (fromClassroomCoursePage) return history.push(`/${backToPageConst.classroom}/${batch.value}`)
                    history.push(`/${backToPageConst.report}/${batch.value}`)
                }}
            />
        </div>
    </div>
}

export default ClassroomDetailsHeader
