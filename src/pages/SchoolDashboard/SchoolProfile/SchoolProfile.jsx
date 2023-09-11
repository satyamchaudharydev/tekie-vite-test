import React from 'react'
// import Select from '../components/Select'
import { get } from 'lodash'
import { motion }from 'framer-motion'
import Course from '../../../assets/SchoolDashboard/icons/Course'
import PhoneIcon from '../../../assets/SchoolDashboard/icons/PhoneIcon'
import MailIcon from '../../../assets/SchoolDashboard/icons/MailIcon'
import {getToasterBasedOnType, Toaster} from '../../../components/Toaster'
import LocationIcon from '../../../assets/SchoolDashboard/icons/Location'
import EditIcon from '../../../assets/SchoolDashboard/icons/Edit'
import { getSchoolId } from '../utils'
import fetchSchoolProfile from '../../../queries/schoolDashboard/fetchSchoolProfile'
import getPath from '../../../utils/getPath'
import UpdateSchoolModal from '../components/UpdateSchoolModal/UpdateSchoolModal'
import uploadSchoolLogo from '../../../queries/schoolDashboard/uploadSchoolLogo'


import './SchoolProfile.scss'
import '../SchoolDashboard.common.scss'
import { ImageBackground } from '../../../image'
import renderChats from '../../../utils/getChatTags'
import ChatWidget from '../../../components/ChatWidget'

