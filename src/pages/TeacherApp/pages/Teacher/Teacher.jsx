import React from 'react'
import { get, sortBy } from 'lodash'
import gql from 'graphql-tag'
import requestToGraphql from '../../../../utils/requestToGraphql'

import Dropdown, { customStyles } from '../../components/Dropdowns/Dropdown'
import { CreateButton } from '../../utils'
import CreateMentorModal from '../../components/CreateMentorModal/CreateMentorModal'
import ToggleButton from '../../components/ToggleButton/ToggleButton'

import { SearchSvg } from '../../components/svg'
import './styles.scss'

const tableColumns = [
  'S.No', 'Student Name', 'Grades', 'Subjects', 'Phone No.','Email', 'Status'
]

const fakeData = [
  {
    name: 'Duryodhana Shakuni Are Friends',
    grades: '1-10',
    subjects: 'All Fair in Love and War',
    email: 'welcometokurukshetra@gmail.com',
    phone: '+91-9089089087',
    status: true
  },
  {
    name: 'Duryodhana Shakuni Are Friends',
    grades: '1-10',
    subjects: 'All Fair in Love and War',
    email: 'welcometokurukshetra@gmail.com',
    phone: '+91-9089089087',
    status: true
  },
  {
    name: 'Duryodhana Shakuni Are Friends',
    grades: '1-10',
    subjects: 'All Fair in Love and War',
    email: 'welcometokurukshetra@gmail.com',
    phone: '+91-9089089087',
    status: true
  },
  {
    name: 'Duryodhana Shakuni Are Friends',
    grades: '1-10',
    subjects: 'All Fair in Love and War',
    email: 'welcometokurukshetra@gmail.com',
    phone: '+91-9089089087',
    status: true
  },
  {
    name: 'Duryodhana Shakuni Are Friends',
    grades: '1-10',
    subjects: 'All Fair in Love and War',
    email: 'welcometokurukshetra@gmail.com',
    phone: '+91-9089089087',
    status: true
  },
  {
    name: 'Duryodhana Shakuni Are Friends',
    grades: '1-10',
    subjects: 'All Fair in Love and War',
    email: 'welcometokurukshetra@gmail.com',
    phone: '+91-9089089087',
    status: true
  },
  {
    name: 'Duryodhana Shakuni Are Friends',
    grades: '1-10',
    subjects: 'All Fair in Love and War',
    email: 'welcometokurukshetra@gmail.com',
    phone: '+91-9089089087',
    status: true
  },
  {
    name: 'Duryodhana Shakuni Are Friends',
    grades: '1-10',
    subjects: 'All Fair in Love and War',
    email: 'welcometokurukshetra@gmail.com',
    phone: '+91-9089089087',
    status: true
  }
]

const newStyles = {
  ...customStyles,
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    cursor: 'pointer',
    backgroundColor: isSelected ? '#8C61CB': null,
    '&:hover' : {
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
    border: "1px solid #EEEEEE",
    boxShadow: "0 0 0 0px black",
    borderRadius: "8px",
    "&:hover": {
      border: "1.4px solid #00ADE6",
      boxShadow: "0 0 0 0px black",
    },
  }),
  placeholder: (styles) => ({
    ...styles,
    fontWeight: "400",
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    color: "#AAA",
    "&:hover": {
      color: "#AAA",
    },

  }),
  input: (styles) => ({
    ...styles,
    color: "transparent",
  }),
};

