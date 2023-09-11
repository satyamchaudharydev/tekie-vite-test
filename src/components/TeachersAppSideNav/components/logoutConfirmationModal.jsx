import React, {useState} from 'react'
import Button from '../../../pages/TeacherApp/components/Button/Button'
import { CalenderSvg, CloseSvg } from '../../../pages/TeacherApp/components/svg'
import styles from './logoutModal.module.scss'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { filterKey } from '../../../utils/data-utils'
import { Redirect, useHistory } from 'react-router-dom'
import getMe from '../../../utils/getMe'
import { get } from 'lodash'
import { fireGtmEvent } from '../../../utils/analytics/gtmActions'
import { gtmEvents } from '../../../utils/analytics/gtmEvents'
import { getUserParams } from '../../../utils/getUserParams'

const LogoutModal = (props) => {

    const [logout, setLogout] = useState(false);
    const history = useHistory()
    const logOut = ()=>{
        setLogout(true);
        props.dispatch({ type: 'LOGOUT' });
        history.push('/')
    }
    return <div className={styles.sessionModalContainer} role="dialog" aria-labelledby='modalTitle' aria-describedby='modalDesc'>
        <div className={styles.sessionModal}>
            <div className={styles.header}>
                <div className={styles.header_headingContainer}>
                    <div className={styles.sessionIcon}> <CalenderSvg /></div>
                    <span id='modalTitle'>Logout Confirmation</span>
                </div>
                <div className={styles.closeModalIcon} onClick={() => props.setIsLogoutModalVisible(false)}>
                    <CloseSvg />
                </div>
            </div>
            <div className={styles.body}>
                Are you sure you want to logout ?
            </div>
            <div className={styles.footer}>
                <span onClick={() => {
                    props.setIsLogoutModalVisible(false)
                    const userParams = getUserParams()
                    fireGtmEvent(gtmEvents.logoutConfirmationNo,{userParams})
                }}><Button text='No' type='secondary' /></span>
                <span style={{width:"20px",}}></span>
                <span style={{width: "100%"}} onClick={() => {
                    const userParams = getUserParams()
                    fireGtmEvent(gtmEvents.teacherLogoutSuccessful,{userParams})
                    logOut()
                }}><Button text='Yes, Log me out' type='primary' widthFull /></span>
            </div>
        </div>
        {logout && <Redirect to='/' />}
    </div>
}
const mapStateToProps = (state) => ({
    ...state
  })
  
  export default connect(mapStateToProps)(withRouter(LogoutModal))