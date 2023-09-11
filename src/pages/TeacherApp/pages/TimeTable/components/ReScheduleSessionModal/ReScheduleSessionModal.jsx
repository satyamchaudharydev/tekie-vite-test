import moment from 'moment'
import React, { useState,useEffect,useRef } from 'react'
import {Formik } from 'formik'
import Modal from '../../../../components/Modal/Modal'
import { CalenderSvg } from '../../../../components/svg'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './ReScheduleSessionModal.module.scss'
import partyPopper from './../../../../../../assets/party-popper.png'
import addSession from '../../../../../../queries/teacherApp/addSession'
import makeInputObj from '../CreateSessionModal/createInputObj'
import { RenderModalDaysGrid } from '../CreateSessionModal/CreateSessionModal'
import { getToasterBasedOnType } from '../../../../../../components/Toaster'
import getClassroomSessions from '../../../../../../queries/teacherApp/getClassroomSessions'
import { get } from 'lodash'
import usePrevious from '../../../../../../utils/teacherApp/usePrevious'
import { setHours, setMinutes, subDays } from 'date-fns'
import useClickOutside from '../../../../../../utils/teacherApp/useClickOutside'

const DATE_TIME = 'dateTime'
const RESCHEDULE_TYPE = 'reScheduleType'
const SUCCESS = 'success'

const dayAndTimeColumns = [{
    day: 'Days',
    isChecked: false,
  }, {
    day: 'Monday',
    isChecked: false,
    startTime: '',
    endTime: '',
    mode: 'online'
  },
  {
    day: 'Tuesday',
    isChecked: false,
    startTime: '',
    endTime: '',
    mode: 'online'
  
  },
  {
    day: 'Wednesday',
    isChecked: false,
    startTime: '',
    endTime: '',
    mode: 'online'
  
  },
  {
    day: 'Thursday',
    isChecked: false,
    startTime: '',
    endTime: '',
    mode: 'online'
  
  },
  {
    day: 'Friday',
    isChecked: false,
    startTime: '',
    endTime: '',
    mode: 'online'
  
  },
  {
    day: 'Saturday',
    isChecked: false,
    startTime: '',
    endTime: '',
    mode: 'online'
  
  },]



