import React from 'react'
import DataTable from '../components/DataTableV1/DataTable'
import Select from '../components/Select'
import { get } from 'lodash'
import Pagination from '../components/Pagination'
import { Link } from 'react-router-dom'
import fetchMentorProfiles from '../../../queries/schoolDashboard/fetchMentorProfiles'
import ViewIcon from '../../../assets/SchoolDashboard/icons/View'
import ReportIcon from '../../../assets/SchoolDashboard/icons/Report'
import getPath from '../../../utils/getPath'
import { getSchoolId, courses, calculateMentorRating } from '../utils'

import './Mentors.scss'
import '../SchoolDashboard.common.scss'
import renderChats from '../../../utils/getChatTags'
import ChatWidget from '../../../components/ChatWidget'

class Mentors extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isFetching: false,
            courseFilter: 'all',
            tableColumns: [],
            tableData: [],
            gradeIds: [],
            currentPage: 1,
            perPage: 10,
        }
    }

    componentDidMount() {
        this.fetchMentorProfiles()
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
    fetchMentorProfiles = async () => {
        const schoolId = getSchoolId(this.props.loggedInUser)
        const { currentPage, perPage } = this.state
        const { value: courseValue } = this.state.courseFilter
        let filters = ``
        this.setState({
            isFetching: true
        })
        if (courseValue && courseValue !== 'all') {
            filters += `{mentorProfile_some:{codingLanguages_value_subDoc: ${courseValue.charAt(0).toUpperCase()+courseValue.slice(1)}}}`
        }
        await fetchMentorProfiles(schoolId, filters, perPage, currentPage - 1).call()
        this.setState({
            isFetching: false,
        }, () => {
            this.setAllMentorsTableData()
        })
    }

    setAllMentorsTableData = () => {
        const mentorProfiles = this.props.schoolMentorProfiles && this.props.schoolMentorProfiles.toJS()
        /** 
         * Please Note: Mapping Nested Fields to Top level for DataTable being able to map key with DataFields.
         * 
         * Alternative: Use @render func to map data with Custom JSX.
         */
        const tableData = mentorProfiles.map(profile => ({
            id: profile.id,
            mentorName: get(profile, 'name', '-'),
            mentorProfileImage: get(profile, 'profilePic.uri', null),
            mentorProfile: get(profile, 'mentorProfile', null),
            codingLanguages: get(profile, 'mentorProfile.codingLanguages', []),
            originalRecord: profile
        }))
        const mentorProfileTableColumns = [
            {
                title: 'Mentor',
                key: 'mentorName',
                render: (mentorName, record) => (
                    <div
                        onClick={() => {
                            this.props.history.push(`/dashboard/${this.props.match.params.schoolSlug}/mentors/${get(record, 'id')}`)
                        }}
                        data-tooltip data-tooltip-position="top"
                        className='school-dashboard-mentors-profileContainer school-dashboard-comms-clickableText'
                    >
                        {get(record, 'mentorProfileImage') && <span className='school-dashboard-mentors-profilePic' style={{ backgroundImage: `url(${getPath(get(record, 'mentorProfileImage'))})` }}/>}
                        {mentorName}
                    </div>
                )
            },
            {
                title: 'Rating',
                key: 'mentorProfile',
                width: '150px',
                render: (mentorProfile, record) => (
                    <>
                        {calculateMentorRating(mentorProfile) !== '' ? (
                            <div className='school-dashboard-mentors-rating-container'>
                                <span>&#9733;</span>
                                {calculateMentorRating(mentorProfile)}
                            </div>
                        ) : '-'}
                    </>
                )
            },
            {
                title: 'Courses',
                key: 'codingLanguages',
                width: '150px',
                render: (codingLanguages, record) => (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        {codingLanguages ? codingLanguages.map(language => (
                            <div style={{ padding: '0px 4px'}}>
                                {get(language, 'value')}
                            </div>
                        )) : '-'}
                    </div>
                )
            },
            {
                title: 'Action',
                key: 'id',
                width: '150px',
                render: (id, record) => (
                    <div className='school-dashboard-action-container'>
                        <Link
                            to={`/dashboard/${this.props.match.params.schoolSlug}/mentors/${id}`}
                            className='school-dashboard-actionBtn'
                            data-tooltip data-tooltip-position="right"
                        >
                            <ViewIcon />
                        </Link>
                        {/* <button className='school-dashboard-actionBtn'><ReportIcon /></button> */}
                    </div>
                )
            },
        ];
        this.setState({
            tableColumns: mentorProfileTableColumns,
            tableData,
        })
    }

    pageChange = ({ currentPage: page}) => {
        if (page === this.state.currentPage || page < 0) {
            return
        }
        this.setState({
            currentPage: page
        }, () => {
            this.fetchMentorProfiles()
        })
    }

    render() {
        const { tableColumns, tableData, currentPage, perPage } = this.state
        return (
            <>
                <div id='school-dashboard-mentors-container'>
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
                        <div className='school-dashboard-heading-text' style={{ display: 'flex' }}>
                            All Mentors
                        </div>
                        {/* <button className='school-dashboard-primary-btn'>All Grades Report</button> */}
                    </div>
                    <ChatWidget />
                    <div className='school-dashboard-filters-container'>
                        <div className='school-dashboard-heading-text'></div>
                        <div className='school-dashboard-filters'>
                            {/* <Select
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
                                        await this.fetchMentorProfiles()
                                    })
                                }}
                                isSearchable={false}
                            /> */}
                        </div>
                    </div>
                    <div className='school-dashboard-mentors-tableContainer'>
                        {/* {tableData && tableData.length > 0 && ( */}
                        <DataTable
                            columns={tableColumns}
                            tableData={tableData}
                            tableHeight='80vh'
                            isLoading={this.state.isFetching}
                        />
                        {/* )} */}
                    </div>
                    {!this.state.isFetching && (
                        <div className='school-dashboard-pagination-container'>
                            <Pagination
                                totalRecords={this.props.totalMentorProfiles && this.props.totalMentorProfiles.getIn([0, 'count'])}
                                currentPage={this.state.currentPage}
                                pageLimit={this.state.perPage}
                                pageNeighbours={10}
                                onPageChanged={this.pageChange}
                            />
                            {currentPage > 0 && (
                                <div className='school-dashboard-pagination-details'>
                                    Showing <span className='school-dashboard-pagination-highlight'>{(currentPage-1)*perPage}{'-'}{Math.min(((currentPage-1)*perPage) + perPage, this.props.totalMentorProfiles && this.props.totalMentorProfiles.getIn([0, 'count']))}</span> of {this.props.totalMentorProfiles && this.props.totalMentorProfiles.getIn([0, 'count'])} results
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </>
        )
    }
}

export default Mentors