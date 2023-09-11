import React from 'react'
import DataTable from '../components/DataTableV1/DataTable'
import Select from '../components/Select'
import { Link } from 'react-router-dom'
import { get } from 'lodash'
import Pagination from '../components/Pagination'
import { avatarsRelativePath } from '../../../utils/constants/studentProfileAvatars'
import fetchSchoolClasses from '../../../queries/schoolDashboard/fetchSchoolClasses'
import fetchStudentProfiles from '../../../queries/schoolDashboard/fetchStudentProfiles'
import ViewIcon from '../../../assets/SchoolDashboard/icons/View'
import ReportIcon from '../../../assets/SchoolDashboard/icons/Report'
import getPath from '../../../utils/getPath'
import { getSchoolId, courses } from '../utils'

import './Students.scss'
import '../SchoolDashboard.common.scss'
import renderChats from '../../../utils/getChatTags'
import ChatWidget from '../../../components/ChatWidget'

class Students extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isFetching: false,
            gradeFilter: 'all',
            courseFilter: 'all',
            tableColumns: [],
            tableData: [],
            gradeIds: [],
            currentPage: 1,
            perPage: 10,
        }
    }

    componentDidMount() {
        const schoolId = getSchoolId(this.props.loggedInUser)
        fetchSchoolClasses(`{school_some:{id: "${schoolId}"}}`, 0, 0).call()
        this.fetchSchoolStudents()
    }

    componentDidUpdate = async () => {
        const { isLoggedIn, loggedInUserArray } = this.props
        if (window && window.fcWidget) {
            window.fcWidget.on("widget:opened", () => {
                renderChats({
                    isLoggedIn,
                    studentCurrentStatus: 'paidUser',
                    loggedInUser: loggedInUserArray
                })
            })
        }
    }
    fetchSchoolStudents = async () => {
        const schoolId = getSchoolId(this.props.loggedInUser)
        const { value: gradeValue } = this.state.gradeFilter
        const { value: courseValue } = this.state.courseFilter
        const { perPage, currentPage } = this.state
        let filters = `{school_some:{id: "${schoolId}"}}`
        this.setState({
            isFetching: true
        })
        if (gradeValue && gradeValue !== 'all') {
            filters += `,{ grade:${gradeValue.split('-')[0]}}`
            filters += `,{section:${gradeValue.split('-')[1]}}`
        }
        if (courseValue && courseValue !== 'all') {
            filters += `,{batch_some:{course_some:{title_contains:"${courseValue}"}}}`
        }
        await fetchStudentProfiles(filters, perPage, Math.max(currentPage - 1, 0)).call()
        this.setState({
            isFetching: false,
        }, () => {
            this.setAllStudentsTableData()
        })
    }

    setAllStudentsTableData = () => {
        const studentProfiles = this.props.schoolStudentProfiles && this.props.schoolStudentProfiles.toJS()
        /** 
         * Please Note: Mapping Nested Fields to Top level for DataTable being able to map key with DataFields.
         * 
         * Alternative: Use @render func to map data with Custom JSX.
         */
        const tableData = studentProfiles.map(profile => ({
            id: profile.id,
            studentId: get(profile, 'userData.id', 'null'),
            studentName: get(profile, 'userData.name', '-'),
            studentProfileImage: get(profile, 'userData.profilePic.uri', null),
            profileAvatarCode: get(profile, 'profileAvatarCode', null),
            grade: get(profile, 'schoolClass.grade', '-'),
            section: get(profile, 'schoolClass.section', '-'),
            batchCode: get(profile ,'batch.code', '-'),
            originalRecord: profile
        }))
        const studentProfileTableColumns = [
            {
                title: 'Student',
                key: 'studentName',
                render: (studentName, record) => (
                    <div
                        onClick={() => {
                            this.props.history.push(`/dashboard/${this.props.match.params.schoolSlug}/students/${get(record, 'studentId')}`)  
                        }}
                        data-tooltip data-tooltip-position="top"
                        className='school-dashboard-students-profileContainer school-dashboard-comms-clickableText'
                    >
                        {get(record, 'studentProfileImage') ? (
                            <span className='school-dashboard-students-profilePic' style={{ backgroundImage: `url(${getPath(get(record, 'studentProfileImage'))})` }}/>
                        ) : (
                            <span className='school-dashboard-students-profilePic' style={{ backgroundImage: `url(${avatarsRelativePath[get(record, 'profileAvatarCode')]})`}} />    
                        )}
                        {studentName}
                    </div>
                )
            },
            {
                title: 'Grade',
                key: 'grade',
                width: '150px',
            },
            {
                title: 'Section',
                key: 'section',
                width: '150px',
            },
            {
                title: 'Batch',
                key: 'batchCode',
                width: '150px',
            },
            {
                title: 'Action',
                key: 'studentId',
                width: '150px',
                render: (studentId, record) => (
                    <div className='school-dashboard-students-action-container'>
                        <Link
                            to={`/dashboard/${this.props.match.params.schoolSlug}/students/${studentId}`}
                            data-tooltip data-tooltip-position="right"
                            className='school-dashboard-students-actionBtn'
                        >
                            <ViewIcon />
                        </Link>
                        {/* <button className='school-dashboard-students-actionBtn'><ReportIcon /></button> */}
                    </div>
                )
            },
        ];
        this.setState({
            tableColumns: studentProfileTableColumns,
            tableData,
        })
    }

    setSessionGradeFilters = (value) => {
        this.setState({
            gradeFilter: value,
            currentPage: 1,
        }, async () => {
            await this.fetchSchoolStudents()
        })
    }

    pageChange = ({ currentPage: page}) => {
        if (page === this.state.currentPage || page < 0) {
            return
        }
        this.setState({
            currentPage: page
        }, () => {
            this.fetchSchoolStudents()
        })
    }

    render() {
        const { tableColumns, tableData, currentPage, perPage } = this.state
        const schoolClasses = this.props.schoolClasses && this.props.schoolClasses.toJS()

        return (
            <>
                <div id='school-dashboard-students-container'>
                    {this.state.isFetching ? (
                    <>
                        <div className='loading-container show'>
                            <div className='loading-bar-container'>
                                <div />
                            </div>
                        </div>
                    </>
                    ) : (null)}
                    <div className='school-dashboard-header-container'>
                        <div className='school-dashboard-heading-text school-dashboard-marginLeft-mobileOnly' style={{ display: 'flex' }}>
                            All Students 
                        </div>
                        {/* <button className='school-dashboard-primary-btn'>All Grades Report</button> */}
                    </div>
                    <ChatWidget />
                    <div className='school-dashboard-filters-container'>
                        <div className='school-dashboard-heading-text'></div>
                        <div className='school-dashboard-filters'>
                            <Select
                                options={
                                        [{value: 'all', label: 'All'}].concat(courses.map(course => ({
                                        value: course,
                                        label: course
                                    })) || [])
                                }
                                placeholder='Courses'
                                value={this.state.courseFilter}
                                className={'school-dashboard-dropdown'}
                                onChange={(course) => {
                                    this.setState({
                                        courseFilter: course,
                                        currentPage: 1,
                                    }, async () => {
                                        await this.fetchSchoolStudents()
                                    })
                                }}
                                isSearchable={false}
                            />
                            <Select
                                options={
                                    [{ value: 'all', label: 'All' }].concat(schoolClasses
                                        ? schoolClasses.map(classObj => ({
                                            value: `${classObj.grade}-${classObj.section}`,
                                            label: `${classObj.grade}-${classObj.section}`
                                        })) 
                                        : []
                                    )
                                }
                                placeholder='Grades'
                                value={this.state.gradeFilter}
                                className={'school-dashboard-dropdown'}
                                onChange={(grade) => {
                                    this.setSessionGradeFilters(grade)
                                }}
                                isSearchable={false}
                            />
                        </div>
                    </div>
                    <div className='school-dashboard-students-tableContainer'>
                        <DataTable
                            columns={tableColumns}
                            tableData={tableData}
                            tableHeight='65vh'
                            isLoading={this.state.isFetching}
                        />
                    </div>
                    {!this.state.isFetching && (
                        <div className='school-dashboard-pagination-container'>
                            <Pagination
                                totalRecords={this.props.totalStudentProfiles && this.props.totalStudentProfiles.getIn([0, 'count'])}
                                currentPage={this.state.currentPage}
                                pageLimit={this.state.perPage}
                                pageNeighbours={10}
                                onPageChanged={this.pageChange}
                            />
                            {currentPage > 0 && (
                                <div className='school-dashboard-pagination-details'>
                                    Showing <span className='school-dashboard-pagination-highlight'>{Math.max((currentPage-1)*perPage, 1)}{'-'}{Math.min(((currentPage-1)*perPage) + perPage, this.props.totalStudentProfiles && this.props.totalStudentProfiles.getIn([0, 'count']))}</span> of {this.props.totalStudentProfiles && this.props.totalStudentProfiles.getIn([0, 'count'])} results
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </>
        )
    }
}

export default Students