class Teacher extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      classesForAddTeacher: [],
    }
  }

  async componentDidMount() {
    const { loggedInUser } = this.props
    // defaultId = ''
    const getSchoolClasses = await requestToGraphql(
      gql`
        query {
          school(id: "${loggedInUser && get(loggedInUser.toJS(), 'mentorProfile.schools[0].id')}" ) {
            id
            classes {
              id
              grade
              section
            }
          }
        }
      `)
    if (get(getSchoolClasses, 'data.school.classes', []).length) {
      const data = get(getSchoolClasses, 'data.school.classes')
      const classesData = sortBy(data.map((elem) => ({ label: `Grade ${elem.grade.slice(5)}-${elem.section}`, value: elem.id })), 'label')
      this.setState({ classesForAddTeacher: [...classesData] })
    }
  }

  renderHeader = () => {
    return (
      <>
        <span>{`Home > Teacher`}</span>
      </>
    )
  }

  renderTableHeader = () => {
    return (
      <div className='teacher-table-title'>
        <span>Teacher List</span>
      </div>
    )
  }

  renderTableSearchFilter = () => {
    return (
      <div className='teacher-table-query-container'>
        <div className='teacher-table-search-container'>
          <input 
            className='search-input'
            placeholder='Search Teacher'
          >
          </input>
          <SearchSvg />
        </div>
        <div className='teacher-table-filter-container'>
          <Dropdown
            components={{ IndicatorSeparator: () => null }}
            name='teachers-select'
            placeholder='Grade'
            // value={values.selectedGrades.length ? values.selectedGrades : null}
            className='teachers-select'
            classNamePrefix='teachers-select'
            styles={newStyles}
            isMulti={false}
            // options={props.classesData || []}
            // onChange={(_option, action) => {
            //   const { selectedGrades } = values
            //   let selectedOption = {}
            //   let newFilter = []
            //   if (action.action === 'select-option') {
            //     selectedOption = action.option
            //     newFilter = [...selectedGrades, selectedOption]
            //   } else if (action.action === 'remove-value') {
            //     newFilter = selectedGrades.filter((item) => item.value !== action.removedValue.value)
            //   }
            //   setFieldValue('selectedGrades', newFilter)
            // }}
          >
          </Dropdown>
          <Dropdown
            components={{ IndicatorSeparator: () => null }}
            name='teachers-select'
            placeholder='Grade'
            // value={values.selectedGrades.length ? values.selectedGrades : null}
            className='teachers-select'
            classNamePrefix='teachers-select'
            styles={newStyles}
            isMulti={false}
            // options={props.classesData || []}
            // onChange={(_option, action) => {
            //   const { selectedGrades } = values
            //   let selectedOption = {}
            //   let newFilter = []
            //   if (action.action === 'select-option') {
            //     selectedOption = action.option
            //     newFilter = [...selectedGrades, selectedOption]
            //   } else if (action.action === 'remove-value') {
            //     newFilter = selectedGrades.filter((item) => item.value !== action.removedValue.value)
            //   }
            //   setFieldValue('selectedGrades', newFilter)
            // }}
          >
          </Dropdown>
          <CreateButton
            text='Add a new teacher'
            className='add-teacher-button'
            actionHandler={this.openModal}
          />
        </div>
      </div>
    )
  }

  renderTeacherTable = () => {
    return (
      <>
        <table className='teacher-table-container'>
          <thead>
            <tr className='teacher-table-header-row'>
              {
                tableColumns.map((column) => {
                  return (
                    <th key={column}>{column}</th>
                  )
                })
              }
            </tr>
          </thead>
          <tbody>
          {
            fakeData.map((data, idx) => {
              return (
                <tr className='teacher-table-data-row' key={idx}>
                  <td>{idx+1}</td>
                  <td>{get(data, 'name')}</td>
                  <td>{get(data, 'grades')}</td>
                  <td>{get(data, 'subjects')}</td>
                  <td>{get(data, 'phone')}</td>
                  <td>{get(data, 'email')}</td>
                  <td>
                    <ToggleButton
                      elemData={data}
                      className='teacher-table-toggle-container'
                      checked={data.status}
                      // toggleClickHandler={handleToggleClick}
                    />
                  </td>
                </tr>
              )
            })
          }
          </tbody>
          {/* </div> */}
        </table>
      </>
    )
  }



  render () {
    const { loggedInUser } = this.props
    return (
      <div className='teacher-main-container'>
        {/* <CreateMentorModal
          schoolId={loggedInUser && get(loggedInUser.toJS(), 'mentorProfile.schools[0].id')}
          classesData={this.state.classesForAddTeacher && this.state.classesForAddTeacher.length ? this.state.classesForAddTeacher : []}
        /> */}
        <div className='teacher-header'>
          {this.renderHeader()}
        </div>
        <div className='teacher-table-main-container'>
          {this.renderTableHeader()}
          {this.renderTableSearchFilter()}
          {this.renderTeacherTable()}
        </div>
      </div>
    )
  }

}

export default Teacher