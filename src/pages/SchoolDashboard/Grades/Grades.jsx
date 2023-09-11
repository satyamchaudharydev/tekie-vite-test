import React from 'react'
import DataTable from '../components/DataTableV1/DataTable'
import Select from '../components/Select'
import { format } from 'date-fns'
import { get } from 'lodash'
import Pagination from '../components/Pagination'
import fetchSchoolClasses from '../../../queries/schoolDashboard/fetchSchoolClasses'
import fetchSchoolBatches from '../../../queries/schoolDashboard/fetchBatches'
import View from '../../../assets/SchoolDashboard/icons/View'
import Course from '../../../assets/SchoolDashboard/icons/Course'
import StudentsSvg from '../../../assets/SchoolDashboard/icons/Students'
import Report from '../../../assets/SchoolDashboard/icons/Report'
import ArrowIcon from '../../../assets/arrowIcon'
import getIdArrForQuery from '../../../utils/getIdArrForQuery'
import { getSlotTime, getSchoolId, courses, currentBatchSesssionStatus } from '../utils'
import CourseDetailsModal from '../components/CourseDetailsModal/CourseDetailsModal'
import BatchDetailsModal from '../components/BatchDetailsModal/BatchDetailsModal'
import getPath from '../../../utils/getPath'

import './Grades.scss'
import '../SchoolDashboard.common.scss'
import ChatWidget from '../../../components/ChatWidget'
import fetchStudentCurrentStatus from '../../../queries/fetchStudentCurrentStatus'
import renderChats from '../../../utils/getChatTags'

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

