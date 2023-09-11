import React, { useState, useEffect, useRef } from 'react'
import { Form, Formik, Field, ErrorMessage } from 'formik'
import * as yup from 'yup'
import { get, sortBy } from 'lodash'

import PopUp from '../../../../components/PopUp/PopUp'
import Dropdown, { customStyles } from '../Dropdowns/Dropdown'
import { gradeOptions } from '../Dropdowns/fillerData'
import { CalenderSvg, CloseSvg } from '../svg'

import '../updatedModalStyles.scss'
import './createMentorModalStyles.scss'
import ToggleButton from '../ToggleButton/ToggleButton'

import addTeacherUserProfile from '../../../../queries/teacherApp/addTeacherProfile'

const initialClassSettings = [
  { id:'Scheduling Learning Classes', inputTag: 'isSchedulingLearningClass', tag: 'Class Settings', isChecked: true },
  { id:'Scheduling Ad-Hoc Classes' , inputTag: 'isSchedulingAdhocClass', tag: 'Class Settings', isChecked: true },
  { id:'Rescheduling Classes' , inputTag: 'isReschedulingClasses', tag: 'Class Settings', isChecked: true },
  { id:'Scheduling Test' , inputTag: 'isSchedulingTestClass', tag: 'Class Settings', isChecked: true },
  { id:'Delete Session' , inputTag: 'isDeleteSessions', tag: 'Class Settings', isChecked: true },
]
const initialClassroomPermissions = [
  { id:'Creating Classroom' , inputTag: 'isCreatingClass', tag: 'Classroom Permissions', isChecked: true },
  { id:'Send Notices' , inputTag: 'isSendingNotice', tag: 'Classroom Permissions', isChecked: true },
  { id:'Add/Invite Students' , inputTag: 'shouldAddOrInviteStudent', tag: 'Classroom Permissions', isChecked: true },
  { id:'Access Recordings' , inputTag: 'isAccessRecording', tag: 'Classroom Permissions', isChecked: true },
  { id:'Live Session Progress' , inputTag: 'isAccessLiveSessionProgress', tag: 'Classroom Permissions', isChecked: true },
]
const initialTestPermissions = [
  { id:'Access Course Control' , inputTag: 'shouldAccessCourse',  tag: 'Test Permissions', isChecked: true },
  { id:'Create Test' , inputTag: 'shouldCreateTest', tag: 'Test Permissions', isChecked: true },
  { id:'Evalute Test' , inputTag: 'shouldEvaluateTest', tag: 'Test Permissions', isChecked: true },
  { id:'Add to question bank' , inputTag: 'shouldAddToQuestionBank', tag: 'Test Permissions', isChecked: true },
]
const initialReportPermsissions = [
  { id:'Access Reports' , inputTag: 'shouldAccessReports', tag: 'Report Permissions', isChecked: true },
  { id:'Download Reports' , inputTag: 'shouldDownloadReports', tag: 'Report Permissions', isChecked: true },
  { id:'Share Reports' , inputTag: 'shouldShareReports', tag: 'Report Permissions', isChecked: true },
]

const accessOptions = [
  {value: 'teacher', label:'Teacher'},
  {value: 'custom', label:'Custom'}
]

const newStyles = {
  ...customStyles,
  option: (styles, { isSelected }) => ({
    ...styles,
    cursor: 'pointer',
    backgroundColor: isSelected ? '#8C61CB': null,
    '&:hover' : {
      backgroundColor: '#f5f5f5',
      color: '#000',
    }
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'pointer',
    border: '1px solid #AAAAAA',
    boxShadow: '0 0 0 0px black',
    '&:hover' : {
      border: '1px solid #AAAAAA',
      boxShadow: '0 0 0 0px black',
    }
  }),
  input: (styles) => ({
    ...styles,
    color: 'transparent'
  }),
}

