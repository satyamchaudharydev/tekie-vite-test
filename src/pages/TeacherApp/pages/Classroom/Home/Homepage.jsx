import React, { useEffect, useState } from 'react'
import { get } from 'lodash'
import LoadingSpinner from '../../../components/Loader/LoadingSpinner'
import './styles.scss'
import fetchTeacherBatches, { fetchClassroomDetails, fetchClassroomSession } from '../../../../../queries/teacherApp/fetchTeacherBatches'
import styles from './homepage.module.scss'
import Header from '../components/Header'
import BatchCarousel from '../components/BatchCarousel'
import { getClassroomBatches, getUniqueBatches } from './Homepage.helpers'
import ClassroomModal from '../components/ClassroomModal/ClassroomModal'
import duck from '../../../../../duck'

const Homepage = (props) => {
  const [classNextSessionLocal, setClassNextSessionLocal] = useState([])
  const [classroomDetailsLocal, setClassroomDetailsLocal] = useState([])
  const [modifiedBatchesData, setModifiedBatchesData] = useState([])
  const [filterByBatches, setFilterByBatches] = useState([])
  const [showAddClassModal, setShowAddClassModal] = useState(false)
  const [isAlreadyLoaded, setIsAlreadyLoaded] = useState(false)
  const isTeacherBatchesLoading = props.teacherBatchesFetchStatus && props.teacherBatchesFetchStatus.toJS().loading
  const isClassNextSessionsLoading = props.classNextSessionFetchStatus && props.classNextSessionFetchStatus.toJS().loading
  const isClassroomDetailsLoading = props.classroomDetailsFetchStatus && props.classroomDetailsFetchStatus.toJS().loading
  const isTeacherBatchesSuccess = props.teacherBatchesFetchStatus && props.teacherBatchesFetchStatus.toJS().success
  const isClassNextSessionsSuccess = props.classNextSessionFetchStatus && props.classNextSessionFetchStatus.toJS().success
  const isClassroomDetailsSuccess = props.classroomDetailsFetchStatus && props.classroomDetailsFetchStatus.toJS().success

  const academicYearId = localStorage.getItem('academicYear') || ''
  useEffect(() => {
   let { loggedInUser, teacherBatchesData } = props
    loggedInUser = loggedInUser && loggedInUser.toJS();
    (async function () {
      try {
        const args = {
          first: 12,
          skip: 0,
          mentorId: get(loggedInUser, 'id'),
        filterByBatches
        }
       await fetchTeacherBatches(args, loggedInUser)
        let classroomNextSessionsList = []
        let clasroomDetailsList = []
        const teacherBatches = get(teacherBatchesData.toJS(), '[0].groups', [])
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
            // classroomNextSessionsList.push(...get(res[0], 'value.classroomNextSessions', []))
            clasroomDetailsList.push(...get(res[0], 'value.classroomDetails', []))
          }
          if (idsArray.length > 6 && 12 >= idsArray.length) {
            const res = await Promise.allSettled([fetchClassroomDetails(batchIds.slice(0, 6)), fetchClassroomDetails(batchIds.slice(6, idsArray.length))])
            // classroomNextSessionsList.push(...get(res[0], 'value.classroomNextSessions', []), ...get(res[1], 'value.classroomNextSessions', []))
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
              // classroomNextSessionsList.push(...get(res[0], 'value.classroomNextSessions', []))
              clasroomDetailsList.push(...get(res[0], 'value.classroomDetails', []))

            }
          }
        }
        duck.merge(() => ({
          classroomNextSessions: [...classroomNextSessionsList],
          classroomDetails: [...clasroomDetailsList]
        }))
        setClassNextSessionLocal(classroomNextSessionsList)
        setClassroomDetailsLocal(clasroomDetailsList)
      } catch (err) {
        console.log(err.message)
      }
    })()
  }, [filterByBatches, academicYearId])
 useEffect(() => {
    if (isTeacherBatchesSuccess && isClassroomDetailsSuccess
      ) {
      let { teacherBatchesData } = props
     const transformedBatchesData = getUniqueBatches(get(teacherBatchesData.toJS(), '[0].groups', []), classNextSessionLocal, classroomDetailsLocal)
    setModifiedBatchesData(transformedBatchesData)
      return
    }
    if (isTeacherBatchesSuccess) {
      setIsAlreadyLoaded(true)
      if (!isAlreadyLoaded) {
        let { teacherBatchesData, classNextSession, classroomDetails } = props
        const transformedBatchesData = getUniqueBatches(get(teacherBatchesData.toJS(), '[0].groups', []), classNextSession.toJS() || [], classroomDetails.toJS() || [])
       setModifiedBatchesData(transformedBatchesData)
        return
      }
    }

  }, [isTeacherBatchesSuccess, isClassroomDetailsSuccess, classNextSessionLocal, classroomDetailsLocal])

  useEffect(() => {
    const classroomBatchList = getClassroomBatches(get(props.teacherBatchesData.toJS(), '[0].groups', []))
    duck.merge(() => ({
      teacherAppClassrooms: classroomBatchList
    }))
  }, [props.teacherBatchesData && props.teacherBatchesData.toJS().length])

  const { schoolClasses, studentProfiles,
    studentProfilesFetchStatus, classroomCourses, classroomCoursesFetchStatus,
    loggedInUser, schoolBatchCodes, addTeacherBatchStatus,
    updateTeacherBatchStatus, teachersList } = props
  return <div className={styles.homepageContainer}>
    <Header
      fetchedClassrooms={props.teacherBatchesData && get(props.teacherBatchesData.toJS(), '[0].groups', [])}
      filterByBatches={filterByBatches} setFilterByBatches={setFilterByBatches}
      setShowAddClassModal={() => setShowAddClassModal(!showAddClassModal)}
    />
    {isTeacherBatchesLoading ? <div className={styles.timetableCalendarLoaderBackdrop}>
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
        <span className='timetable-loading-text'>Loading Reports</span>
      </LoadingSpinner>
    </div> : <div className={styles.batchesContainer}>
    <span className='reports-page-mixpanel-identifier' />
      <ClassroomModal
        visible={showAddClassModal} closeModal={() => setShowAddClassModal(false)}
        schoolId={loggedInUser && get(loggedInUser.toJS(), 'mentorProfile.schools[0].id')} // Where to get from
        addedBatchId={''}
        loggedInUser={loggedInUser && loggedInUser.toJS()}
        schoolClasses={(schoolClasses && schoolClasses.toJS()) || []}
        schoolBatchCodes={schoolBatchCodes && schoolBatchCodes.toJS()}
        teachersList={teachersList && teachersList.toJS()}
        // schoolBatchCodes={[{id: 'ckzjut2as001h10y2227t5o02', code: 'CR-NPSG-0012'}, {id: 'ckzjulxz0001f10y26xkw9zrr', code: 'CR-NPSG-0012'}]}
        studentProfiles={(studentProfiles && studentProfiles.toJS()) || []}
        studentProfilesFetchStatus={studentProfilesFetchStatus
          && !get(studentProfilesFetchStatus.toJS(), 'loading')
          && get(studentProfilesFetchStatus.toJS(), 'success')}
        classroomCourses={(classroomCourses && classroomCourses.toJS()) || []}
        classroomCoursesFetchStatus={classroomCoursesFetchStatus
          && !get(classroomCoursesFetchStatus.toJS(), 'loading')
          && get(classroomCoursesFetchStatus.toJS(), 'success')}
        addBatchLoading={addTeacherBatchStatus && get(addTeacherBatchStatus.toJS(), 'loading')}
        addTeacherBatchStatus={addTeacherBatchStatus && !get(addTeacherBatchStatus.toJS(), 'loading')
          && get(addTeacherBatchStatus.toJS(), 'success')}
        addBatchFailure={addTeacherBatchStatus && !get(addTeacherBatchStatus.toJS(), 'loading')
          && get(addTeacherBatchStatus.toJS(), 'failure')}
        updateTeacherBatchStatus={updateTeacherBatchStatus && !get(updateTeacherBatchStatus.toJS(), 'loading')
          && get(updateTeacherBatchStatus.toJS(), 'failure')}
      />
      {modifiedBatchesData && modifiedBatchesData.map(batchList => <BatchCarousel key={batchList[0].id} usingFor={'reportsPage'} batchList={batchList} isClassNextSessionsLoading={isClassNextSessionsLoading} isClassroomDetailsLoading={isClassroomDetailsLoading} />)}
    </div>}
  </div>
}


export default Homepage
