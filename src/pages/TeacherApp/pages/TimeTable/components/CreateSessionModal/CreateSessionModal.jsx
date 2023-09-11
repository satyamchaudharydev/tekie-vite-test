import React, { useState, useEffect, useRef } from 'react'
import { Form, Formik, Field } from 'formik'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import * as yup from 'yup'
import PopUp from '../../../../../../components/PopUp/PopUp'
import Dropdown, { customStyles } from '../../../../components/Dropdowns/Dropdown'
import TopicDropdown from '../../../../components/Dropdowns/TopicDropdown'
import Button from '../../../../components/Button/Button'
import {
  sessionOptions,
  sessionTypeOptions,
} from '../../../../components/Dropdowns/fillerData'
import { CalenderSvg, CloseSvg } from '../../../../components/svg'

import './styles.scss'
import '../../../../components/modalStyles.scss'
import 'react-datepicker/dist/react-datepicker.css'
import getCourseTopics from '../../../../../../queries/teacherApp/getCourseTopics'
import { get } from 'lodash'
import fetchClassroomBatches from '../../../../../../queries/teacherApp/fetchClassroomBatches'
import { subDays } from 'date-fns'
import fetchClassroomBatchesWithId from '../../../../../../queries/teacherApp/getClassroomBatchesWithId'
// import getCourseTopics from '../../../../../../queries/teacherApp/getCourseTopics'
import TimeAndMode from './TimeAndMode'
import makeInputObj from './createInputObj'
import addSession from '../../../../../../queries/teacherApp/addSession'
import { Toaster, getToasterBasedOnType } from '../../../../../../components/Toaster'
import { CalendarOutline, ClockOutline } from '../../../../../../constants/icons'
import getClassroomSessions from '../../../../../../queries/teacherApp/getClassroomSessions'
import getThemeColor from '../../../../../../utils/teacherApp/getThemeColor'
import usePrevious from '../../../../../../utils/teacherApp/usePrevious'
import { useLocation } from 'react-router'
import qs from 'query-string'


const modeContainerStyles = {
  ...customStyles,
  dropdownIndicator: (styles) => ({
    ...styles,
    padding: '4px 2px 8px',
    color: '#0c0c0c',
    height: '16',
    width: '16',
    '&:hover': {
      color: '#0c0c0c'
    },
    'svg > path': {
      height: '16',
    }
  })
}

const newStyles = {
  ...customStyles,
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    fontSize: '14px',
    backgroundColor: isSelected ? getThemeColor() : null,
    '&:hover': {
      backgroundColor: getThemeColor(),
      color: "#ffffff"

    }
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    minHeight: '36px',
    maxHeight: '36px',
    border: '1px solid #AAAAAA',
    boxShadow: '0 0 0 0px black',
    borderRadius: '8px',
    '&:hover': {
      border: '1px solid #AAAAAA',
      boxShadow: '0 0 0 0px black',
    }
  }),
  placeholder: (styles) => ({
    ...styles,
    fontSize: '14px',
    top: '45%',
    color: 'black',
    fontWeight: '400'
  }),
  singleValue: (styles) => ({
    ...styles,
    fontSize: '14px',
    top: '45%',
  }),
  // dropdownIndicator: (styles) => ({
  //   ...styles,
  //   padding: '4px 8px 8px',
  //   color: '#AAA',
  //   height: '16',
  //   width: '16',
  //   '&:hover': {
  //     color: '#AAA'
  //   },
  //   'svg > path': {
  //     height: '16',
  //   }
  // }),
  valueContainer: (styles) => ({
    ...styles,
    padding: '0px 0px 8px 12px'
  }),
  input: (styles) => ({
    ...styles,
    color: 'transparent'
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '140px',
    "::-webkit-scrollbar": {
      width: "4px"
    },
    "::-webkit-scrollbar-thumb": {
      background: "#8C61CB"
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#8C61CB"
    },
  })
}

const dayAndTimeColumns = [{
  day: 'Days',
  isChecked: false,
},
{
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

},
{
  day: 'Sunday',
  isChecked: false,
  startTime: '',
  endTime: '',
  mode: 'online'

}]

