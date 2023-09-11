import React, { useState, useEffect, useRef } from 'react'
import { Form, Formik, Field } from 'formik'
import * as yup from 'yup'
import { get, sortBy } from 'lodash'
import gql from 'graphql-tag'

import PopUp from '../../../../../../components/PopUp/PopUp'
import Dropdown, { customStyles } from '../../../../components/Dropdowns/Dropdown'

import { CalenderSvg, CloseSvg, SearchSvg, BatchSvg } from '../../../../components/svg'
import approval from '../../../../../../assets/teacherApp/approval.png'
import congrats from '../../../../../../assets/teacherApp/congrats.png'

import '../../../../components/modalStyles.scss'
import './classroomModalStyles.scss'
import LoadingSpinner from '../../../../components/Loader/LoadingSpinner'
import getPath from '../../../../../../utils/getPath'
import extractSubdomain from '../../../../../../utils/extractSubdomain'
import requestToGraphql from '../../../../../../utils/requestToGraphql'
import fetchClassroomStudentProfiles from '../../../../../../queries/teacherApp/fetchClassroomStudentProfiles'
import fetchClassroomCourses from '../../../../../../queries/teacherApp/fetchClassroomCourses'
import addClassroomBatch from '../../../../../../queries/teacherApp/addClassroomBatch'
import { fetchSchoolClasses } from '../../../../../../queries/teacherApp/fetchSchoolClasses'
import fetchSchoolBatchCodes from '../../../../../../queries/teacherApp/fetchSchoolBatchCodes'
import { getToasterBasedOnType } from '../../../../../../components/Toaster'
import { teacherAppSubDomains } from '../../../../../../constants'

const thumbnailsArray = [
  "python/clasroomThumbnail_1.png",
  "python/clasroomThumbnail_2.png",
  "python/clasroomThumbnail_3.png",
  "python/clasroomThumbnail_4.png",
  "python/clasroomThumbnail_5.png",
  "python/clasroomThumbnail_6.png",
];

const TekieAmethyst = '#8C61CB'

const newStyles = {
  ...customStyles,
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    cursor: 'pointer',
    // fontFamily: 'Inter',
    // fontSize: '14px',
    // fontWeight: '400',
    backgroundColor: isSelected ? '#8C61CB' : null,
    '&:hover': {
      backgroundColor: '#f5f5f5',
      color: '#000',
    }
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'pointer',
    // fontFamily: 'Inter',
    // minHeight: '36px',
    // maxHeight: '36px',
    border: '1px solid #AAAAAA',
    boxShadow: '0 0 0 0px black',
    // borderRadius: '8px',
    '&:hover': {
      border: '1px solid #AAAAAA',
      boxShadow: '0 0 0 0px black',
    }
  }),
  // placeholder: (styles, state) => ({
  //   ...styles,
  //   fontSize: '14px',
  //   top: '45%',
  //   color: 'black',
  //   fontWeight: '400'
  // }),
  // singleValue: (styles) => ({
  //   ...styles,
  //   fontSize: '14px',
  //   top: '45%',
  // }),
  // dropdownIndicator: (styles) => ({
  //   ...styles,
  //   fontSize: '14px',
  //   top: '45%',
  // }),
  // valueContainer: (styles) => ({
  //   ...styles,
  //   padding: '0px 0px 8px 12px'
  // }),
  input: (styles) => ({
    ...styles,
    color: 'transparent'
  }),
  // menu: (provided, state) => ({
  //   ...provided,
  //   border: "none",
  //   boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1), 0px 0px 2px rgba(0, 0, 0, 0.2)',
  //   borderRadius: '5px',
  // }),
  // menuList: (base) => ({
  //   ...base,
  // maxHeight: '140px',
  //   "::-webkit-scrollbar": {
  //     width: "4px",
  //   },
  //   "::-webkit-scrollbar-thumb": {
  //     background: "rgba(140, 97, 203, 0.6) ",
  //     marginRight: "6px",
  //   },
  //   "::-webkit-scrollbar-thumb:hover": {
  //     background: "#8C61CB",
  //   },
  // }),
}

