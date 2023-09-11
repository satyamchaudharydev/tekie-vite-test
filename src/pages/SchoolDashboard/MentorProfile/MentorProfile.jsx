import React from 'react'
import DataTable from '../components/DataTableV1/DataTable'
import Select from '../components/Select'
import { get } from 'lodash'
import { format } from 'date-fns'
import ArrowIcon from '../../../assets/arrowIcon'
import fetchMentorProfiles from '../../../queries/schoolDashboard/fetchMentorProfiles'
import fetchSchoolClasses from '../../../queries/schoolDashboard/fetchSchoolClasses'
import fetchSchoolBatches from '../../../queries/schoolDashboard/fetchBatches'
import Course from '../../../assets/SchoolDashboard/icons/Course'
import StudentsSvg from '../../../assets/SchoolDashboard/icons/Students'
import { getSlotTime, getSchoolId, courses, currentBatchSesssionStatus, calculateMentorRating } from '../utils'
import getPath from '../../../utils/getPath'
import CourseDetailsModal from '../components/CourseDetailsModal/CourseDetailsModal'
import BatchDetailsModal from '../components/BatchDetailsModal/BatchDetailsModal'

import './MentorProfile.scss'
import '../SchoolDashboard.common.scss'
import { Link } from 'react-router-dom'
import { ImageBackground } from '../../../image'
import renderChats from '../../../utils/getChatTags'
import ChatWidget from '../../../components/ChatWidget'

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

class MentorProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isFetching: false,
            gradeFilter: 'all',
            courseFilter: 'all',
            tableColumns: [],
            tableData: [],
            gradeIds: [],
            isCourseDetailsModalVisible: false,
            isBatchDetailsModalVisible: false,
        }
    }

    async componentDidMount() {
        const schoolId = getSchoolId(this.props.loggedInUser)
        fetchSchoolClasses(`{school_some:{id: "${schoolId}"}}`, 0, 0).call()
        this.fetchMentorProfile()
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
    fetchMentorProfile = async () => {
        const schoolId = getSchoolId(this.props.loggedInUser)
        const { mentorId } = this.props.match.params
        const { value: gradeValue } = this.state.gradeFilter
        const { value: courseValue } = this.state.courseFilter
        let filters = `{id:"${mentorId}"}`
        let batchFilters = `{school_some:{id: "${schoolId}"}},{allottedMentor_some:{id:"${mentorId}"}}`
        this.setState({
            isFetching: true
        })
        if (gradeValue && gradeValue !== 'all') {
            batchFilters += `,{classes_some: { grade:${gradeValue.split('-')[0]}}}`
            batchFilters += `,{classes_some: { section:${gradeValue.split('-')[1]}}}`
        }
        if (courseValue && courseValue !== 'all') {
            batchFilters += `,{course_some:{title_contains:"${courseValue}"}}`
        }
        await fetchMentorProfiles(schoolId, filters).call()
        await fetchSchoolBatches(batchFilters, 0, 0, 'mentorBatches').call()
        this.setState({
            isFetching: false,
        }, () => {
            this.setTableData()
        })
    }

    getSessionRecurrenceString = (record) => {
        if (record
            && get(record, 'timeTableRule') && get(record, 'timeTableRule.startDate')) {
            const timeTableRule = get(record, 'timeTableRule')
            let repeatedWeeks = ''
            weekDays.forEach(day => {
                if (timeTableRule[day]) repeatedWeeks += `${day.charAt(0).toUpperCase() + day.slice(1)} `
            })
            const startDate = new Date(get(timeTableRule, 'startDate'))
            const endDate = new Date(get(timeTableRule, 'endDate'))
            return `Every ${repeatedWeeks} from ${format(startDate, 'd MMM, yyyy')} - ${format(endDate, 'd MMM, yyyy')}`
        }
        return '-'
    }
    
    setTableData = () => {
        const mentorBatches = this.props.mentorBatches && this.props.mentorBatches.toJS()
        /** 
         * Please Note: Mapping Nested Fields to Top level for DataTable being able to map key with DataFields.
         * 
         * Alternative: Use @render func to map data with Custom JSX.
         */
        const tableData = mentorBatches.map(batch => ({
            id: get(batch, 'id', null),
            course: {
                title: get(batch, 'course.title', '-'),
                thumbnail: get(batch, 'course.thumbnail.uri', ''),
            },
            grade: get(batch, 'classes', []).map(classObj => `${classObj.grade}-${classObj.section}`),
            students: get(batch, 'studentsMeta.count', '-'),
            batchCode: get(batch, 'code', '-'),
            originalRecord: batch,
        }))
        const tableColumns = [
            {
                title: 'Grade',
                key: 'grade',
                render: (grade) => (
                    <div>
                        {grade && grade.map(gradeStr => <span style={{ padding: '0px 8px 0px 0px'}}>{gradeStr}</span>)}
                    </div>
                )
            },
            {
                title: 'Students',
                key: 'students',
                render: (students, record) => (
                    <div
                        onClick={() => {
                            this.setState({
                                isBatchDetailsModalVisible: true,
                                selectedBatchDetails: { ...get(record, 'originalRecord'), grade: this.state.activeView }
                            })
                        }}
                        data-tooltip data-tooltip-position="top" 
                        className='school-dashboard-comms-clickableText'
                    >
                        {students || '-'}
                    </div>
                )
            },
            {
                title: 'Batch',
                key: 'batchCode',
            },
            {
                title: 'Course',
                key: 'course',
                render: (course, record) => (
                    <div
                        onClick={() => {
                            this.setState({
                                isCourseDetailsModalVisible: true,
                                selectedBatchDetails: {
                                    ...get(record, 'originalRecord'),
                                    grade: this.state.activeView,
                                    recurrenceString: this.getSessionRecurrenceString(get(record, 'originalRecord'))
                                }
                            })
                        }}
                        data-tooltip data-tooltip-position="top" 
                        className='school-dashboard-courseContainer school-dashboard-comms-clickableText'
                    >
                        {course ? (
                            <span className='school-dashboard-ind-courseContainer'>
                                <span
                                    style={{ backgroundImage: `url(${getPath(course.thumbnail || '')})`}}
                                    className='school-dashboard-courseIcon'
                                />
                                {course.title}
                            </span>
                        ): '-'}
                    </div>
                )
            },
            {
                title: 'Duration',
                key: 'batchCode',
                width: '150px',
                render: (_, record) => (
                    get(record, 'originalRecord.timeTableRule') ? (
                        <div>
                            <div>{getSlotTime(get(record, 'originalRecord.timeTableRule'), 'string')}</div>
                            <div className='school-dashboard-grades-duration-desc'>
                                {this.getSessionRecurrenceString(get(record, 'originalRecord')) || '-'}
                            </div>
                        </div>
                    )  : '-'
                )
            },
            {
                title: 'Status',
                key: 'null',
                width: '150px',
                render: (_, record) => (
                    <div className='school-dashboard-action-container'>
                        {currentBatchSesssionStatus(record.originalRecord)}
                    </div>
                )
            },
            {
                title: 'Action',
                key: 'null',
                render: (_, record) => (
                    <div className='school-dashboard-action-container'>
                        <button
                            onClick={() => {
                                this.setState({
                                    isCourseDetailsModalVisible: true,
                                    selectedBatchDetails: {
                                        ...get(record, 'originalRecord'),
                                        grade: this.state.activeView,
                                        recurrenceString: this.getSessionRecurrenceString(get(record, 'originalRecord'))
                                    }
                                })
                            }}
                            data-tooltip data-tooltip-position="left" 
                            className='school-dashboard-actionBtn'
                        ><Course />
                        </button>
                        <button className='school-dashboard-actionBtn'
                            onClick={() => {
                                this.setState({
                                    isBatchDetailsModalVisible: true,
                                    selectedBatchDetails: { ...get(record, 'originalRecord'), grade: this.state.activeView }
                                })
                            }}
                            data-tooltip data-tooltip-position="top" 
                        ><StudentsSvg /></button>
                        {/* <button className='school-dashboard-actionBtn'><Report /></button> */}
                    </div>
                )
            },
        ];
        this.setState({
            tableColumns,
            tableData,
        })
    }

    setSessionGradeFilters = (value) => {
        this.setState({
            gradeFilter: value
        }, async () => {
            await this.fetchMentorProfile()
        })
    }

    render() {
        const mentorProfile = this.props.schoolMentorProfiles
        const schoolClasses = this.props.schoolClasses && this.props.schoolClasses.toJS()
        const codingLanguages = mentorProfile && mentorProfile.getIn([0, 'mentorProfile', 'codingLanguages'])
        const { tableColumns, tableData } = this.state
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
                    <div>
                            <Link 
                                to={`/dashboard/${this.props.match.params.schoolSlug}/mentors`}
                                className='school-dashboard-back-btn'
                            >
                                <ArrowIcon className='school-dashboard-back-btn-icon' /> Back to All Mentors
                            </Link>
                    </div>
                    <div className='school-dashboard-mentorProfile-row school-dashboard-students-borderContainer'>
                        <div className='school-dashboard-mentorProfile-personalProfile-column'>
                            <ImageBackground
                                className='school-dashboard-mentorProfile-profilePic'
                                src={getPath(mentorProfile.getIn([0, 'profilePic', 'uri'])) || ''}
                                srcLegacy={getPath(mentorProfile.getIn([0, 'profilePic', 'uri'])) || ''}
                            />
                            <div className='school-dashboard-profile-container'>
                                <div className='school-dashboard-mentorProfile-name'>{mentorProfile.getIn([0, 'name'])}
                                    {calculateMentorRating(mentorProfile.getIn([0, 'mentorProfile'])) !== '' && (
                                        <div className='school-dashboard-mentor-rating-container'>
                                            <span>&#9733;</span>
                                            {calculateMentorRating(mentorProfile.getIn([0, 'mentorProfile']))}
                                        </div>
                                    )}
                                </div>
                                {/* <button className='school-dashboard-primary-btn'>Student Report</button> */}
                            </div>
                        </div>
                    </div>
                    <div className='school-dashboard-students-borderContainer' style={{ padding: '18px' }}>
                        <div className='school-dashboard-heading-text'>Programming Skills</div>
                        <div className='school-dashboard-mentor-codingLang-container'>
                            {codingLanguages && codingLanguages.toJS().map((language) => (
                                <div className='school-dashboard-mentor-codingLang'>
                                    {language.value}
                                </div>
                            ))}
                        </div>
                    </div>
                   <ChatWidget /> 
                    <div className='school-dashboard-students-borderContainer'>
                        <div className='school-dashboard-mentorProfile-filters-container'>
                            <div className='school-dashboard-heading-text'>Courses</div>
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
                                            courseFilter: course
                                        }, async () => {
                                            await this.fetchMentorProfile()
                                        })
                                    }}
                                    isSearchable={false}
                                />
                                <Select
                                    options={
                                            [{value: 'all', label: 'All'}].concat(schoolClasses.map(classObj => ({
                                            value: `${classObj.grade}-${classObj.section}`,
                                            label: `${classObj.grade}-${classObj.section}`
                                        })) || [])
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
                        <DataTable
                            columns={tableColumns}
                            tableData={tableData}
                            tableHeight='80vh'
                            isLoading={this.state.isFetching}
                        />
                    </div>
                    <CourseDetailsModal
                        isModalVisible={this.state.isCourseDetailsModalVisible}
                        batchDetails={this.state.selectedBatchDetails}
                        closeCourseDetailsModal={() => {
                            this.setState({
                                isCourseDetailsModalVisible: false,
                            })
                        }}
                    />
                    <BatchDetailsModal
                        isModalVisible={this.state.isBatchDetailsModalVisible}
                        batchDetails={this.state.selectedBatchDetails}
                        match={this.props.match}
                        closeBatchDetailsModal={() => {
                            this.setState({
                                isBatchDetailsModalVisible: false,
                            })
                        }}
                    />
                </div>
            </>
        )
    }
}

export default MentorProfile