const isRecurringSessionSchema = yup.object().shape({
  classroom: yup.object({
    label: yup.string().required(`Classroom Required`),
  }),
  course: yup.object({
    label: yup.string().required(`Course Required`),
  })
})



const isNonRecurringSessionSchema = yup.object().shape({
  classroom: yup.object({
    label: yup.string().required(`Classroom Required`),
  }),
  course: yup.object({
    label: yup.string().required(`Course Required`),
  }),
  mode: yup.object({
    label: yup.string().required(`Mode Required`),
  }),
  type: yup.object({
    label: yup.string().required(`Type Required`),
  }),
  topic: yup.object({
    label: yup.string().required(`Topic Required`),
  })
})

const isNonRecurringSessionSchemaFromCoursePage = yup.object().shape({
  mode: yup.object({
    label: yup.string().required(`Mode Required`),
  }),
  type: yup.object({
    label: yup.string().required(`Type Required`),
  }),
  topic: yup.object({
    label: yup.string().required(`Topic Required`),
  })
})

const RenderModalDaysGrid = ({ values, setFieldValue, handleChange, errors, dayTimeGrid, setDayTimeGrid, selectSessionDay, columns }) => {
  return (
    <>
      <div className='days-grid-row'>
        <div className='days-grid'>
          <label>
            <label class="modal__styled-checkbox-days">
              <Field type="checkbox" name="toggleAllDays" checked={dayTimeGrid[0].isChecked} value={dayTimeGrid[0].day.toLowerCase()} onChange={(e) => {
                const str = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
                selectSessionDay(str)
              }} />
              <div class="box"></div>
            </label>
            <span className='days-grid-span'>Days</span>
          </label>
        </div>
        <div className='time-grid'>
          {columns.startTime && <div className='time-grid-container'>
            <span>Start Time</span>
          </div>}
          {columns.endTime && <div className='time-grid-container'>
            <span>End Time</span>
          </div>}
          {columns.mode && <div className='time-grid-container'>
            <span>Mode</span>
          </div>}
        </div>
      </div>
      <hr />
      {

        dayTimeGrid.slice(1).map((dayTimeObj) => {
          return (
            <div className='days-grid-row'>
              <div className='days-grid'>
                <label>
                  <label class="modal__styled-checkbox-days">
                    <Field type="checkbox" name="daysChecked" checked={dayTimeObj.isChecked} value={dayTimeObj.day.toLowerCase()} onChange={(e) => { const str = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1); selectSessionDay(str) }} />

                    <div class="box"></div>
                  </label>
                  {/* <Field type="checkbox" name="daysChecked" className='days-checkbox' value={day.value}/> */}
                  <span className='days-grid-span'>{dayTimeObj.day}</span>
                </label>
              </div>
              <TimeAndMode columns={columns} dayTimeObj={dayTimeObj} dayTimeGrid={dayTimeGrid} setDayTimeGrid={setDayTimeGrid} />

            </div>
          )
        })
      }
    </>
  )
}

