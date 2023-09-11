import React from 'react'
import DataTable from '../components/DataTableV1/DataTable'
import Select from '../components/Select'
import { get } from 'lodash'
import { format } from 'date-fns'
import ArrowIcon from '../../../assets/arrowIcon'
import { avatarsRelativePath } from '../../../utils/constants/studentProfileAvatars'
import fetchStudentProfiles from '../../../queries/schoolDashboard/fetchStudentProfiles'
import fetchSchoolBatches from '../../../queries/schoolDashboard/fetchBatches'
import Course from '../../../assets/SchoolDashboard/icons/Course'
import StudentsSvg from '../../../assets/SchoolDashboard/icons/Students'
import Report from '../../../assets/SchoolDashboard/icons/Report'
import PhoneIcon from '../../../assets/SchoolDashboard/icons/PhoneIcon'
import UserIcon from '../../../assets/SchoolDashboard/icons/UserIcon'
import MailIcon from '../../../assets/SchoolDashboard/icons/MailIcon'
import { getSlotTime, getSchoolId, courses, currentBatchSesssionStatus} from '../utils'
import getPath from '../../../utils/getPath'
import CourseDetailsModal from '../components/CourseDetailsModal/CourseDetailsModal'
import BatchDetailsModal from '../components/BatchDetailsModal/BatchDetailsModal'


import './StudentProfile.scss'
import '../SchoolDashboard.common.scss'
import { Link } from 'react-router-dom'
import { ImageBackground } from '../../../image'
import ChatWidget from '../../../components/ChatWidget'
import renderChats from '../../../utils/getChatTags'

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

class StudentProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isFetching: false,
            courseFilter: 'all',
            tableColumns: [],
            tableData: [],
            gradeIds: [],
            isCourseDetailsModalVisible: false,
            isBatchDetailsModalVisible: false,
        }
    }

    componentDidMount() {
        this.fetchStudentProfile()
    }
    componentDidUpdate(prevProps) {
        const { studentId } = this.props.match.params
        const { studentId: prevStudentId } = prevProps.match.params
        if (prevStudentId !== studentId) {
            this.setState({
                courseFilter: 'all',
                isCourseDetailsModalVisible: false,
                isBatchDetailsModalVisible: false,
            })
            this.fetchStudentProfile()
        }
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

    fetchStudentProfile = async () => {
        const schoolId = getSchoolId(this.props.loggedInUser)
        const { studentId } = this.props.match.params
        const { value: courseValue } = this.state.courseFilter
        let filters = `{school_some:{id: "${schoolId}"}},{user_some:{id:"${studentId}"}}`
        let batchFilters = `{school_some:{id: "${schoolId}"}},{students_some:{user_some:{id:"${studentId}"}}}`
        this.setState({
            isFetching: true
        })
        if (courseValue && courseValue !== 'all') {
            batchFilters += `,{course_some:{title_contains:"${courseValue}"}}`
        }
        await fetchStudentProfiles(filters).call()
        await fetchSchoolBatches(batchFilters, 0, 0, 'studentBatches').call()
        this.setState({
            isFetching: false,
        }, () => {
            this.setAllStudentsTableData()
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

    setAllStudentsTableData = () => {
        const studentBatches = this.props.studentBatches && this.props.studentBatches.toJS()
        /** 
         * Please Note: Mapping Nested Fields to Top level for DataTable being able to map key with DataFields.
         * 
         * Alternative: Use @render func to map data with Custom JSX.
         */
        const tableData = studentBatches.map(batch => ({
            id: get(batch, 'id', null),
            course: {
                title: get(batch, 'course.title', '-'),
                thumbnail: get(batch, 'course.thumbnail.uri', ''),
            },
            batchCode: get(batch, 'code', '-'),
            allottedMentor: get(batch, 'allottedMentor'),
            originalRecord: batch,
        }))
        const tableColumns = [
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
                title: 'Mentor',
                key: 'allottedMentor',
                width: '150px',
                render: (allottedMentor, record) => (
                    get(allottedMentor, 'name') ? (
                        <div
                            onClick={() => {
                                this.props.history.push(`/dashboard/${this.props.match.params.schoolSlug}/mentors/${get(allottedMentor, 'id')}`)
                            }}
                            data-tooltip data-tooltip-position="top"
                            className='school-dashboard-student-profileContainer school-dashboard-comms-clickableText'
                        >
                            {get(allottedMentor, 'profilePic') && <span className='school-dashboard-mentors-profilePic' style={{ backgroundImage: `url(${getPath(get(allottedMentor, 'profilePic.uri'))})` }}/>}
                            {get(allottedMentor, 'name', '-')}
                        </div>

                    ) : '-'
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

    renderProfileDetail = ({ label, value, Icon}) => (
        <div className='school-dashboard-studentProfile-details-container'>
            <Icon className='school-dashboard-studentProfile-details-icon' />
            <div style={{ marginLeft: '12px' }}>
                <span className='school-dashboard-studentProfile-details-title'>{label}</span>
                <span className='school-dashboard-studentProfile-details-value'>{value || '-'}</span>
            </div>
        </div>
    )

    render() {
        const studentProfile = this.props.schoolStudentProfiles
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
                    <div className='school-dashboard-marginLeft-mobileOnly'>
                            <Link 
                                to={`/dashboard/${this.props.match.params.schoolSlug}/students`}
                                className='school-dashboard-back-btn'
                            >
                                <ArrowIcon className='school-dashboard-back-btn-icon' /> Back to All Students
                            </Link>
                    </div>
                    <ChatWidget />
                    <div className='school-dashboard-studentProfile-row school-dashboard-students-borderContainer'>
                        <div className='school-dashboard-studentProfile-personalProfile-column'>
                            <ImageBackground
                                className='school-dashboard-studentProfile-profilePic'
                                src={getPath(studentProfile.getIn([0, 'userData', 'profilePic', 'uri'])) || avatarsRelativePath[studentProfile.getIn([0, 'profileAvatarCode'])]}
                                srcLegacy={getPath(studentProfile.getIn([0, 'userData', 'profilePic', 'uri'])) || avatarsRelativePath[studentProfile.getIn([0, 'profileAvatarCode'])]}
                            />
                            <div className='school-dashboard-profile-container'>
                                <div className='school-dashboard-studentProfile-name'>{studentProfile.getIn([0, 'userData', 'name'])}</div>
                                <div className='school-dashboard-studentProfile-gradeAndSection'>
                                    <span>
                                        Grade: {studentProfile.getIn([0, 'schoolClass', 'grade'], '').replace('Grade','')}
                                    </span>
                                    <span className='school-dashboard-studentProfile-bullet'>&bull;</span>
                                    <span>
                                        Section: {studentProfile.getIn([0, 'schoolClass', 'section'])}
                                    </span>
                                </div>
                                 {/* <button className='school-dashboard-primary-btn'>Student Report</button> */}
                            </div>
                        </div>
                        <div className='school-dashboard-studentProfile-details-column'>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                                {this.renderProfileDetail({ label: 'Student Email', value: studentProfile.getIn([0, 'userData', 'email'], '-'), Icon: MailIcon})}
                                {this.renderProfileDetail({ label: 'Parent’s Name', value: studentProfile.getIn([0, 'studentParents', 0, 'userData', 'name'], '-'), Icon: UserIcon})}
                                {this.renderProfileDetail({ label: 'Parent’s Email', value: studentProfile.getIn([0, 'studentParents', 0, 'userData', 'email'], '-'), Icon: MailIcon})}
                                {this.renderProfileDetail({ label: 'Parent’s Phone', value: studentProfile.getIn([0, 'studentParents', 0, 'userData', 'phone', 'number'], '-'), Icon: PhoneIcon})}
                            </div>
                        </div>
                    </div>
                    <div className='school-dashboard-students-borderContainer'>
                        <div className='school-dashboard-studentProfile-filters-container'>
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
                                            await this.fetchStudentProfile()
                                        })
                                    }}
                                    isSearchable={false}
                                />
                            </div>
                        </div>
                        <DataTable
                            columns={tableColumns}
                            tableData={tableData}
                            tableHeight='60vh'
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

export default StudentProfile