const CreateMentorModal = (props) => {

  const [activeTab, setActiveTab] = useState('Step 1')
  const [prevTab, setPrevTab] = useState('Cancel')
  const [classSettings, setClassSettings] = useState([...initialClassSettings])
  const [classroomPermissions, setClassroomPermissions] = useState([...initialClassroomPermissions])
  const [testPermissions, setTestPermissions] = useState([...initialTestPermissions])
  const [reportPermissions, setReportPermissions] = useState([...initialReportPermsissions])

  const formRef = useRef()

  // useEffect(() => {
  //   async function visibleModalCheck() {
  //     if (props.visible) {
  //       setSubmitting(false)
  //       if (formRef && formRef.current) {
  //         formRef.current.resetForm()
  //         setActiveTab('Step 1')
  //         setPrevTab('Cancel')
  //         if (props.schoolId) await callClassroomTitlesQuery()
  //       }
  //     }
  //   }
  //   visibleModalCheck()
  // }, [props.visible])

  const tabStates = ['Step 1', 'Step 2']
  const settingArray = ['Class Settings','Classroom Permissions','Test Permissions','Report Permissions']

  const renderModalHeader = () => (
    <>
      <div className='header-icon'>
        <CalenderSvg />
      </div>
      <div className='header-details'>
        <div className='modal__header-title'>
          Add a new teacher
        </div>
        <div className='modal__header-desc-class'>
          {`${activeTab} of 2`}
        </div>
      </div>
    </>
  )
  
  const validationSchemaStepOne = yup.object().shape({
    selectedGrades: yup.array().min(1, "Min. 1 grade required").required("Min. 1 grade required"),
    selectedAccessType: yup.object({
      label: yup.string().required(`Access Type required`),
    }),
    teacherName: yup.string().trim().required('Teacher Name required').min(3, 'Teacher Name (Min. 3 characters)').max(30, 'Teacher Name (Max. 30 characters)'),
    phone: yup.string().required('Phone required').matches(/^[6-9]\d{9}$/, 'Phone (Invalid format)'),
    email: yup.string().required('Email required').email('Email (Invalid format)'),
    password: yup.string().trim().required('Password required').min(3, 'Password (Min. 3 characters)').max(30, 'Password (Max. 30 characters)'),
    confirmPassword: yup.string().when("password", {
      is: val => (val && val.length > 0 ? true : false),
      then: yup.string().oneOf(
        [yup.ref("password")],
        "Passwords do not match"
      ).required("Confirm password"),
    })
  })

  const handleCancelPrevClick = () => {
    if (prevTab === 'Cancel') {
    }
    if (prevTab === 'Step 1') {
      setPrevTab('Cancel')
      setActiveTab('Step 1')
    }
  }


  const handleSaveNextClick = async (values) => {
    if (activeTab === 'Step 1') {
      setPrevTab('Step 1')
      setActiveTab('Step 2')
    }
    if (activeTab === 'Step 2') {

      const userInput = {
        teacherName: get(values, 'teacherName'),
        email: get(values, 'email'),
        password: get(values, 'password'),
        phone: `${get(values, 'phone')}`,
        schoolConnectIds: [props.schoolId],
        schoolClassesConnectIds: values.selectedGrades.map((elem) => elem.value)
      }
      const settingsInput = {
        scheduleManagement: handleSettingsSubmissions(classSettings),
        classroomControl: handleSettingsSubmissions(classroomPermissions),
        courseControl: handleSettingsSubmissions(testPermissions),
        sessionReporting: handleSettingsSubmissions(reportPermissions),
        accessType: get(values, 'selectedAccessType.value')
      }

      await addTeacherUserProfile(userInput, settingsInput)
    }
  }

  const handleSettingsSubmissions = (arr) => {
    let obj = {}
    arr.forEach((elem) => {
      obj[elem['inputTag']] = elem.isChecked
    })
    return obj
  }

  const handleToggleClick = (elem) => {
    if (elem.tag === 'Class Settings') setClassSettings(prevState => prevState.map(setting => setting.id === elem.id ? {...elem, isChecked:!elem.isChecked}: setting ))
    if (elem.tag === 'Classroom Permissions') setClassroomPermissions(prevState => prevState.map(setting => setting.id === elem.id ? {...elem, isChecked:!elem.isChecked}: setting ))
    if (elem.tag === 'Test Permissions') setTestPermissions(prevState => prevState.map(setting => setting.id === elem.id ? {...elem, isChecked:!elem.isChecked}: setting ))
    if (elem.tag === 'Report Permissions') setReportPermissions(prevState => prevState.map(setting => setting.id === elem.id ? {...elem, isChecked:!elem.isChecked}: setting ))
  }

  const renderInputRow = (...args) => {
    const [labelName, inputName, value, placeholder, handleChange, errors, touched] = args
    return (
    <div className='modal__row-single'>
      <div className='modal__dropdown-full-input'>
        <label>{labelName} <span style={{ color: 'red' }}>*</span></label>
        <input
          className='modal__full-input'
          name={inputName}
          // value={value}
          // onChange={handleChange}
          placeholder={placeholder}
        ></input>
      </div>
      {/* {get(errors, 'classroomName') && get(touched, 'classroomName') ? (<span className='modal__error-span'>{classroomNameError ? classroomNameError : errors.className}</span>) : null} */}
    </div>
  )}

  const renderToggleRow = (headerLabel, mapOptions) => (
    <div className='modal__teacher-admin-row'>
      <label className='modal__teacher-admin-row-header-label'>{headerLabel}</label>
      {
        mapOptions && mapOptions.map((elem) => (
          <div className='modal__teacher-admin-row-data' key={elem.id}>
            <label className='modal__teacher-admin-row-data-label'>{elem.id}</label>
            <ToggleButton
              elemData={elem}
              className='modal__teacher-admin-toggle-container'
              checked={elem.isChecked}
              toggleClickHandler={handleToggleClick}
            />
          </div>
        ))
      }
    </div>
  )

  const renderModalMain = (values, handleChange, setFieldValue, touched, errors) => {
    return (
      <>
        {
          activeTab === 'Step 1' && (
            <>
              {/* {renderInputRow('Teacher Name', 'teacherName', '', 'Teacher Name', handleChange, errors, touched)} */}
              <div className='modal__row-single'>
                <div className='modal__dropdown-full-input'>
                  <label>Teacher Name <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className='modal__full-input'
                    name='teacherName'
                    value={values.teacherName}
                    onChange={handleChange}
                    placeholder='Teacher Name'
                  ></input>
                </div>
                {get(errors, 'teacherName') && get(touched, 'teacherName') ? (<span className='modal__error-span'>{errors.teacherName}</span>) : null}
              </div>
              <div className='modal__row-single'>
                <div className='modal__dropdown-full-input'>
                  <label>Email <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className='modal__full-input'
                    name='email'
                    value={values.email}
                    onChange={handleChange}
                    placeholder='Email'
                  ></input>
                </div>
                {get(errors, 'email') && get(touched, 'email') ? (<span className='modal__error-span'>{errors.email}</span>) : null}
              </div>
              <div className='modal__row-single'>
                <div className='modal__dropdown-full-input'>
                  <label>Password <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className='modal__full-input'
                    name='password'
                    type='password'
                    value={values.password}
                    onChange={handleChange}
                    placeholder='Password'
                  ></input>
                </div>
                {get(errors, 'password') && get(touched, 'password') ? (<span className='modal__error-span'>{errors.password}</span>) : null}
              </div>
              <div className='modal__row-single'>
                <div className='modal__dropdown-full-input'>
                  <label>Confirm Password <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className='modal__full-input'
                    name='confirmPassword'
                    type='password'
                    value={values.confirmPassword}
                    onChange={handleChange}
                    placeholder='Confirm Password'
                  ></input>
                </div>
                {get(errors, 'confirmPassword') && get(touched, 'confirmPassword') ? (<span className='modal__error-span'>{errors.confirmPassword}</span>) : null}
              </div>
              <div className='modal__row-single'>
                <div className='modal__dropdown-full-input'>
                  <label>Phone Number <span style={{ color: 'red' }}>*</span></label>
                  <input
                    className='modal__full-input'
                    name='phone'
                    type='number'
                    min="0"
                    onKeyDown={ (evt) => (evt.key === 'e' || evt.key === '+' || evt.key === '-') && evt.preventDefault() }
                    value={values.phone}
                    onChange={handleChange}
                    placeholder='Phone'
                  ></input>
                </div>
                {get(errors, 'phone') && get(touched, 'phone') ? (<span className='modal__error-span'>{errors.phone}</span>) : null}
              </div>
              <div className='modal__row-single'>
                <div className='modal__dropdown-full-input'>
                  <label>Select Grades <span style={{ color: 'red' }}>*</span></label>
                  <Dropdown
                    components={{ IndicatorSeparator: () => null }}
                    name='selectedGrades'
                    placeholder='Grade'
                    value={values.selectedGrades.length ? values.selectedGrades : null}
                    className='createMentorModal-select'
                    classNamePrefix='createMentorModal-select'
                    styles={newStyles}
                    isMulti={true}
                    options={props.classesData || []}
                    onChange={(_option, action) => {
                      const { selectedGrades } = values
                      let selectedOption = {}
                      let newFilter = []
                      if (action.action === 'select-option') {
                        selectedOption = action.option
                        newFilter = [...selectedGrades, selectedOption]
                      } else if (action.action === 'remove-value') {
                        newFilter = selectedGrades.filter((item) => item.value !== action.removedValue.value)
                      }
                      setFieldValue('selectedGrades', newFilter)
                    }}
                  >
                  </Dropdown>
                </div>
                {get(errors, 'selectedGrades') && get(touched, 'selectedGrades') ? (<span className='modal__error-span'>{errors.selectedGrades}</span>) : null}
              </div>
              <div className='modal__row-single'>
                <div className='modal__dropdown-full-input'>
                  <label>Access Type <span style={{ color: 'red' }}>*</span></label>
                  <Dropdown
                    components={{ IndicatorSeparator: () => null }}
                    name='selectedGrade'
                    placeholder='Grade'
                    value={values.selectedAccessType.value ? values.selectedAccessType : null}
                    isMulti={false}
                    className='createMentorModal-select'
                    classNamePrefix='createMentorModal-select'
                    styles={newStyles}
                    options={accessOptions}
                    onChange={(option, _action) => setFieldValue('selectedAccessType', option)}
                  >
                  </Dropdown>
                </div>
                {get(errors, 'selectedAccessType.label') && get(touched, 'selectedAccessType.label') ? (<span className='modal__error-span'>{errors.selectedAccessType.label}</span>) : null}
              </div>
            </>
          )
        }
        {
          activeTab === 'Step 2' && (
            <>
              <div className='modal__teacher-admin-table'>
                {renderToggleRow('Class Settings', classSettings)}
                {renderToggleRow('Classroom Permissions', classroomPermissions)}
                {renderToggleRow('Test Permissions', testPermissions)}
                {renderToggleRow('Report Permissions', reportPermissions)}
              </div>
            </>
          )
        }
        
      </>
    )
  }

  const renderFooter = (values, handleChange, setFieldValue,closeModal)  => {
  
    return (
      <>
        {/* {
          tabStates.includes(activeTab) && (
            <> */}
              <button
                className='modal__cancel-btn'
                // disabled={buttonClicked}
                // onClick={() => handleCancelPrevClick(handleChange, setFieldValue)}
                onClick={()=>closeModal(false)}
              >
                {activeTab === 'Step 2' ? 'Go Back' : 'Cancel'}
              </button>
              <div className='modal__button-container'>
                <button 
                  className='modal__contact-btn'
                  // disabled={buttonClicked}
                  // onClick={() => props.showContactInfo()}
                >
                  Contact Us
                </button>
                <button
                  className={
                    // isSubmitting ? 'modal__save-btn-loading' : 
                    // isNext ? 'modal__next-btn-loading' :
                    // activeTab !== 'Step 2' ? 'modal__save-btn' :
                    // (activeTab === 'Step 2' && values.selectedCourse.label) ? 'modal__save-btn' :
                    // 'modal__save-btn modal__disabled-btn'
                    'modal__save-btn'
                  }
                  // htmlType='submit'
                  // disabled={buttonClicked}
                  onClick={async () => {
                    // handleSaveNextClick()
                    // setButtonClicked(true)
                    let errors = await formRef.current.validateForm();
                    if (Object.keys(errors).length === 0 && errors.constructor === Object) {
                      handleSaveNextClick(values)
                    //     const findClassroomTitleExists = classroomData.find((classroom) => classroom.classroomTitle === values.classroomName)
                    //     if (findClassroomTitleExists) {
                    //       setClassroomNameError('Classroom with this name already exists.')
                    //       setButtonClicked(false)
                    //     } else {
                    //       setClassroomNameError('')
                    //       handleSaveNextClick(values, setFieldValue)
                    //     }
                    //   } else {
                    //     handleSaveNextClick(values, setFieldValue)
                    //   }
                    } else {
                      // setButtonClicked(false)
                    }
                  }
                  }
                >
                  {/* {
                    (isSubmitting || isNext) && (
                      <div className='classModal-btn-loader'>
                        <LoadingSpinner
                          width={'100%'}
                          height={'100%'}
                          color={'white'}
                        />
                      </div>
                    )
                  } */}
                  {/* {isSubmitting ? 'Processing' : 'Confirm and Go Next'} */}
                  Confirm and Go Next
                </button>
              </div>
            {/* </>
          )
        } */}
      </>
    )
  }

  return (
    <PopUp
      showPopup={true}
    >
      <div className='modal__container-backdrop'>
        <div className='teacher-modal-popup'>
          <div className='teacher-modal-container'>
            <div className='modal__close-icon' onClick={() => props.closeModal()}>
              <CloseSvg />
            </div>
            <div className='modal__header'>
              {renderModalHeader()}
            </div>
            <Formik
              initialValues={{
                selectedGrades: [],
                teacherName: '',
                phone: '',
                email: '',
                password: '',
                confirmPassword: '',
                selectedAccessType: { value: '', label: '' },
              }}
              validationSchema={
                activeTab === 'Step 1' ? validationSchemaStepOne : null
                // :
                  // activeTab === 'Step 2' ? validationSchemaStepTwo :
                  //   null
              }
              innerRef={formRef}
              validateOnBlur
            >
              {({ values, handleChange, setFieldValue, touched, errors }) => (
                <Form>
                  <div className='modal__fixed-content'>
                    {console.log(errors)}
                    {
                      true &&
                      // <div className={activeTab !== 'Step 3' ? 'modal__top-content' : 'modal__top-content-students'}>
                      <div className='top-content'>
                        {/* {activeTab === 'Step 1' && renderThumbnailRow(values, setFieldValue)} */}
                        {renderModalMain(values, handleChange, setFieldValue, touched, errors)}
                      </div>
                    }
                  </div>
                  <div className='modal__footer'>
                    {renderFooter(values, handleChange, setFieldValue , props.closeModal) }
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </PopUp>
  )
}

export default CreateMentorModal