const CreateSessionModal = ({ fetchedCourses, fetchedClassrooms, fetchedCourseTopics, setIsCreateSessionModalVisible, loggedInUser, fetchSessionErrorMessage, addClassRoomSessionErrorMessage, addClassroomSessionErrorList, isCreatingSession, hasCreatedSession, filterClassroomSessionQuery, hasCreateSessionFailed, setFilterOptionsCollection, isCreateSessionModalVisible, fromCoursePage, classroomCourseId, classroomId, getClasroomDetail, src = "timeTable" }) => {

  if (addClassroomSessionErrorList) {
    addClassroomSessionErrorList = addClassroomSessionErrorList.toJS()
  } else {
    addClassroomSessionErrorList = []
  }
  const isRecurringSessionSchemaFromCoursePage = yup.object().shape({
    classroom: yup.object({
      label: yup.string().default(function () {
        return classroomId
      }),
    }),
    course: yup.object({
      label: yup.string().default(function () {
        return classroomCourseId
      }),
    })
  })
  const search = useLocation().search;
  const searchQuery = qs.parse(search)
  const queryValue = get(searchQuery, 'id')

  const [sessionStartDate, setSessionStartDate] = useState(null);
  const [sessionEndDate, setSessionEndDate] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [dayTimeGrid, setDayTimeGrid] = useState(dayAndTimeColumns)
  const [endTime, setEndTime] = useState(moment(startTime).add(30, 'm').toDate());
  const [courseOptions, setCourseOptions] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(fromCoursePage ? classroomCourseId : null)
  const [sessionValidationSchema, setSessionValidationSchema] = useState(fromCoursePage ? isNonRecurringSessionSchemaFromCoursePage : isNonRecurringSessionSchema)
  const [currentOrder, setCurrentOrder] = useState(1)
  const [currentCourseTopics, setCurrentCourseTopics] = useState(0)
  const [sessionType, setSessionType] = useState('batch')
  const selectInputRef = useRef();



  const prevErrorsList = usePrevious(addClassroomSessionErrorList.length)

  const firstMount = useRef(true)

  fetchedCourses = fetchedCourses && fetchedCourses.toJS()
  useEffect(() => {
    if (fetchSessionErrorMessage) {
      getToasterBasedOnType({
        className: 'teacher-app-theme',
        type: 'error',
        message: fetchSessionErrorMessage
      })
    }
  }, [fetchSessionErrorMessage])

  const fetchTopicHandler = async () => {
    let currentOrder = await fetchClassroomBatchesWithId(queryValue)
    currentOrder = get(currentOrder, 'classrooms[0].currentComponent.currentTopic.order', 1)
    let { topics } = await getCourseTopics(classroomCourseId, currentOrder)
    setCurrentCourseTopics(topics)
  }

  useEffect(() => {
    if (!classroomCourseId) return
    if (src === 'classDetail' && queryValue) fetchTopicHandler()
  }, [classroomCourseId])

  useEffect(() => {
    if (firstMount.current) {
      return
    }
    if (addClassRoomSessionErrorMessage && addClassRoomSessionErrorMessage.toJS() && addClassroomSessionErrorList && addClassroomSessionErrorList.length !== prevErrorsList) {
      const getErrorMessage = () => {
        if (addClassroomSessionErrorList) {
          return (get(addClassRoomSessionErrorMessage.toJS()[addClassroomSessionErrorList.length - 1], 'error.errors[0].extensions.exception.data.message') || get(addClassRoomSessionErrorMessage.toJS()[addClassroomSessionErrorList.length - 1], 'error.errors[0].message'))
        } return (get(addClassRoomSessionErrorMessage.toJS()[0], 'error.errors[0].extensions.exception.data.message') || get(addClassRoomSessionErrorMessage.toJS()[0], 'error.errors[0].message'))
      }

      getToasterBasedOnType({
        type: 'error',
        message: getErrorMessage()
      })
    }
  }, [isCreatingSession])


  useEffect(() => {
    if (selectedCourse) {
      (async function () {
        await getCourseTopics(selectedCourse, currentOrder, sessionType !== 'learning')
      })()
    }
  }, [selectedCourse, currentOrder, sessionType])

  useEffect(() => {
    (async function () {
      await fetchClassroomBatches(get(loggedInUser, 'id')).call()
    })()
  }, [])

  useEffect(() => {
    setEndTime(moment(startTime).add(30, 'm').toDate())
  }, [startTime])


  const getIncludeTimes = (startDate) => {
    const includeTimesList = []
    for (let i = 30; i <= 91; i++) {
      const endTime = moment(startDate).add(i, 'm').toDate()
      includeTimesList.push(endTime);
    }
    return includeTimesList
  }

  let modifiedfetchedClassrooms
  if (!fromCoursePage) {
    modifiedfetchedClassrooms = fetchedClassrooms.map(classroom => ({ ...classroom, label: classroom.classroomTitle, value: classroom.id, key: classroom.id }))
  }

  const renderRadioButtons = (values, setFieldValue) => {
    return <div
      className={`modal__rounded-checkbox ${values.isRecurring && 'spacing'}`}
      onChange={e => {
        if (e.target.value === 'yes') {
          setFieldValue('isRecurring', true)
          setSessionValidationSchema(fromCoursePage ? isRecurringSessionSchemaFromCoursePage : isRecurringSessionSchema)
        }
        if (e.target.value === 'no') {
          setFieldValue('isRecurring', false)
          setSessionValidationSchema(isNonRecurringSessionSchema)
        }
      }
      }
    >
      <label className='radio'>Set recurring session?</label>
      <label className='radio'>
        <Field
          type="radio"
          name="isRecurring"
          value="yes"
          checked={values.isRecurring === true}
        />
        <span>Yes</span>
      </label>
      <label className='radio'>
        <Field
          type="radio"
          name="isRecurring"
          value="no"
          checked={values.isRecurring === false}
        />
        <span>No</span>
      </label>
    </div>
  }

  const renderModalHeader = () => (
    <>
      <div className='header-icon'>
        <CalenderSvg />
      </div>
      <div className='header-details'>
        <div className='modal__header-title'>
          Create Session
        </div>
        <div className='modal__header-desc'>
          Schedule your class below
        </div>
      </div>
    </>
  )

  const renderModalMain = (values, handleChange, setFieldValue, errors, touched) => {
    if (values.isRecurring === true) {
      return <div>
        {!fromCoursePage && <div className='modal__dropdown widthFull'>
          <label>Classroom <span className='mandatory-star'>*</span></label>
          <Dropdown
            components={{ IndicatorSeparator: () => null }}
            placeholder='Select classroom'
            isMulti={false}
            styles={newStyles}
            options={modifiedfetchedClassrooms}
            // value={values.classroom}
            onChange={(classroom) => {
              setFieldValue('classroom', { label: get(classroom, 'value') })
              const filteredClassroom = fetchedClassrooms.filter(fetchedClassroom => fetchedClassroom.id === get(classroom, 'id'))
              const courseId = get(filteredClassroom, '[0].courseData.id')
              const courseTitle = get(filteredClassroom, '[0].courseData.title')
              setCourseOptions([{ label: courseTitle, id: courseId, key: courseId }])
              setFieldValue('course', { label: courseId })
              setSelectedCourse(courseId)
              setCurrentOrder(get(filteredClassroom, '[0].currentComponent.currentTopic.order', 0))
            }}
          ></Dropdown>
          {get(errors, 'classroom.label') && get(touched, 'classroom.label') && <p>{get(errors, 'classroom.label')}</p>}
        </div>}
        {!fromCoursePage && <div className='modal__dropdown widthFull'>
          <label>Course <span className='mandatory-star'>*</span></label>
          <Dropdown
            components={{ IndicatorSeparator: () => null }}
            placeholder='Select course'
            isMulti={false}
            styles={newStyles}
            defaultValues={selectedCourse}
            disabled={true}
            value={courseOptions.filter(option => option.id === selectedCourse)[0]}
            onChange={(course) => {
              setSelectedCourse(get(course, 'id'));
              setFieldValue('course', { label: get(course, 'id') })
            }}
            options={courseOptions}
          ></Dropdown>
        </div>}
        {renderRadioButtons(values, setFieldValue)}
        <div className='flexed'>
          <div className='datepicker-container'>
            <label>Start date <span className='mandatory-star'>*</span></label>
            <div className='datepicker-component-wrapper'>
              <DatePicker
                autoComplete='off'
                className='date-container'
                placeholderText="Select date"
                name='sessionDate'
                selected={sessionStartDate}
                onChange={(date) => setSessionStartDate(date)}
                // minDate={moment().toDate()}
                maxDate={sessionEndDate && moment(sessionEndDate).toDate() }
                dateFormat={'d MMM y'}
              />
              <div className='icon-wrapper calendar'>
                <CalendarOutline />
              </div>
            </div>

          </div>
          <div className='datepicker-container'>
            <label>End date <span className='mandatory-star'>*</span></label>
            <div className='datepicker-component-wrapper'>
              <DatePicker
                autoComplete='off'
                className='date-container'
                placeholderText="Select date"
                name='sessionDate'
                selected={sessionEndDate}
                onChange={(date) => setSessionEndDate(date)}
                minDate={sessionStartDate? moment(sessionStartDate).toDate():moment().toDate()}
                dateFormat={'d MMM y'}
              />
              <div className='icon-wrapper calendar'>
                <CalendarOutline />
              </div>
            </div>
          </div>
        </div>
      </div>
    }


    return (
      <>
        <div className='modal__row-double'>
          {!fromCoursePage &&
            <>
              <div className='modal__dropdown'>
                <label>Classroom <span className='mandatory-star'>*</span></label>
                <Dropdown
                  components={{ IndicatorSeparator: () => null }}
                  placeholder='Select classroom'
                  isMulti={false}
                  styles={newStyles}
                  onChange={(classroom) => {
                    setFieldValue('classroom', { label: get(classroom, 'id') })
                    const filteredClassroom = fetchedClassrooms.filter(fetchedClassroom => fetchedClassroom.id === get(classroom, 'id'))
                    const courseId = get(filteredClassroom, '[0].courseData.id')
                    const courseTitle = get(filteredClassroom, '[0].courseData.title')
                    setCourseOptions([{ label: courseTitle, id: courseId, key: courseId }])
                    setFieldValue('course', { label: courseId })
                    setFieldValue('topic', { label: '' })
                    selectInputRef.current.select.clearValue();
                    setSelectedCourse(courseId)
                    setCurrentOrder(get(filteredClassroom, '[0].currentComponent.currentTopic.order', 0))
                  }}
                  options={modifiedfetchedClassrooms}
                ></Dropdown>
                {get(errors, 'classroom.label') && get(touched, 'classroom.label') && <p>{get(errors, 'classroom.label')}</p>}
              </div>
              <div className='modal__dropdown'>
                <label>Course <span className='mandatory-star'>*</span></label>
                <Dropdown
                  components={{ IndicatorSeparator: () => null }}
                  isMulti={false}
                  styles={newStyles}
                  options={courseOptions}
                  disabled={true}
                  value={courseOptions.filter(option => option.id === selectedCourse)[0]}
                  placeholder={get(courseOptions[0], 'title') || 'Select course'}
                  onChange={(course) => {
                    setSelectedCourse(get(course, 'id'));
                    setFieldValue('course', { label: get(course, 'id') })
                  }}
                ></Dropdown>
              </div>
            </>
          }
        </div>

        <div className='modal__row-double'>
          <div className='modal__dropdown'>
            <label>Session Mode <span className='mandatory-star'>*</span></label>
            <Dropdown
              components={{ IndicatorSeparator: () => null }}
              placeholder='Select mode'
              isMulti={false}
              styles={newStyles}
              options={sessionOptions}
              onChange={(mode) => {
                setFieldValue('mode', { label: get(mode, 'value') })
              }}
            ></Dropdown>
          </div>
          <div className='modal__dropdown'>
            <label>Session Type <span className='mandatory-star'>*</span></label>
            <Dropdown
              components={{ IndicatorSeparator: () => null }}
              placeholder='Select type'
              isMulti={false}
              styles={newStyles}
              options={sessionTypeOptions}
              onChange={(type) => {
                setSessionType(get(type, 'value'))
                setFieldValue('type', { label: get(type, 'value') })
              }}
            ></Dropdown>
          </div>
        </div>

        <div className='modal__row-single'>
          <div className='modal__dropdown-full'>
            <label>Select Topic <span className='mandatory-star'>*</span></label>
            <TopicDropdown
              selectInputRef={selectInputRef}
              styles={newStyles}
              groupedOptions={fromCoursePage ? currentCourseTopics || [] : fetchedCourseTopics}
              setFieldValue={setFieldValue}
              teacherApp
            />
          </div>
        </div>
        {renderRadioButtons(values, setFieldValue)}
      </>
    )
  }


  const selectSessionDay = (label) => {
    //Days,monday
    const dayTimeGridCopy = [...dayTimeGrid]
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
        const updatedOptionsList = dayTimeGridCopy.map(option => {
          return { ...option, isChecked: false }
        })
        setDayTimeGrid(updatedOptionsList)
        return
      }
      const updatedOptionsList = dayTimeGridCopy.map(option => {
        return { ...option, isChecked: true }
      })
      setDayTimeGrid(updatedOptionsList)
      return
    }

    const updatedOptionsList = dayTimeGridCopy.map(option => {
      if (option.day === label) return { ...option, isChecked: !option.isChecked }
      return option
    })
    if (areAllOptionsCheckedExceptSelectAll(updatedOptionsList)) {
      const updatedOptionsList = dayTimeGridCopy.map(option => {
        return { ...option, isChecked: true }
      })
      return setDayTimeGrid(updatedOptionsList)
    }
    setDayTimeGrid(updatedOptionsList)

  }

  const renderDateSection = (values, handleChange, setFieldValue, errors) => {

    return (
      <div className='date-section-container'>
        <div className='datepicker-container'>
          <label>Session Date <span className='mandatory-star'>*</span></label>
          <div className='datepicker-component-wrapper'>
            <DatePicker
              autoComplete='off'
              className='date-container'
              placeholderText="Select a day"
              name='sessionDate'
              selected={sessionStartDate}
              onChange={(date) => {
                setFieldValue('sessionDate', moment(date).format())
                setSessionStartDate(date)
              }}
              minDate={moment().toDate()}
              dateFormat={'d MMM y'}
            />
            <div className='icon-wrapper calendar'>
              <CalendarOutline />
            </div>
          </div>

        </div>
        <div className='time-section-container'>
          <div className='time-grid-container'>
            <label>Start Time</label>
            <div className='datepicker-component-wrapper'>
              <DatePicker
                autoComplete={false}
                onKeyDown={(e) => { e.preventDefault() }}
                className='time-container'
                placeholderText='Start'
                selected={startTime}
                onChange={(time) => {
                  setFieldValue('startTime', moment(time).format())
                  setFieldValue('endTime', moment(moment(time).add(30, 'm').toDate()).format())
                  setStartTime(time)
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
              />
              <div className='icon-wrapper'>
                <ClockOutline />
              </div>
            </div>

          </div>
          <span>To</span>
          <div className='time-grid-container'>
            <label>End Time</label>
            <div className='datepicker-component-wrapper'>
              <DatePicker
                autoComplete={false}
                onKeyDown={(e) => { e.preventDefault() }}
                className='time-container'
                placeholderText='Start'
                selected={endTime}
                defaultValues={endTime}
                onChange={(time) => {
                  setFieldValue('endTime', moment(time).format())
                  setEndTime(time)
                }}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                includeTimes={getIncludeTimes(startTime)}
                timeCaption="Time"
                dateFormat="h:mm aa"
                minDate={subDays(new Date(), 5)}

              />
              <div className='icon-wrapper'>
                <ClockOutline />
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }

  const isDisabled = (values) => {
    const noDaySelected = () => {
      const atleastOneDayChecked = dayTimeGrid.find(obj => obj.isChecked)
      return atleastOneDayChecked ? false : true
    }
    if (fromCoursePage) {
      if (values.isRecurring) {
        if (noDaySelected() || !sessionStartDate || !sessionEndDate) return true
        return false
      } else {
        if (!values.mode.label  || !values.type.label  || !values.topic.label  || !sessionStartDate) return true
        return false
        
      }
    }
    if (values.isRecurring) {
      if (!values.course.label  || !values.classroom.label  || noDaySelected() || !sessionStartDate || !sessionEndDate) return true
      return false
    } else {
      if (!values.course.label  || !values.classroom.label  || !values.mode.label  || !values.type.label  || !values.topic.label  || !sessionStartDate) return true
      return false
    }
  }

  const renderFooter = (values, handleChange, errors) => {
    return (
      <>
        <div className='footer-btns-container'>
          <button className='modal__cancel-btn' onClick={() => setIsCreateSessionModalVisible(false)}>
            Cancel
          </button>
          <Button text={isCreatingSession ? 'Creating...' : 'Submit Details'} isLoading={isCreatingSession} isDisabled={isDisabled(values)} />
        </div>
        {/* <button className='modal__cancel-btn' onClick={()=>setIsCreateSessionModalVisible(false)}>
          Cancel
        </button>
        <button className='modal__save-btn' type='submit' disabled={isDisabled(values)}>
          Submit Details
        </button>   */}
      </>
    )
  }


  const handleSubmit = async (values) => {
    if (!values.isRecurring) {
      const inputForScheduleSessionQuery = makeInputObj(fromCoursePage ? { ...values, classroom: { label: classroomId }, course: { label: classroomCourseId } } : values)
      await addSession(inputForScheduleSessionQuery).then(() => {
        if(src === 'classDetail'){
          getClasroomDetail()
        }
      }).catch(error => {
        console.log({ error })
      })
    } else {
      let inputValueObj = {}
      if (fromCoursePage) {
        inputValueObj = { ...values, classroom: { label: classroomId }, course: { label: classroomCourseId }, }
      } else {
        inputValueObj = values
      }
      const inputForScheduleSessionQuery = makeInputObj(inputValueObj, { dayTimeGrid }, sessionStartDate, sessionEndDate)
      await addSession(inputForScheduleSessionQuery).then(() => {
        if (src === 'classDetail') {
          getClasroomDetail()
        }
      }).catch(error => {
        console.log({ error })
      })
    }
  }


  useEffect(() => {
    if (firstMount.current) {
      return
    }
    if (hasCreatedSession) {
      getToasterBasedOnType({
        className: 'teacher-app-theme',
        type: "success",
        message: "Session created successfully!"
      });
      (async function () {
        try {
          if (filterClassroomSessionQuery.startDate && filterClassroomSessionQuery.endDate) {
            await getClassroomSessions(filterClassroomSessionQuery, loggedInUser)
          }
        } catch (err) {
          console.log(err)
        }
      })()
      setIsCreateSessionModalVisible(false)
      hasCreatedSession = false
    }

  }, [isCreatingSession])

  useEffect(() => {
    firstMount.current = false
    return () => firstMount.current = true
  }, [])

  return (
    <PopUp
      showPopup={true}
    >
      <div className='modal__container-backdrop'>
        <div className='teacher-modal-popup'>
          <div className='teacher-modal-container'>
            
            <div className='modal__close-icon' onClick={() => setIsCreateSessionModalVisible(false)}>
              <CloseSvg />
            </div>
            <div className='modal__header'>
              {renderModalHeader()}
            </div>
            <Formik
              initialValues={{
                isRecurring: false,
                toggleAllDays: false,
                sessionDate: sessionStartDate,
                startTime: moment().format(),
                endTime: moment(moment(startTime).add(30, 'm').toDate()).format(),
                classroom: { label: '' },
                course: { label: '' },
                mode: { label: '' },
                type: { label: '' },
                topic: { label: '' },
                scheduleSessionRules: []
              }}
              onSubmit={(values) => {
                handleSubmit(values)
              }}
              // enableReinitialize={true}
              validationSchema={sessionValidationSchema}
            >
              {({ values, handleChange, setFieldValue, errors, touched }) => {
                return <Form>
                  <div className='modal__content'>
                    <div className='modal__top-content'>
                      {renderModalMain(values, handleChange, setFieldValue, errors, touched)}
                    </div>

                    {
                      values.isRecurring && (
                        <div className='modal__lower-content'>
                          <RenderModalDaysGrid values={values} setFieldValue={setFieldValue} handleChange={handleChange} errors={errors} dayTimeGrid={dayTimeGrid} setDayTimeGrid={setDayTimeGrid} selectSessionDay={selectSessionDay} columns={{ startTime: true, endTime: true, mode: true }} />
                        </div>
                      )
                    }
                    {
                      !values.isRecurring && (
                        <div className='modal__lower-content'>
                          {renderDateSection(values, handleChange, setFieldValue, errors)}
                        </div>
                      )
                    }
                  </div>
                  <div className='modal__footer'>
                    {renderFooter(values, handleChange, errors)}
                  </div>
                </Form>
              }}
            </Formik>

          </div>
        </div>
      </div>
    </PopUp>
  )
}


export { RenderModalDaysGrid }
export default CreateSessionModal