const ReScheduleSessionModal = ({classroomId, documentType, setIsRescheduleModalVisible,src='timeTable',addClassRoomSessionErrorMessage,addClassroomSessionErrorList,getClasroomDetail,filterClassroomSessionQuery,loggedInUser,isCreatingSession,hasCreatedSession,sessionDetails}) => {
    const [sessionDate, setSessionDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date(moment(moment(moment().format()).add(30, 'm').toDate()).format()));
    const [endTime, setEndTime] = useState(moment(startTime).add(30, 'm').toDate());
    // const [endTime, setEndTime] = useState(new Date(moment(moment(moment().format()).add(60, 'm').toDate()).format()));
    const [currentScreen, setCurrentScreen] = useState(RESCHEDULE_TYPE)
    const screens = [RESCHEDULE_TYPE, DATE_TIME, SUCCESS]
    const [dayTimeGrid, setDayTimeGrid] = useState(dayAndTimeColumns)

    const [scheduleType, setScheduleType] = useState('single')
    const [isAnySelected, setIsAnySelected] = useState(false)
    const domRef=useClickOutside(()=>setIsRescheduleModalVisible(false))

    if(addClassroomSessionErrorList){
      addClassroomSessionErrorList=addClassroomSessionErrorList.toJS()
    }else{
      addClassroomSessionErrorList=[]
    }
  const prevErrorsList=usePrevious(addClassroomSessionErrorList.length)

    const firstMount= useRef(true)

    const nextScreen = () => {     
        const screenList = screens
        const nextScreen = screenList[screenList.indexOf(currentScreen) + 1]
        setCurrentScreen(nextScreen)
    }

    const selectSessionDay = (label) => {
        const dayTimeGridCopy = [...dayTimeGrid]
        let isAnySelected = false

        const isSelectAllChecked = (weeklist) => {
          return weeklist[0].isChecked
        }
        const areAllDaysChecked = () => {
          const areSomeUnchecked = dayTimeGrid.find(obj => obj.isChecked === false)
          return areSomeUnchecked ? false : true
        }
        const areAllOptionsCheckedExceptSelectAll = (dayTimeGrid) => {
          const areSomeUnchecked = dayTimeGrid.find(option => {
            return !option.isChecked && option.day !== 'Days'
          })
          if (areSomeUnchecked) return false
          return true
        }
    
        if (isSelectAllChecked(dayTimeGridCopy) && label !== 'Days') {
          const updatedOptionsList = dayTimeGridCopy.map(option => {
            if (option.day === 'Days') {
              return { ...option, isChecked: false }
            } else {
              if (option.day === label) return { ...option, isChecked: !option.isChecked }
              return option
            }
    
          })
          setDayTimeGrid(updatedOptionsList)
          return
        }
    
        if (label === 'Days') {
          if (areAllDaysChecked()) {
            const updatedOptionsList = dayTimeGridCopy.map(option => ({ ...option, isChecked: false }))
            setDayTimeGrid(updatedOptionsList)
            setIsAnySelected(false);
            return
          }
          const updatedOptionsList = dayTimeGridCopy.map(option => ({ ...option, isChecked: true }))
          setDayTimeGrid(updatedOptionsList)
          setIsAnySelected(true);
          return
        }
    
        const updatedOptionsList = dayTimeGridCopy.map(option => {
          if (option.day === label) return { ...option, isChecked: !option.isChecked }
          return option
        })
    
        if (areAllOptionsCheckedExceptSelectAll(updatedOptionsList)) {
          const updatedOptionsList = dayTimeGridCopy.map(option => ({ ...option, isChecked: true }))
          return setDayTimeGrid(updatedOptionsList)
        }
        setDayTimeGrid(updatedOptionsList)
        updatedOptionsList.forEach((day)=>{
            if(day.isChecked === true){
                isAnySelected = true;
            }
        })
        setIsAnySelected(isAnySelected);
      }


    const handleSubmit = async () => {
        let inputData = {'adhocSessionId': '', 'batchSessionId': '', 'doReschedule': true, 'isRecurring': false, 'startTime': moment(startTime).format(), 'endTime': moment(endTime).format(), 'sessionDate': moment(sessionDate).format() }
        if(documentType === 'adhocSession'){
            inputData['adhocSessionId'] = classroomId
            inputData['scheduleSessionType'] = 'adhoc'
        } else if(documentType === 'batchSession'){
            inputData['batchSessionId'] = classroomId
            inputData['scheduleSessionType'] = 'batch'
        }
        if(scheduleType === 'all'){
            inputData.isRecurring = true;
            const inputForScheduleSessionQuery = makeInputObj(inputData, { dayTimeGrid })
            await addSession(inputForScheduleSessionQuery)
        } else{
            const inputForScheduleSessionQuery = makeInputObj(inputData)
            await addSession(inputForScheduleSessionQuery)
        } 
      }

      const getIncludeTimes = (startDate) => {
        const includeTimesList = []
        for(let i= 30; i<=91; i++){
          const endTime = moment(startDate).add(i, 'm').toDate()
          includeTimesList.push(endTime);
        }
        return includeTimesList
      }

    const renderDateTimeScreen = () => {
        return <div className="dateTimeScreen">
            {scheduleType=== 'single' && <><div className={styles.datepickerContainer}>
                <label className={styles.dateTimeLabel}>Session Date<span className={styles.required}> *</span> </label>
                <DatePicker
                    className={styles.dateContainer}
                    placeholderText="Select a day"
                    name='sessionDate'
                    // selected={startTime}
                    selected={sessionDate}
                    onChange={(date) => setSessionDate(date)}
                    minDate={moment().toDate()}
                    dateFormat={'d MMM y'}
                />
            </div>

            <div className={styles.timepickerContainer}>
                <div className={styles.labelAndTimeContainer}>
                    <label className={styles.dateTimeLabel}>Start time<span className={styles.required}> *</span> </label>
                    <DatePicker
                        className={styles.timeContainer}
                        selected={startTime}
                        onChange={(date) => setStartTime(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                      
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                    />

                </div>
                <p style={{
                  marginLeft: '20px',
                  boxSizing: 'border-box',
                }}>To</p>
                <div className={styles.labelAndTimeContainer}>
                    <label className={styles.dateTimeLabel}>End time<span className={styles.required}> *</span> </label>
                    <DatePicker
                        className={styles.timeContainer}
                        selected={endTime}
                        onChange={(date) => setEndTime(date)}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        includeTimes={getIncludeTimes(startTime)}
                        minDate={subDays(new Date(), 5)}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                    />
                </div>
            </div></>}
            {scheduleType === 'all' && <>
            <Formik
              initialValues={{
                startTime: moment().format(),
                endTime: moment(moment(startTime).add(30, 'm').toDate()).format(),
                scheduleSessionRules: []
              }}
            >
                <RenderModalDaysGrid dayTimeGrid={dayTimeGrid} setDayTimeGrid={setDayTimeGrid} selectSessionDay={selectSessionDay} columns={{startTime: true, endTime: true, mode: false}}/>

            </Formik></>}
        </div>
    }

    const renderRescheduleTypeScreen = () => {
        return <div className={styles.reScheduleScreenContainer}>
            <p className={styles.reScheduleScreenTitle}>Reschedule for all consequent sessions?</p>
            <label className={`${styles.radio} ${styles.dateTimeLabel}`}>
                <input
                    type="radio"
                    name="reScheduleType"
                    value="yes"
                    onChange={()=>{setScheduleType('all')}}
                />
                <span>Yes, Reschedule for all consequent Sessions</span>
            </label>
            <label className={`${styles.radio} ${styles.dateTimeLabel}`}>
                <input
                    type="radio"
                    name="reScheduleType"
                    value="yes"
                    onChange={()=>{setScheduleType('single')}}
                    defaultChecked
                />
                <span>No, Only for this Session</span>
            </label>
        </div>
    }
    const renderSuccessScreen = () => {
        return <div className={styles.successScreenContainer} style={{textAlign:'center'}}>
            <img style={{height: '70px', margin: '15px 0 30px 0'}} src={partyPopper} alt="party-popper" className='party-popper' />
            {scheduleType==='single'? <div>The Session has been re-scheduled to {sessionDate.toLocaleDateString()} between {moment(startTime).format('HH:mm')}  to {moment(endTime).format('HH:mm')} </div>:<div>All allotted sessions have been rescheduled according to the schedule provided!</div>}
        </div>
    }

    const getPriBtnText = () => {
        if (currentScreen === DATE_TIME) return 'Confirm Re-Schedule'
        if (currentScreen === RESCHEDULE_TYPE) return 'Re-Schedule Session'
        if (currentScreen === SUCCESS) return 'Close'
    }

    const confirm = () => {
        handleSubmit()
        // nextScreen()
    }
    const close = () => {
      if(src ==='classDetail'){
        getClasroomDetail()
      }
      setIsRescheduleModalVisible(false)
    }

    const getPriFooterHandlers = () => {
        if(currentScreen === DATE_TIME) return  confirm
        if(currentScreen === RESCHEDULE_TYPE) return nextScreen
        if(currentScreen === SUCCESS) return close
    }


    useEffect(()=>{
      if(firstMount.current){
        return
      }
      if( hasCreatedSession){
        getToasterBasedOnType({
          className: 'teacher-app-theme',
          type: "success",
          message: "Session successfully rescheduled!"
        });       
      (async function(){
          try{
            if (filterClassroomSessionQuery.startDate && filterClassroomSessionQuery.endDate) {
              await getClassroomSessions(filterClassroomSessionQuery, loggedInUser)
          }
          }catch(err){
            console.log(err)
          }
        })()
        nextScreen()
      }
      
    },[isCreatingSession])

    useEffect(() => {
      if(firstMount.current){
        return
      }
      if(addClassRoomSessionErrorMessage && addClassRoomSessionErrorMessage.toJS() && addClassroomSessionErrorList && addClassroomSessionErrorList.length!==prevErrorsList){

        const getErrorMessage=()=>{
          if(addClassroomSessionErrorList){
              return (get(addClassRoomSessionErrorMessage.toJS()[addClassroomSessionErrorList.length-1],'error.errors[0].extensions.exception.data.message') ||get(addClassRoomSessionErrorMessage.toJS()[addClassroomSessionErrorList.length-1],'error.errors[0].message'))
          } return (get(addClassRoomSessionErrorMessage.toJS()[0],'error.errors[0].extensions.exception.data.message') ||get(addClassRoomSessionErrorMessage.toJS()[0],'error.errors[0].message'))
        }
        getToasterBasedOnType({
          type: 'error',
          message:getErrorMessage()
      })
      }
    },[isCreatingSession])

    useEffect(()=>{
      firstMount.current=false
      return ()=> firstMount.current=true
    },[])

    useEffect(() => {
      setEndTime(moment(startTime).add(30, 'm').toDate())
  }, [startTime])

    return <Modal nodeRef={domRef} handleSubmit={handleSubmit} classroomId={classroomId} documentType={documentType} setModalVisibility={setIsRescheduleModalVisible} type={currentScreen} headerIcon={<CalenderSvg />} heading={currentScreen === SUCCESS ? 'Congratulations' : 'Re-Schedule Session'} subHeading={currentScreen !== SUCCESS && 'Schedule your class below'} footerWithTwoBtns={currentScreen !== SUCCESS && true} widthFull secBtnText={'Cancel'} priBtnText={getPriBtnText()} clickHandler2={()=>{setIsRescheduleModalVisible(false)}} clickHandler={getPriFooterHandlers()} isLoading={isCreatingSession} loadingText='Processing...' isAnySelected={scheduleType ==='single' ? true : isAnySelected}>

        {currentScreen === DATE_TIME && renderDateTimeScreen()}
        {currentScreen === RESCHEDULE_TYPE && renderRescheduleTypeScreen()}
        {currentScreen === SUCCESS && renderSuccessScreen()}
    </Modal>
}

export default ReScheduleSessionModal