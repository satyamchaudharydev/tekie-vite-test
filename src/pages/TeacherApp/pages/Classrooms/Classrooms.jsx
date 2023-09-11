import React, { useEffect, useState } from 'react'
import get from 'lodash/get';
import duck from '../../../../duck';

import BatchCarousel from '../Classroom/components/BatchCarousel';
import fetchTeacherBatches, { fetchClassroomDetails } from '../../../../queries/teacherApp/fetchTeacherBatches';

import  {getUniqueBatches, getClassroomBatches } from './Classrooms.helpers';

import styles from './Classrooms.module.scss'
import Header from './Header';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import StripedProgressBar from '../../../../components/ProgressBars/StripedProgressBar';
import { fireGtmEvent } from '../../../../utils/analytics/gtmActions';
import { gtmEvents } from '../../../../utils/analytics/gtmEvents';
import getMe from '../../../../utils/getMe';
import { getUserParams } from '../../../../utils/getUserParams';


const Classrooms=(props)=>{
    const [classroomDetailsLocal, setClassroomDetailsLocal] = useState([])
    const [filterByBatches, setFilterByBatches] = useState([])
    const [modifiedBatchesData, setModifiedBatchesData] = useState([])
    const [isAlreadyLoaded, setIsAlreadyLoaded] = useState(false)

    const isTeacherBatchesLoading = props.teacherBatchesFetchStatus && props.teacherBatchesFetchStatus.toJS().loading
    const isTeacherBatchesSuccess = props.teacherBatchesFetchStatus && props.teacherBatchesFetchStatus.toJS().success
    const isClassroomDetailsSuccess = props.classroomDetailsFetchStatus && props.classroomDetailsFetchStatus.toJS().success
    const isClassroomDetailsLoading = props.classroomDetailsFetchStatus && props.classroomDetailsFetchStatus.toJS().loading
    const isAccessingTraingClasses = (get(props, 'match.path', '').includes('/teacher/training-classrooms') || false)

    const academicYearId = localStorage.getItem('academicYear') || ''

    useEffect(() => {
        let { loggedInUser } = props
		    loggedInUser = loggedInUser && loggedInUser.toJS();
        (async function () {
          try {
            const args = {
              first: 12,
              skip: 0,
              mentorId: get(loggedInUser, 'id'),
              filterByBatches,
              fetchTrainingBatches: isAccessingTraingClasses
            }
            const res = await fetchTeacherBatches(args, loggedInUser)
            let classroomNextSessionsList = []
            let clasroomDetailsList = []
            const teacherBatches = get(get(res, 'teacherBatches'), 'groups').filter(batch => batch.grade <= 12 && batch.isAdminGroup)
            if (teacherBatches && teacherBatches.length) {
              let batchIds = teacherBatches.map(batch => batch.groupId)
              let idsArray = teacherBatches.map((elem) => {
                return (
                  {
                    classroomId: get(elem, 'groupId'),
                    limit: 1,
                    queryType: "next",
                    bookingDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
                  }
                )
              })
              if (idsArray.length <= 6) {
                const res = await Promise.allSettled([fetchClassroomDetails(batchIds)])
                clasroomDetailsList.push(...get(res[0], 'value.classroomDetails', []))
              }
              if (idsArray.length > 6 && 12 >= idsArray.length) {
                const res = await Promise.allSettled([fetchClassroomDetails(batchIds.slice(0, 6)), fetchClassroomDetails(batchIds.slice(6, idsArray.length))])
                clasroomDetailsList.push(...get(res[0], 'value.classroomDetails', []), ...get(res[1], 'value.classroomDetails', []))
              }
              if (idsArray.length > 12) {
                const batchIdsArray = []
                for (let batch = 0; batch < idsArray.length; batch += 6) {
                  const batchIds = idsArray.filter((_, ind) => ind >= batch && ind < (batch + 6))
                  batchIdsArray.push(batchIds)
                }
                for (const batchIds of batchIdsArray) {
                  const res = await Promise.allSettled([fetchClassroomDetails(batchIds.map(batch => batch.classroomId))])
                  clasroomDetailsList.push(...get(res[0], 'value.classroomDetails', []))
                }
              }
            }
            duck.merge(() => ({
              classroomDetails: [...clasroomDetailsList]
            }))
            setClassroomDetailsLocal(clasroomDetailsList)
          } catch (err) {
            console.log(err.message)
          }
        })()
      }, [filterByBatches, get(props, 'match.path', ''), academicYearId])

      useEffect(() => {
        if (isTeacherBatchesSuccess && isClassroomDetailsSuccess) {
          let { teacherBatchesData } = props
          const transformedBatchesData = getUniqueBatches(get(teacherBatchesData.toJS(), '[0].groups'),  classroomDetailsLocal, isAccessingTraingClasses)
          setModifiedBatchesData(transformedBatchesData)
          return
        }
        if (isTeacherBatchesSuccess) {
          setIsAlreadyLoaded(true)
          if (!isAlreadyLoaded) {
            let { teacherBatchesData,classroomDetails } = props
            const transformedBatchesData = getUniqueBatches(get(teacherBatchesData.toJS(), '[0].groups'), classroomDetails.toJS() || [], isAccessingTraingClasses)
            setModifiedBatchesData(transformedBatchesData)
            return
          }
        }
      }, [isTeacherBatchesSuccess, isClassroomDetailsSuccess, classroomDetailsLocal])

	useEffect(() => {
		 const classroomBatchList = getClassroomBatches(get(props.teacherBatchesData.toJS(), '[0].groups'))
          duck.merge(() => ({
            teacherAppClassrooms: classroomBatchList
          }))
      }, [props.teacherBatchesData && props.teacherBatchesData.toJS().length])

      useEffect(() => {
        const userParams = getUserParams()
        setTimeout(() => {
          const teacherPageViewEvent = gtmEvents.teacherClassroomPageVisit
          fireGtmEvent(teacherPageViewEvent,{userParams})
        })
	  }, [])
	
	return isTeacherBatchesLoading ? <div className={styles.timetableCalendarLoaderBackdrop}>
        <LoadingSpinner
          height='40vh'
          position='absolute'
          left='50%'
          top='50%'
          transform='translate(-50%,-50%)'
          borderWidth='6px'
          showLottie
          flexDirection={'column'}
        >
          <span className={styles.timetableLoadingText}>Loading {isAccessingTraingClasses ? 'Schools' : 'Classrooms'}</span>
        </LoadingSpinner>
      </div>:<div className={styles.classroomsContainer}>
        <Header isAccessingTraingClasses={isAccessingTraingClasses} />
        <span className='classrooms-page-mixpanel-identifier' />
        {modifiedBatchesData 
          && modifiedBatchesData.map(batchList => 
            <BatchCarousel 
              key={batchList[0].id}
              usingFor={'classroomsPage'}
              batchList={batchList}
              isClassNextSessionsLoading={false}
              isClassroomDetailsLoading={isClassroomDetailsLoading}
              isAccessingTraingClasses={isAccessingTraingClasses}
            />)}
    </div>
}

export default Classrooms