const ClassroomModal = (props) => {
  const [activeTab, setActiveTab] = useState('Step 1')
  const [prevTab, setPrevTab] = useState('Cancel')
  const [classroomNameError, setClassroomNameError] = useState('')
  const [studentProfiles, setStudentProfiles] = useState([])
  const [classroomData, setClassroomData] = useState([])
  const [filterCount, setFilterCount] = useState(0)
  const [buttonClicked, setButtonClicked] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [isNext, setNext] = useState(false)
  const [courseClassCombinationCheck, setCourseClassCombinationCheck] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)

  const formRef = useRef()

  const modifiedTeachersList = props.teachersList && props.teachersList.map(teacher => ({ id: get(teacher, 'user.id'), key: get(teacher, 'user.id'), label: get(teacher, 'user.name'), value: get(teacher, 'user.id') }))

  useEffect(() => {
    async function visibleModalCheck() {
      if (props.visible) {
        setSubmitting(false)
        if (formRef && formRef.current) {
          formRef.current.resetForm()
          setActiveTab('Step 1')
          setPrevTab('Cancel')
          if (props.schoolId) await callClassroomTitlesQuery()
          await fetchSchoolClasses(props.schoolId)
          let schoolCode = extractSubdomain().toUpperCase()
          const capitalizedSubDomains = teacherAppSubDomains.map(domain => domain.toUpperCase())
          if (capitalizedSubDomains.includes(schoolCode)) {
            schoolCode = get(props.loggedInUser, 'mentorProfile.schools[0].code', '').toUpperCase();
          }
          await fetchSchoolBatchCodes(schoolCode)
        }
        setStudentProfiles([])
      }
    }
    visibleModalCheck()
  }, [props.visible])

  // useEffect(()=>{
  //    (async function(){
  //       await getTeachersList(props.loggedInUser)
  //    })()
  // },[props.teachersList.length])

  const tabStates = ['Step 1', 'Step 2', 'Step 3']

  const validationSchemaStepOne = yup.object().shape({
    selectedSection: yup.object({
      label: yup.string().required(`Section Required`),
    }),
    selectedGrade: yup.object({
      label: yup.string().required(`Grade Required`),
    }),
    classroomName: yup.string().trim().required('Classroom Name required').min(3, 'Classroom Name (Min. 3 characters)').max(30, 'Classroom Name (Max. 30 characters)')
  })

  const validationSchemaStepTwo = yup.object().shape({
    selectedCourse: yup.object({
      label: yup.string().required(`Course Reqired`),
    })
  })

  const modalInitialValues = {
    selectedGrade: { value: '', label: '' },
    selectedSection: { value: '', label: '', id: '' },
    selectedTeacher: { value: '', label: '', id: '' },
    selectedCourse: { value: '', label: '', id: '', tools: [], programming: [], theory: [] },
    classroomName: '',
  }

  const callClassroomTitlesQuery = async () => {
    const checkClassroomTitle = await requestToGraphql(
      gql`
        query {
          batches(filter:{ 
            and: [
              {
                school_some: { id: "${props.schoolId}" } 
              }
              {
                documentType: classroom
              }
            ]
          }) {
            id
            classroomTitle
            course {
              id
            }
            classes {
            grade
            section
          }
        }
      }
    `)
    if (get(checkClassroomTitle, 'data.batches', []).length) {
      setClassroomData(get(checkClassroomTitle, 'data.batches'))
    }
  }

  const getHeaderTitle = () => {
    if (activeTab === 'Step 1') return 'Create a new Classroom'
    else if (activeTab === 'Step 2') return 'Confirm your course'
    else if (activeTab === 'Step 3') return 'Confirm Students'
    else if (activeTab === 'Congrats') return 'Congratulations'
    else if (activeTab === 'Pending') return 'Pending Approval'
    return 'Create a new Classroom'
  }

  const getHeaderDesc = () => {
    if (tabStates.includes(activeTab)) {
      return (
        <div className='modal__header-desc-class'>
          {`${activeTab} of 3`}
        </div>
      )
    }
    else if (activeTab === 'Congrats') {
      return (
        <div className='modal__header-desc'>
          Schedule your class below
        </div>
      )
    } else if (activeTab === 'Pending') {
      return (
        <div className='modal__header-desc'>
          Classroom submitted for approval
        </div>
      )
    }
    return (
      <div className='modal__header-desc-class'>
        {`${activeTab} of 3`}
      </div>
    )
  }

  const handleCancelPrevClick = (handleChange, setFieldValue) => {
    if (prevTab === 'Cancel') props.closeModal()
    if (prevTab === 'Step 1') {
      setPrevTab('Cancel')
      setActiveTab('Step 1')
    }
    if (prevTab === 'Step 2') {
      setPrevTab('Step 1')
      setActiveTab('Step 2')
      handleChange('searchStudent')('')
      setFieldValue('filteredStudents', [])
      setFieldValue('studentsChecked', [])
      setStudentProfiles([])
    }
  }

  const countDigits = (n) => {
    return (4 - Math.floor(Math.log10(n) + 1))
  }

  const getSchoolBatchCode = (input, schoolBatchCode, schoolBatchPrefix, schoolCode) => {
    let codeNumber = Number(input)
    codeNumber += 1
    const numZeroesInString = countDigits(codeNumber)
    if (numZeroesInString > 0) {
      let codeNumberString = '0'
      for (let i = 0; i < numZeroesInString - 1; i++) {
        codeNumberString += '0'
      }
      codeNumberString += `${codeNumber}`
      schoolBatchCode += `${schoolBatchPrefix}-${schoolCode}-${codeNumberString}`
    } else {
      schoolBatchCode += `${schoolBatchPrefix}-${schoolCode}-${codeNumber}`
    }
    return schoolBatchCode
  }

  const handleSaveNextClick = async (values, setFieldValue) => {
    if (activeTab === 'Step 1') {
      setNext(true)
      await fetchClassroomCourses()
      setPrevTab('Step 1')
      setActiveTab('Step 2')
      setNext(false)
      setButtonClicked(false)
    }

    if (activeTab === 'Step 2') {
      setNext(true)
      const studentInput = {
        schoolId: props.schoolId,
        grade: values.selectedGrade.value,
        section: values.selectedSection.value
      }
      const students = await fetchClassroomStudentProfiles(studentInput)
      let studentsList = []
      if (students && get(students, 'data.studentProfiles', []).length) {
        studentsList = get(students, 'data.studentProfiles').map(student => ({ ...student, isChecked: true, filtered: false }))
      }
      setStudentProfiles([...studentsList])
      setFieldValue('toggleAllStudents', true)
      setPrevTab('Step 2')
      setActiveTab('Step 3')
      setNext(false)
      setButtonClicked(false)
    }

    if (activeTab === 'Step 3') {
      setSubmitting(true)
      let schoolCode = extractSubdomain().toUpperCase()
      const capitalizedSubDomains = teacherAppSubDomains.map(domain => domain.toUpperCase())
      if (capitalizedSubDomains.includes(schoolCode)) {
        schoolCode = get(props.loggedInUser, 'mentorProfile.schools[0].code', '').toUpperCase();
      }
      let schoolBatchPrefix = 'CR'
      let schoolBatchCode = ''
      let codeNumber = 1
      if (props.schoolBatchCodes && props.schoolBatchCodes.length) {
        let schoolCodeArr = get(props, 'schoolBatchCodes[0].code').split('-')
        let lastElem = schoolCodeArr.length - 1
        if (!isNaN(Number(schoolCodeArr[lastElem]))) {
          schoolBatchCode = getSchoolBatchCode(schoolCodeArr[lastElem], schoolBatchCode, schoolBatchPrefix, schoolCode)
        } else if (props.schoolBatchCodes.length > 1) {
          schoolCodeArr = get(props, 'schoolBatchCodes[1].code').split('-')
          let lastElem = schoolCodeArr.length - 1
          if (!isNaN(Number(schoolCodeArr[lastElem]))) {
            schoolBatchCode = getSchoolBatchCode(schoolCodeArr[lastElem], schoolBatchCode, schoolBatchPrefix, schoolCode)
          } else {
            schoolBatchCode += `${schoolBatchPrefix}-${schoolCode}-000${codeNumber}`
          }
        }
      } else {
        schoolBatchCode += `${schoolBatchPrefix}-${schoolCode}-000${codeNumber}`
      }
      let checkedStudents = []
      studentProfiles.forEach((student) => {
        if (student.isChecked) checkedStudents.push(student.id)
      })
      const input = {
        classroomTitle: values.classroomName,
        code: schoolBatchCode,
        documentType: 'classroom',
        type: 'b2b',
        thumbnailSmall: thumbnailsArray[values.thumbnailIndex]
      }
      let connectIds = {
        courseConnectId: values.selectedCourse.courseId,
        coursePackageConnectId: values.selectedCourse.id,
        allottedMentorConnectId: props.loggedInUser.id,
        studentsConnectIds: checkedStudents,
        classesConnectIds: [values.selectedSection.id],
        schoolConnectId: props.schoolId
      }
      if (props.loggedInUser.role === 'schoolAdmin') {
        connectIds = { ...connectIds, allottedMentorConnectId: selectedTeacher }
      }
      const checkAddClassroomStatus = await requestToGraphql(
        gql`
          query {
            batches(
              filter:{
                and:[
                  { allottedMentor_some: { id: "${get(connectIds, 'allottedMentorConnectId')}" } }
                  { coursePackage_some: { id: "${get(connectIds, 'coursePackageConnectId')}" } }
                  { classes_some: { grade_in: ${get(values, 'selectedGrade.value')} } }
                  { classes_some: { section_in: ${get(values, 'selectedSection.value')} } }
                  { documentType: classroom }
                ]  
              }
            ) 
          {
            id
          }
        } 
      `)
      if (get(checkAddClassroomStatus, 'data.batches', []).length) {
        getToasterBasedOnType({
          className: 'teacher-app-theme',
          type: "error",
          message: "Classroom already exists"
        });
        setSubmitting(false)
        setCourseClassCombinationCheck(true)
      } else {
        await addClassroomBatch(input, connectIds).then(res => {
          setSubmitting(false)
          setActiveTab('Congrats')
        }).catch(err => {
          getToasterBasedOnType({
            className: 'teacher-app-theme',
            type: "error",
            message: "Something went wrong"
          });
        })
      }
      setButtonClicked(false)
    }
  }

  const extractGrades = () => {
    if (props.schoolClasses.length) {
      let uniqueGrades = Array.from(new Set(props.schoolClasses.map((elem) => (elem.grade))))
      return sortBy(uniqueGrades.map((elem) => ({ label: `Grade ${elem.slice(5)}`, value: elem })), 'value')
    }
    return []
  }
  const extractSections = (grade) => {
    if (grade) {
      let uniqueSections = props.schoolClasses.filter((item) => item.grade === grade)
      return sortBy(uniqueSections.map((elem) => (
        {
          label: `Section ${elem.section}`,
          value: elem.section,
          id: elem.id
        })
      ))
    }
    return []
  }

  const extractStudentData = (searchFilter) => {
    let countCheck = 0
    let isFilterChecked = 0
    if (searchFilter) {
      const lowerCaseQuery = searchFilter.toLowerCase()
      let newList = studentProfiles.map((student) => {
        if (get(student, 'user.name').toLowerCase().includes(lowerCaseQuery)) {
          countCheck += 1
          if (student.isChecked) isFilterChecked += 1
          return ({ ...student, filtered: true })
        }
        return ({ ...student, filtered: false })
      })
      setStudentProfiles(newList)
      setFilterCount(countCheck)
    } else {
      let newList = studentProfiles.map(student => {
        if (student.isChecked) countCheck += 1
        return ({ ...student, filtered: false })
      })
      setStudentProfiles(newList)
      setFilterCount(countCheck)
    }
    return [countCheck, isFilterChecked]
  }

  const extractCourses = (grade) => {
    const gradeNumber = grade.slice(5)
    if (props.classroomCourses && props.classroomCourses.length) {
      let courses = []
      let coursesAlreadySelectedForGrade = []
      classroomData.forEach((classroom) => {
        if (get(classroom, 'classes[0].grade') === grade && get(classroom, 'course.id')) coursesAlreadySelectedForGrade.push(get(classroom, 'course.id'))
      })
      props.classroomCourses.forEach((course) => {
        if (get(course, 'minGrade') <= gradeNumber && get(course, 'maxGrade') >= gradeNumber && !coursesAlreadySelectedForGrade.includes(get(course, 'id'))) {
          let theoryArr = []
          let programmingArr = []
          let toolsArr = []
          get(course, 'coursesData', []).forEach(courseData => {
            if (get(courseData, 'theory', []).length) {
              theoryArr.push(...get(courseData, 'theory', []))
            }
            if (get(courseData, 'programming', []).length) {
              programmingArr.push(...get(courseData, 'programming', []))
            }
            if (get(courseData, 'tools', []).length) {
              toolsArr.push(...get(courseData, 'tools', []))
            }
          });
          courses.push({
            value: get(course, 'title'),
            label: get(course, 'title'),
            id: get(course, 'id'),
            theory: theoryArr || [],
            programming: programmingArr || [],
            tools: toolsArr || [],
            courseId: get(course, 'coursesData.0.id', null)
          })
        }
      })
      return courses
    }
    return []
  }

  const renderModalHeader = () => (
    <>
      <div className='header-icon'>
        <CalenderSvg />
      </div>
      <div className='header-details'>
        <div className='modal__header-title'>
          {getHeaderTitle()}
        </div>
        {getHeaderDesc()}
      </div>
    </>
  )

  const renderThumbnailRow = (values, setFieldValue) => {

    return (
      <div className='modal__dropdown-full' style={{ marginTop: '20px' }}>
        <label className='modal__dropdown-custom-label-1'>Select classroom thumbnail <span style={{ color: 'red' }}>*</span></label>
        <div className='modal__thumbnail-row'>
          {
            thumbnailsArray.map((picture, index) => {
              return (
                <div
                  className={values.thumbnailIndex === index ? 'thumbnail-container-active' : 'thumbnail-container'}
                  key={index}
                  onClick={(e) => {
                    if (index !== values.thumbnailIndex) setFieldValue('thumbnailIndex', index)
                  }}
                // style={{
                //   border: values.thumbnailIndex === index ? `1px solid ${TekieAmethyst}` : '1px solid #DCDCDC'
                // }}
                >
                  <div
                    className='thumbnail'
                    style={{
                      background: `url(${getPath(picture)})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                    }}
                  ></div>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  const renderModalMain = (values, handleChange, setFieldValue, touched, errors) => {
    return (
      <>
        {
          activeTab === 'Step 1' && (
            <>
              <div className='modal__row-double'>
                <div className='modal__dropdown'>
                  <label>Grade {get(errors, 'selectedGrade.label') && get(touched, 'selectedGrade.label') ? (<span style={{ color: 'red' }}>*</span>) : (<span style={{ color: 'red' }}>*</span>)}</label>
                  <Dropdown
                    components={{ IndicatorSeparator: () => null }}
                    name='selectedGrade'
                    placeholder='Grade'
                    value={values.selectedGrade.value ? values.selectedGrade : null}
                    isMulti={false}
                    className='classModal-select'
                    classNamePrefix='classModal-select'
                    styles={newStyles}
                    options={extractGrades()}
                    onChange={async (option, _action) => {
                      const sections = await extractSections(option.value)
                      setFieldValue('selectedGrade', option)
                      setFieldValue('selectedSection', modalInitialValues.selectedSection)
                      setFieldValue('selectedCourse', modalInitialValues.selectedCourse)
                      setFieldValue('sections', sections)
                      handleChange('classroomName')('')
                    }}
                  ></Dropdown>
                </div>
                <div className='modal__dropdown'>
                  <label>Section {get(errors, 'selectedSection.label') && get(touched, 'selectedSection.label') && !get(values, 'selectedSection.label') ? (<span style={{ color: 'red' }}>*</span>) : (<span style={{ color: 'red' }}>*</span>)}</label>
                  <Dropdown
                    components={{ IndicatorSeparator: () => null }}
                    name='selectedSection'
                    placeholder='Select Section'
                    value={values.selectedSection.value ? values.selectedSection : null}
                    isMulti={false}
                    className='classModal-select'
                    classNamePrefix='classModal-select'
                    styles={newStyles}
                    disabled={!values.selectedGrade.value}
                    options={values.sections}
                    onChange={(option, _action) => {
                      setFieldValue('selectedSection', option)
                      handleChange('classroomName')(`${values.selectedGrade.label}${option.value}`)
                    }}
                  ></Dropdown>
                </div>
              </div>
              <div className='modal__row-single'>
                <div className='modal__dropdown-full-input'>
                  <label>Classroom Name {get(errors, 'classroomName') && get(touched, 'classroomName') ? (<span style={{ color: 'red' }}>*</span>) : (<span style={{ color: 'red' }}>*</span>)}</label>
                  <input
                    className='modal__full-input'
                    name='classroomName'
                    value={values.classroomName}
                    onChange={handleChange}
                    placeholder='Classroom Name'
                  ></input>
                </div>
                {((get(errors, 'classroomName') && get(touched, 'classroomName')) || classroomNameError) ? (<span className='modal__error-span'>{classroomNameError ? classroomNameError : errors.className}</span>) : null}
              </div>
              {/* <div className='modal__bottom-spacer'></div> */}
              {props.loggedInUser.role === 'schoolAdmin' && <div className='modal__dropdown'>
                <label>Teacher {get(errors, 'selectedGrade.label') && get(touched, 'selectedGrade.label') ? (<span style={{ color: 'red' }}>*</span>) : (<span style={{ color: 'red' }}>*</span>)}</label>
                <Dropdown
                  components={{ IndicatorSeparator: () => null }}
                  name='selectedTeacher'
                  placeholder='Select Teacher'
                  value={values.selectedTeacher.value ? values.selectedTeacher : null}
                  isMulti={false}
                  className='classModal-select'
                  classNamePrefix='classModal-select'
                  styles={newStyles}
                  options={modifiedTeachersList}
                  onChange={(option) => {
                    setFieldValue('selectedTeacher', option)
                    setSelectedTeacher(option.id)
                  }}
                ></Dropdown>
              </div>}
            </>
          )
        }
        {
          activeTab === 'Step 2' && (
            <>
              <div className='modal__row-single'>
                <div className='modal__dropdown-full'>
                  <label>Course {get(errors, 'selectedCourse.label') ? (<span style={{ color: 'red' }}>*</span>) : null}</label>
                  <Dropdown
                    components={{ IndicatorSeparator: () => null }}
                    name='selectedCourse'
                    placeholder='Courses'
                    styles={newStyles}
                    value={values.selectedCourse.value ? values.selectedCourse : null}
                    isMulti={false}
                    className='classModal-select'
                    classNamePrefix='classModal-select'
                    // disabled={!values.selectedGrade.value}
                    options={extractCourses(values.selectedGrade.value, setFieldValue) || []}
                    onChange={(option, _action) => {
                      setFieldValue('selectedCourse', option)
                    }}
                  ></Dropdown>
                </div>
              </div>
              <div className='course-main-container'>
                {
                  <>
                    {
                      values.selectedCourse
                        && (get(values, 'selectedCourse.tools.length', 0) > 0
                          || get(values, 'selectedCourse.theory.length', 0) > 0
                          || get(values, 'selectedCourse.programming.length', 0) > 0) ? (
                        <>
                          <label>
                            What you would be teaching
                          </label>
                          <div className='course-inner-container'>
                            <label>
                              Tools
                            </label>
                            <div className='course-tags-row'>
                              {/* <div className='course-tags'> */}
                              {
                                values.selectedCourse.tools && values.selectedCourse.tools.length > 0
                                && values.selectedCourse.tools.map((item) => (
                                  <div className='course-tags' key={item.value}>
                                    {`${item.value[0].toUpperCase()}${item.value.slice(1)}`}
                                  </div>
                                ))
                              }
                              {/* </div> */}
                            </div>
                          </div>
                          <div className='course-inner-container'>
                            <label>
                              Theory
                            </label>
                            {/* <div className='course-tags-row'> */}
                            <div className='course-tags-row'>
                              {/* <div className='course-tags'> */}
                              {
                                values.selectedCourse.theory && values.selectedCourse.theory.length > 0
                                && values.selectedCourse.theory.map((item) => (
                                  <div className='course-tags' key={item.value}>
                                    {`${item.value[0].toUpperCase()}${item.value.slice(1)}`}
                                  </div>
                                ))
                              }
                              {/* </div> */}
                            </div>
                            {/* <div className='course-tags'>
                                History of Computers
                              </div> */}
                            {/* </div> */}
                          </div>
                          <div className='course-inner-container'>
                            <label>
                              Programming
                            </label>
                            <div className='course-tags-row'>
                              {
                                values.selectedCourse.programming && values.selectedCourse.programming.length > 0
                                && values.selectedCourse.programming.map((item) => (
                                  <div className='course-tags' key={item.value}>
                                    {`${item.value[0].toUpperCase()}${item.value.slice(1)}`}
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                        </>
                      )
                    }
                  </>
                }
              </div>
            </>
          )
        }
        {
          activeTab === 'Step 3' && (
            <>
              <div className='grade-desc'>
                <div className='grade-details'>
                  <BatchSvg />
                  {/* <div> */}
                  <span>Class</span>
                  <span>{`${values.selectedGrade.value.slice(5)}-${values.selectedSection.value}`}</span>
                  {/* </div> */}
                </div>
                {/* <div className='grade-add-student'>
                  Add Student?
                </div> */}
              </div>
              <div className='search-student-row'>
                <div className='search-container'>
                  <input
                    className='search-input'
                    name='searchStudent'
                    placeholder='Search Student'
                    onChange={(e) => {
                      if (e.target.value && e.target.value.length > 0) {
                        const [countCheck, filterChecked] = extractStudentData(e.target.value)
                        if (filterChecked === countCheck) {
                          setFieldValue('toggleAllStudents', true)
                        } else {
                          setFieldValue('toggleAllStudents', false)
                        }
                      } else {
                        const [countCheck, _filterChecked] = extractStudentData('')
                        if (countCheck < studentProfiles.length) {
                          setFieldValue('toggleAllStudents', false)
                        } else {
                          setFieldValue('toggleAllStudents', true)
                        }
                      }
                      handleChange('searchStudent')(e.target.value)
                    }}
                  />
                  <SearchSvg />
                </div>
                {/* <button
                  className='invite-button'
                  onClick={() => {
                    if (navigator && navigator.clipboard) {
                      const schoolCode = extractSubdomain()
                      let url = ''
                      if (schoolCode) {
                        url = `${schoolCode}.tekie.in/loginbatchId=${batchId}`
                      } else {
                        url =
                      }
                      let url = extractSubdomain() ?
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        getToasterBasedOnType({
                          className: 'teacher-app-theme',
                          type: "success",
                          message: "Copied To Clipboard"
                        });
                      })
                  }
                  }}
                >
                  <LinkSvg />
                  <span>Invite By Link</span>
                </button> */}
              </div>
              <div className='modal__students-table'>
                <div className='modal__student-table-header'>
                  <label class="modal__styled-checkbox">
                    <Field
                      type="checkbox"
                      name='toggleAllStudents'
                      onChange={() => {
                        if (values.toggleAllStudents && !values.searchStudent) {
                          const newStudentList = studentProfiles.map((student) => ({ ...student, isChecked: false }))
                          setStudentProfiles(newStudentList)
                        }
                        if (values.toggleAllStudents && values.searchStudent) {
                          const newStudentList = studentProfiles.map(elem => {
                            if (elem.id === get(elem, 'id') && elem.filtered) {
                              return { ...elem, isChecked: false }
                            } return elem
                          })
                          setStudentProfiles(newStudentList)
                        }
                        if (!values.toggleAllStudents && values.searchStudent) {
                          const newStudentList = studentProfiles.map(elem => {
                            if (elem.id === get(elem, 'id') && elem.filtered) {
                              return { ...elem, isChecked: true }
                            } return elem
                          })
                          setStudentProfiles(newStudentList)
                        }
                        if (!values.toggleAllStudents && !values.searchStudent) {
                          const newStudentList = studentProfiles.map((student) => ({ ...student, isChecked: true }))
                          setStudentProfiles(newStudentList)
                        }
                        setFieldValue('toggleAllStudents', !values.toggleAllStudents)
                      }}
                    />
                    <div class="box"></div>
                  </label>
                  <label>Roll No.</label>
                  <label>Students Name</label>
                </div>
                {
                  values.searchStudent && values.searchStudent.length > 0 ? (
                    <>
                      {
                        studentProfiles && studentProfiles.length > 0
                        && studentProfiles.map((student, index) => {
                          if (student.filtered) {
                            return (
                              <>
                                <div className='modal__student-table-row' key={get(student, 'id')}>
                                  <label class="modal__styled-checkbox">
                                    <Field
                                      type="checkbox"
                                      name='studentsChecked'
                                      value={get(student, 'user.id')}
                                      checked={
                                        studentProfiles.find((elem) => elem.id === get(student, 'id') && elem.isChecked) ? true :
                                          false
                                      }
                                      onChange={() => {
                                        const findCheckedStudent = studentProfiles.find((elem) => elem.id === get(student, 'id') && elem.isChecked)
                                        if (findCheckedStudent) {
                                          if (values.toggleAllStudents) {
                                            setFieldValue('toggleAllStudents', false)
                                          }
                                          const newStudentList = studentProfiles.map(elem => {
                                            if (elem.id === get(student, 'id')) {
                                              return { ...elem, isChecked: false }
                                            } return elem
                                          })
                                          setStudentProfiles(newStudentList)
                                        }
                                        if (!findCheckedStudent) {
                                          let countCheck = 0
                                          const newStudentList = studentProfiles.map(elem => {
                                            if (elem.filtered) countCheck += 1
                                            if (elem.id === get(student, 'id')) {
                                              return { ...elem, isChecked: true }
                                            } return elem
                                          })
                                          setStudentProfiles(newStudentList)
                                          if (countCheck === filterCount) {
                                            setFieldValue('toggleAllStudents', true)
                                          }
                                        }
                                      }}
                                    />
                                    <div class="box"></div>
                                  </label>
                                  <label>{index + 1}</label>
                                  <label>{get(student, 'user.name')}</label>
                                </div>
                                {studentProfiles.length - 1 === index ? (<></>) : (<div className='modal__div-line'></div>)}
                              </>
                            )
                          }
                          return <></>
                        })
                      }
                    </>
                  ) : (
                    <>
                      {
                        studentProfiles && studentProfiles.length > 0
                        && studentProfiles.map((student, index) => {
                          return (
                            <>
                              <div className='modal__student-table-row' key={get(student, 'id')}>
                                <label class="modal__styled-checkbox">
                                  <Field
                                    type="checkbox"
                                    name='studentsChecked'
                                    value={get(student, 'id')}
                                    checked={
                                      studentProfiles.find((elem) => elem.id === get(student, 'id') && elem.isChecked) ? true :
                                        false
                                    }
                                    onChange={() => {
                                      const findCheckedStudent = studentProfiles.find((elem) => elem.id === get(student, 'id') && elem.isChecked)
                                      if (findCheckedStudent) {
                                        if (values.toggleAllStudents) {
                                          setFieldValue('toggleAllStudents', false)
                                        }
                                        const newStudentList = studentProfiles.map(elem => {
                                          if (elem.id === get(student, 'id')) {
                                            return { ...elem, isChecked: false }
                                          } return elem
                                        })
                                        setStudentProfiles(newStudentList)
                                      }
                                      if (!findCheckedStudent) {
                                        let countCheck = 1
                                        const newStudentList = studentProfiles.map(elem => {
                                          if (elem.isChecked) { countCheck += 1 }
                                          if (elem.id === get(student, 'id')) {
                                            return { ...elem, isChecked: true }
                                          } return elem
                                        })
                                        setStudentProfiles(newStudentList)
                                        if (countCheck === studentProfiles.length) {
                                          setFieldValue('toggleAllStudents', true)
                                        }

                                      }
                                    }}
                                  />
                                  <div class="box"></div>
                                </label>
                                <label>{index + 1}</label>
                                <label>{get(student, 'user.name')}</label>
                              </div>
                              {studentProfiles.length - 1 === index ? (<></>) : (<div className='modal__div-line'></div>)}
                            </>
                          )
                        })
                      }
                    </>
                  )
                }
              </div>
              {/* <button className='invite-button'>
                <LinkSvg />
                Invite By Link
              </button>
            </div>
            <div className='modal__students-table'>
              <div className='modal__student-table-header'>
                <label class="modal__styled-checkbox">
                  <Field type="checkbox" name='toggleAllStudents' />
                  <div class="box"></div>
                </label>
                <label>Roll No.</label>
                <label>Students Name</label>
              </div> */}
              {/* </div> */}
            </>
          )
        }
        {
          activeTab === 'Congrats' && (
            <>
              <div className='congrats-container'>
                <div className='classroom-created-container'>
                  <div
                    className='classroom-created-thumbnail'
                    style={{
                      background: `url(${congrats})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                    }}
                  ></div>
                </div>
                <div className='congrats-text'>
                  <p>You have successfully created classroom</p>
                  <p><span>{values.classroomName}</span> with course <span>{`(${values.selectedCourse.label})`}.</span></p>
                </div>
              </div>
            </>
          )
        }
        {
          activeTab === 'Pending' && (
            <>
              <div className='congrats-container'>
                <div className='classroom-created-container'>
                  <div
                    className='classroom-created-thumbnail'
                    style={{
                      background: `url(${approval})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                    }}
                  ></div>
                </div>
                <div className='congrats-text'>
                  <p>Your classroom</p>
                  <p><span>Grade 10-A</span> with course <span>(Computer Science)</span></p>
                  <p>is pending approval.</p>
                  <p>Kindly reach out to your Admin or your Key</p>
                  <p>Your classroom</p>
                  <p>Account Manager (KAM) for more details.</p>
                </div>
              </div>
            </>
          )
        }
      </>
    )
  }

  const renderFooter = (values, handleChange, setFieldValue) => {
    return (
      <>
        {
          tabStates.includes(activeTab) && (
            <>
              <button
                className='modal__cancel-btn'
                disabled={buttonClicked}
                onClick={() => handleCancelPrevClick(handleChange, setFieldValue)}
              >
                {
                  prevTab === 'Cancel' ? 'Cancel' : 'Go Back'
                }
              </button>
              <div className='modal__button-container'>
                {/* <button
                  className='modal__contact-btn'
                  disabled={buttonClicked}
                  onClick={() => props.showContactInfo()}
                >
                  Contact Us
                </button> */}
                <button
                  className={
                    isSubmitting ? 'modal__save-btn-loading' :
                      isNext ? 'modal__next-btn-loading' :
                        activeTab !== 'Step 2' ? 'modal__save-btn' :
                          (activeTab === 'Step 2' && values.selectedCourse.label) ? 'modal__save-btn' :
                            'modal__save-btn modal__disabled-btn'
                  }
                  htmlType='submit'
                  disabled={buttonClicked}
                  onClick={async () => {
                    setButtonClicked(true)
                    let errors = await formRef.current.validateForm();
                    if (Object.keys(errors).length === 0 && errors.constructor === Object) {
                      if (activeTab === 'Step 1') {
                        const classroomWithGradeSection = classroomData.find((classroom) => {
                          const selectedGrade = get(values, 'selectedGrade.value')
                          const selectedSection = get(values, 'selectedSection.value')
                          const findClassroomWithGradeSection = get(classroom, 'classes', []).find(classData => get(classData, 'grade') === selectedGrade && get(classData, 'section') === selectedSection)
                          return Boolean(findClassroomWithGradeSection)
                        })
                        const classroomWithSameTitle = classroomData.find((classroom) => classroom.classroomTitle === values.classroomName)
                        if (classroomWithGradeSection || classroomWithSameTitle) {
                          if (classroomWithGradeSection) setClassroomNameError('Classroom with the same Grade/Section already exists.')
                          else if (classroomWithSameTitle) setClassroomNameError('Classroom with this name already exists.')
                          setButtonClicked(false)
                        } else {
                          setClassroomNameError('')
                          handleSaveNextClick(values, setFieldValue)
                        }
                      } else {
                        handleSaveNextClick(values, setFieldValue)
                      }
                    } else {
                      setButtonClicked(false)
                    }
                  }
                  }
                >
                  {
                    (isSubmitting || isNext) && (
                      <div className='classModal-btn-loader'>
                        <LoadingSpinner
                          width={'100%'}
                          height={'100%'}
                          color={'white'}
                          transform={"inherit"}
                        />
                      </div>
                    )
                  }
                  {isSubmitting ? 'Processing' : 'Confirm and Go Next'}
                </button>
              </div>
            </>
          )
        }
        {
          !tabStates.includes(activeTab) && (
            <>
              {/* <button
                className='modal__invite-btn'
                onClick={() => {
                  if (navigator && navigator.clipboard) {
                    const schoolCode = extractSubdomain()

                    let url = ''
                    if (schoolCode && get(props, 'addedBatchId')) {
                      url = `${schoolCode}.tekie.in/login?batchId=${props.addedBatchId}&schoolId=${props.schoolId}`
                    } else {
                      url = `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/login`
                    }
                    navigator.clipboard.writeText(url).then(() => {
                      getToasterBasedOnType({
                        className: 'teacher-app-theme',
                        type: "success",
                        message: "Copied To Clipboard"
                      });
                    })
                  }
                }}
              >
                <LinkSvg />
                <span>Invite By Link</span>
              </button> */}
              <button
                className='modal__done-btn'
                onClick={() => {
                  setActiveTab('Step 3')
                  setSubmitting(false)
                  props.closeModal()
                }}>
                Done
              </button>
            </>
          )
        }
      </>
    )
  }

  return (
    // <CustomTeacherAppModal
    //   visible={props.visible}
    //   closeModal={() => props.closeModal()}
    //   renderModalHeader={renderModalHeader}
    // >
    <PopUp
      showPopup={props.visible}
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
                selectedGrade: { value: '', label: '' },
                selectedSection: { value: '', label: '', id: '' },
                selectedTeacher: { value: '', label: '', id: '' },
                thumbnailIndex: 0,
                sections: [],
                selectedCourse: { value: '', label: '', id: '', tools: [], programming: [], theory: [] },
                classroomName: '',
                searchStudent: '',
                filteredStudents: [],
                filteredIds: [],
                studentsChecked: [],
                toggleAllStudents: true,
              }}
              validationSchema={
                activeTab === 'Step 1' ? validationSchemaStepOne :
                  activeTab === 'Step 2' ? validationSchemaStepTwo :
                    null
              }
              innerRef={formRef}
              validateOnBlur
            >
              {({ values, handleChange, setFieldValue, setFieldError, touched, errors }) => (
                <Form>
                  <div className={activeTab === 'Step 1' ? 'modal__fixed-content-1' :
                    activeTab === 'Step 2' ? 'modal__fixed-content' :
                      activeTab === 'Step 3' ? 'modal__fixed-content' : 'modal__fixed-congrats-content'}>
                    {
                      props.visible &&
                      // <div className={activeTab !== 'Step 3' ? 'modal__top-content' : 'modal__top-content-students'}>
                      <div className='top-content'>
                        {activeTab === 'Step 1' && renderThumbnailRow(values, setFieldValue)}
                        {renderModalMain(values, handleChange, setFieldValue, touched, errors)}
                      </div>
                    }
                  </div>
                  <div className='modal__footer'>
                    {renderFooter(values, handleChange, setFieldValue)}
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </PopUp>
    // {/* </CustomTeacherAppModal> */}
  )
}

export default ClassroomModal