class SchoolProfile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isFetching: true,
            isUpdateSchoolModalVisible: false,
            isImageUploadLoading: false,
            imageUploadSuccess: false
        }
    }

    componentDidMount() {
        this.fetchSchoolProfile()
    }

    componentDidUpdate(prevProps, prevState) {
        const updateStatus = this.props.updateSchoolStatus && this.props.updateSchoolStatus.toJS()
        const prevUpdateStatus = prevProps.updateSchoolStatus && prevProps.updateSchoolStatus.toJS()
        if (get(updateStatus, 'success') && !get(prevUpdateStatus, 'success')) {
            getToasterBasedOnType({
                type: 'success',
                message: 'Successfully Updated!'
            })
        }
        if (get(this.state, 'imageUploadSuccess') && !get(prevState, 'imageUploadSuccess')) {
            getToasterBasedOnType({
                type: 'success',
                message: 'Logo Successfully Updated!'
            })
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
    
    fetchSchoolProfile = async () => {
        const schoolId = getSchoolId(this.props.loggedInUser)
        await fetchSchoolProfile(schoolId).call()
        const schoolProfile = this.props.schoolProfile && this.props.schoolProfile.toJS()
        this.setState({
            isFetching: false,
            schoolLogo: get(schoolProfile, 'logo')
        })
    }

    renderProfileDetail = ({ label, value, Icon, customStyle = {} }) => (
        <div className='school-dashboard-schoolProfile-details-container'>
            <Icon className='school-dashboard-schoolProfile-details-icon' />
            <div>
                <span className='school-dashboard-schoolProfile-details-title'>{label}</span>
                <span className='school-dashboard-schoolProfile-details-value' style={customStyle}>{value || '-'}</span>
            </div>
        </div>
    )

    onChange = (event) => {
        if (event.target.files[0]) {
            this.setState({
                schoolLogoUploadURL: URL.createObjectURL(event.target.files[0]),
                schoolLogoFile: event.target.files[0]
            });
        }
    }

    getSchoolLocation = (schoolDetails) => {
        let locationString = '' 
        if (get(schoolDetails, 'city')) {
            locationString += `${get(schoolDetails, 'city', '')}, `
        }
        if (get(schoolDetails, 'country')) {
            locationString += get(schoolDetails, 'country', '')
        }
        return locationString
    }
 
    render() {
        const schoolProfile = this.props.schoolProfile && this.props.schoolProfile.toJS()
        const schoolName = this.props.loggedInUser && this.props.loggedInUser.getIn(['schools', 0, 'name'])
        const { schoolLogo, isFetching } = this.state
        const schoolDetails = this.props.loggedInUser && this.props.loggedInUser.getIn(['schools', 0]).toJS()
        return (
            <>
                
                <div id='school-dashboard-students-container'>
                    {isFetching ? (
                    <>
                        <div className='loading-container show'>
                            <div className='loading-bar-container'>
                                <div />
                            </div>
                        </div>
                    </>
                    ) : (null)}
                    <ChatWidget />
                    <div className='school-dashboard-schoolProfile-row school-dashboard-students-borderContainer'>
                        <div className='school-dashboard-schoolProfile-personalProfile-column'>
                            <div>
                                <ImageBackground
                                    className='school-dashboard-schoolProfile-profilePic'
                                    src={this.state.schoolLogoUploadURL || getPath(get(schoolLogo, 'uri'))}
                                    srcLegacy={this.state.schoolLogoUploadURL || getPath(get(schoolLogo, 'uri'))}
                                >
                                    {this.state.schoolLogoUploadURL && (
                                        <motion.div
                                            whileTap={{
                                                scale: 0.95
                                            }} 
                                            style={{
                                                pointerEvents: `${this.state.isImageUploadLoading ? 'none' : 'default'}`
                                            }}
                                            onClick={async () => {
                                                this.setState({
                                                    isImageUploadLoading: true,
                                                    imageUploadSuccess: false
                                                })
                                                const res = await uploadSchoolLogo(this.state.schoolLogoFile, get(schoolDetails, 'id'), get(schoolLogo, 'id'))
                                                if (res && res.id) {
                                                    this.setState({
                                                        schoolLogo: res,
                                                        schoolLogoUploadURL: null,
                                                        schoolLogoFile: null,
                                                        imageUploadSuccess: true
                                                    })      
                                                }
                                                this.setState({
                                                    isImageUploadLoading: false
                                                })
                                            }}
                                            className='profileLogo-submit-container'>
                                            {this.state.isImageUploadLoading ?
                                                <span className='loader' /> :
                                                <span className='correctIcon' />
                                            }
                                        </motion.div>
                                    )}
                                </ImageBackground>
                                <motion.div
                                    whileTap={{
                                        scale: 0.95
                                    }} 
                                    className='school-dashboard-input-btn'
                                    style={{ margin: '12px auto 0px' }}
                                >
                                    <input type='file' onChange={this.onChange} />
                                    Change Photo
                                </motion.div>
                            </div>
                            <div className='school-dashboard-profile-container'>
                                <div className='school-dashboard-schoolProfile-name'>
                                    {get(schoolProfile, 'name', schoolName)}
                                </div>
                                <div className='school-dashboard-schoolProfile-location'>
                                    {(get(schoolProfile, 'city', '') || get(schoolProfile, 'country', '')) && (
                                        this.renderProfileDetail({ label: 'Location', value: this.getSchoolLocation(schoolDetails), Icon: LocationIcon})
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='school-dashboard-schoolProfile-divider' />
                        <div className='school-dashboard-heading-text'>School Co-ordinator</div>
                        <div className='school-dashboard-schoolProfile-personalProfile-column'>
                            {/* <ImageBackground
                                className='school-dashboard-schoolCoordinator-profilePic'
                                // src={}
                                // srcLegacy={}
                            /> */}
                            <div className='school-dashboard-profile-container' style={{ paddingLeft: 0 }}>
                                <div className='school-dashboard-schoolProfile-coordinatorName'>
                                    {get(schoolProfile, 'coordinatorName', get(schoolDetails, 'coordinatorName'))}
                                </div>
                                <div className='school-dashboard-schoolCoordinator-flexContainer'>
                                    <div className='school-dashboard-schoolCoordinator-details'>
                                        {this.renderProfileDetail({ label: 'Email', value: get(schoolProfile, 'coordinatorEmail', get(schoolDetails, 'coordinatorEmail')), Icon: MailIcon, customStyle: { textTransform: 'none' }})}
                                        {this.renderProfileDetail({ label: 'Phone', value: get(schoolProfile, 'coordinatorPhone.number', get(schoolDetails, 'coordinatorPhone.number')), Icon: PhoneIcon})}
                                    </div>
                                    <div className='school-dashboard-action-container'>
                                        <button
                                            onClick={() => {
                                                this.setState({
                                                    isUpdateSchoolModalVisible: true
                                                })
                                            }}
                                            className='school-dashboard-actionBtn'
                                        ><EditIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(schoolProfile && Object.keys(schoolProfile).length) ? (
                        <UpdateSchoolModal
                            isModalVisible={this.state.isUpdateSchoolModalVisible}
                            updateSchoolStatus={this.props.updateSchoolStatus && this.props.updateSchoolStatus.toJS()}
                            schoolDetails={schoolProfile}
                            closeModal={(shouldFetch = false) => {
                                if (shouldFetch) {
                                    this.fetchSchoolProfile()
                                }
                                this.setState({
                                    isUpdateSchoolModalVisible: false,
                                })
                            }}
                        />
                    ) : null}
                </div>
            </>
        )
    }
}

export default SchoolProfile