class Grades extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isFetching: false,
            tableColumns: [],
            tableData: [],
            gradeIds: [],
            activeView: 'allGrades',
            gradeFilter: 'all',
            courseFilter: 'all',
            isCourseDetailsModalVisible: false,
            isBatchDetailsModalVisible: false,
            currentPage: 1,
            perPage: 10,

        }
    }

    componentDidMount() {
        const schoolId = getSchoolId(this.props.loggedInUser)
        fetchSchoolClasses(`{school_some:{id: "${schoolId}"}}`).call()
        this.fetchBasedOnActiveView()
    }

    async componentDidUpdate(_, prevState) {
        if (get(prevState, 'activeView') !== get(this.state, 'activeView')) {
            this.fetchBasedOnActiveView()
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

    fetchBasedOnActiveView = async () => {
        await this.fetchSchoolBatches()
        /** To Separate All Grades and Individual Grade View*/
        // const isAllGradesViewActive = this.checkIfAllGradesViewActive()
        // if (isAllGradesViewActive) {
        //     await this.fetchSchoolClasses()
        // } else {
        //     await this.fetchSchoolBatches()
        // }
    }
    fetchSchoolClasses = async () => {
        const schoolId = getSchoolId(this.props.loggedInUser)
        let filters = `{school_some:{id: "${schoolId}"}}`
        this.setState({
            isFetching: true
        })
        fetchSchoolClasses(filters).call()
        await fetchSchoolBatches(filters, 0).call()
        this.setState({
            isFetching: false,
        }, () => {
            this.setTableDataBasedOnActiveView()
        })
    }
    fetchSchoolBatches = async () => {
        this.setState({
            isFetching: true
        })
        const schoolId = getSchoolId(this.props.loggedInUser)
        const { perPage, currentPage} = this.state
        const { value: gradeValue } = this.state.gradeFilter 
        const { value: courseValue } = this.state.courseFilter 
        let filters = `
            {school_some:{id: "${schoolId}"}},
        `
        if (gradeValue && gradeValue !== 'all') {
            filters += `,{classes_some: { grade:${gradeValue.split('-')[0]}}}`
            filters += `,{classes_some: { section:${gradeValue.split('-')[1]}}}`
        }
        if (courseValue && courseValue !== 'all') {
            filters += `,{course_some:{title_contains:"${courseValue}"}}`
        }
        await fetchSchoolBatches(filters, perPage, Math.max(currentPage - 1, 0)).call()
        this.setState({
            isFetching: false,
        }, () => {
            this.setTableDataBasedOnActiveView()
        })
    }

    setTableDataBasedOnActiveView = () => {
            this.setIndividualGradesTableData()
        // const isAllGradesViewActive = this.checkIfAllGradesViewActive()
        // if (isAllGradesViewActive) {
        //     this.setAllGradesTableData()
        // } else {
            //     this.setIndividualGradesTableData()
        // }
    }

    checkIfCourseAlreadyAdded = (prevDoc, courseName) => {
        let doesCourseExists = false
        prevDoc && prevDoc.forEach(({ title }) => {
            if (title === courseName) {
                doesCourseExists = true
            }
        })
        return doesCourseExists
    }

    setAllGradesTableData = () => {
        const schoolClasses = this.props.schoolClasses && this.props.schoolClasses.toJS()
        const schoolBatches = this.props.schoolBatches && this.props.schoolBatches.toJS()
        const transformedGradeCourses = {}
        /** 
         * Mapping SchoolBatches to get combined document for grades with associated courses.  
        */
        schoolBatches.forEach(schoolClasses => {
            schoolClasses.classes && schoolClasses.classes.forEach(schoolClass => {
                if (transformedGradeCourses[`${schoolClass.grade}-${schoolClass.section}`]) {
                    if (!this.checkIfCourseAlreadyAdded(transformedGradeCourses[`${schoolClass.grade}-${schoolClass.section}`], schoolClasses.course.title)) {
                        transformedGradeCourses[`${schoolClass.grade}-${schoolClass.section}`] = [
                            ...transformedGradeCourses[`${schoolClass.grade}-${schoolClass.section}`],
                            { title: get(schoolClasses, 'course.title'), thumbnail: get(schoolClasses, 'course.thumbnail.uri')}
                        ]
                    }

                } else {
                    transformedGradeCourses[`${schoolClass.grade}-${schoolClass.section}`] =
                        [{ title: get(schoolClasses, 'course.title'), thumbnail: get(schoolClasses, 'course.thumbnail.uri') }]
                }
            })
        })
        /** 
         * Please Note: Mapping Nested Fields to Top level for DataTable being able to map key with DataFields.
         * 
         * Alternative: Use @render func to map data with Custom JSX.
         */
        const tableData = schoolClasses.map(classObj => ({
            id: classObj.id,
            grade: `${get(classObj, 'grade')}-${get(classObj, 'section')}`,
            courses: transformedGradeCourses[`${get(classObj, 'grade')}-${get(classObj, 'section')}`],
            students: get(classObj ,'studentsMeta.count') || 0,
            originalRecord: classObj
        }))
        
        const allGradeColumns = [
            {
                title: 'Grade',
                key: 'grade',
                render: (grade) => (
                    <div>
                        {grade.replace('Grade','')}
                    </div>
                )
            },
            {
                title: 'Students',
                key: 'students',
            },
            {
                title: 'Courses',
                key: 'courses',
                width: '200px',
                render: (courses, record) => (
                    <div className='school-dashboard-grades-courseContainer'>
                        {courses ? courses.map(course => (
                            <span className='school-dashboard-grades-ind-courseContainer'>
                                <span
                                    style={{ backgroundImage: `url(${getPath(course.thumbnail || '')})`}}
                                    className='school-dashboard-grades-courseIcon'
                                />
                                {course.title}
                            </span>
                        )) : '-'}
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
                                this.setActiveView(get(record, 'grade','').split('-')[0])
                            }}
                            className='school-dashboard-actionBtn'
                            data-tooltip data-tooltip-position="left"
                        >
                            <View />
                        </button>
                        {/* <button className='school-dashboard-actionBtn'><Report /></button> */}
                    </div>
                )
            },
        ];
        this.setState({
            tableColumns: allGradeColumns,
            tableData,
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

    setIndividualGradesTableData = () => {
        const schoolBatches = this.props.schoolBatches && this.props.schoolBatches.toJS()
        /** 
         * Please Note: Mapping Nested Fields to Top level for DataTable being able to map key with DataFields.
         * 
         * *Alternative: Use @render func to map data with Custom JSX.* 
         */
        const data = schoolBatches.map(classObj => ({
            id: get(classObj, 'id', null),
            course: {
                title: get(classObj, 'course.title', '-'),
                thumbnail: get(classObj, 'course.thumbnail.uri', ''),
            },
            classes: get(classObj, 'classes', []),
            students: get(classObj, 'studentsMeta.count', 0),
            batchCode: get(classObj, 'code', '-'),
            allottedMentor: get(classObj, 'allottedMentor'),
            originalRecord: classObj,
        }))
        const columns = [
            {
                title: 'Grade',
                key: 'classes',
                maxWidth: '100px',
                render: (classes) => (
                    <div
                        title={classes && classes.map(batchClass => (
                            `${get(batchClass, 'grade')}-${get(batchClass, 'section')}`
                        ))}
                        style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%', overflow: 'hidden' }}>
                        {classes && classes.map(batchClass => (
                            <>{get(batchClass, 'grade')}-{get(batchClass, 'section')}&nbsp;</>
                        ))}
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
                maxWidth: '100px',
                render: (batchCode) => (
                    <div
                        title={batchCode}
                        style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%', overflow: 'hidden' }}
                    >
                        {batchCode}
                    </div>
                )
            },
            {
                title: 'Course',
                key: 'course',
                render: (course, record) => (
                    <div className='school-dashboard-grades-courseContainer'>
                        {course ? (
                            <span
                                onClick={() => {
                                    this.setState({
                                        isCourseDetailsModalVisible: true,
                                        selectedBatchDetails: {
                                            ...get(record, 'originalRecord'),
                                            recurrenceString: this.getSessionRecurrenceString(get(record, 'originalRecord'))
                                        }
                                    })
                                }}
                                data-tooltip data-tooltip-position="top"
                                className='school-dashboard-grades-ind-courseContainer school-dashboard-comms-clickableText'>
                                <span
                                    style={{ backgroundImage: `url(${getPath(course.thumbnail || '')})`}}
                                    className='school-dashboard-grades-courseIcon'
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
                width: '250px',
                maxWidth: '250px',
                render: (_, record) => (
                    get(record, 'originalRecord.timeTableRule') ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>
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
                    get(allottedMentor, 'name', null) ? (
                        <div
                            onClick={() => {
                                this.props.history.push(`/dashboard/${this.props.match.params.schoolSlug}/mentors/${get(allottedMentor, 'id')}`)
                            }}
                            data-tooltip data-tooltip-position="top"
                            className='school-dashboard-grade-profileContainer school-dashboard-comms-clickableText'
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
                width: '100px',
                maxWidth: '100px',
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
                            data-tooltip data-tooltip-position="top"
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
            tableColumns: columns,
            tableData: data
        })
    }

    setActiveView = (gradeTitle) => {
        const schoolClasses = this.props.schoolClasses && this.props.schoolClasses.toJS() 
        const gradeIds = schoolClasses
            .filter(classObj => get(classObj, 'grade') === gradeTitle)
            .map(filteredClass => get(filteredClass, 'id'))
        this.setState({
            activeView: gradeTitle,
            gradeIds,
        })
    }

    checkIfAllGradesViewActive = () => {
        const { activeView } = this.state
        return activeView === 'allGrades'
    }

    setSessionGradeFilters = (value) => {
        this.setState({
            gradeFilter: value,
            currentPage: 1,
        }, async () => {
            await this.fetchBasedOnActiveView()
        })
    }

    pageChange = ({ currentPage: page}) => {
        if (page === this.state.currentPage || page < 0) {
            return
        }
        this.setState({
            currentPage: page
        }, () => {
            this.fetchBasedOnActiveView()
        })
    }

    render() {
        const { tableColumns, tableData, currentPage, perPage } = this.state
        const schoolClasses = this.props.schoolClasses && this.props.schoolClasses.toJS()
        return (
            <>
                <div id='school-dashboard-grades-container'>
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
                        {this.checkIfAllGradesViewActive() ? '' : (    
                            <div
                                className='school-dashboard-back-btn school-dashboard-marginLeft-mobileOnly'
                                onClick={() => this.setState({ activeView: 'allGrades', currentPage: 1, courseFilter: 'all' })}
                            >
                                <ArrowIcon className='school-dashboard-back-btn-icon' /> All Grades
                            </div>
                        )}
                    </div>
                    <div className='school-dashboard-header-container'>
                        <div className='school-dashboard-heading-text school-dashboard-marginLeft-mobileOnly' style={{ display: 'flex' }}>
                        {this.checkIfAllGradesViewActive() ? 'All Grades' : this.state.activeView } 
                        </div>
                        {/* <button className='school-dashboard-primary-btn'>All Grades Report</button> */}
                    </div>
                    <ChatWidget /> 
                    <div className='school-dashboard-filters-container'>
                        <div className='school-dashboard-heading-text'></div>
                        <div className='school-dashboard-filters'>
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
                                        await this.fetchBasedOnActiveView()
                                    })
                                }}
                                isSearchable={false}
                            />
                        </div>
                    </div>
                    <div className='school-dashboard-grades-tableContainer'>
                        <DataTable
                            columns={tableColumns}
                            tableData={tableData}
                            tableHeight='60vh'
                            isLoading={this.state.isFetching}
                        />
                    </div>
                    {!this.state.isFetching && (
                        <div className='school-dashboard-pagination-container'>
                            <Pagination
                                totalRecords={this.props.totalSchoolBatches && this.props.totalSchoolBatches.getIn([0, 'count'])}
                                currentPage={this.state.currentPage}
                                pageLimit={this.state.perPage}
                                pageNeighbours={10}
                                onPageChanged={this.pageChange}
                            />
                            {currentPage > 0 && (
                                <div className='school-dashboard-pagination-details'>
                                    Showing <span className='school-dashboard-pagination-highlight'>{Math.max((currentPage-1)*perPage, 1)}-{Math.min(((currentPage-1)*perPage) + perPage, this.props.totalSchoolBatches && this.props.totalSchoolBatches.getIn([0, 'count']))}</span> of {this.props.totalSchoolBatches && this.props.totalSchoolBatches.getIn([0, 'count'])} results
                                </div>
                            )}
                        </div>
                    )}
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
            </>
        )
    }
}

export default Grades