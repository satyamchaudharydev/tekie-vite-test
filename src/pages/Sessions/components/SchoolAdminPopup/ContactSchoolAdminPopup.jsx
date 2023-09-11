import React, { Component } from 'react'
import { get } from 'lodash'
import cx from 'classnames'
import styles from '../BookSession/BookSession.module.scss'
import PopUp from '../../../../components/PopUp/PopUp'
import { getActiveBatchDetail } from '../../../../utils/multipleBatch-utils'

class ContactSchoolAdminPopup extends Component {
    getSchoolName = () => {
        const { loggedInUser, schoolInfo } = this.props
        let schoolName = ''
        if (loggedInUser) {
            const children = get(loggedInUser.toJS(), 'parent.parentProfile.children')
            if (children) {
                children.forEach(child => {
                    if (get(loggedInUser.toJS(), 'id') === get(child, 'user.id')) {
                        schoolName = get(child, 'school.name')
                    }
                })
            }
        }

        //Getting school name for already logged in user.
        if (schoolName === '' && schoolInfo && get(schoolInfo, 'source') === 'school') {
            const children = get(schoolInfo, 'parentProfile.children')
            if (children) {
                children.forEach(child => {
                    if (get(loggedInUser.toJS(), 'id') === get(child, 'user.id')) {
                        schoolName = get(child, 'school.name')
                    }
                })
            }
        }

        //Shortening the name in case its greater than 30 characters.
        if (schoolName && schoolName.length > 30) {
            let index = schoolName.lastIndexOf(' ')
            schoolName = schoolName.substr(0, index)
        }

        return schoolName
    }

    render () {
        const { visible, closeSchoolAdminPopup, isBatchPopup, studentProfile } = this.props
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '0.batch'))
        const mentorName = studentProfile && get(batchDetail, 'allottedMentor.name')
        const mentorPhone = studentProfile && get(batchDetail, 'allottedMentor.phone.number')

        return (
            <PopUp
                    showPopup={visible}
                    closePopUp={() => closeSchoolAdminPopup()}
                >
                    <div className={cx(styles.contactSchoolContainer, !isBatchPopup ? styles.centerAligned : '', isBatchPopup && styles.contactBatchContainer)}>
                        <div className={cx(styles.contactSchoolText, isBatchPopup ? styles.batchHeading : styles.heading)}>{
                            isBatchPopup
                            ? 'Contact Mentor'
                            : this.getSchoolName()
                        }</div>
                        <div className={styles.contactSchoolText}>
                            {
                                isBatchPopup
                                ? `Reach out to your mentor, ${mentorName ? mentorName.substr(0, mentorName.indexOf(' ')) : ''},`
                                : 'Contact your school administrator to book the'
                            }
                        </div>
                        <div className={cx(styles.contactSchoolText, styles.lessMargin)}>{
                            isBatchPopup
                            ? (
                                <div style={{ display: 'flex', flexDirection: 'row', marginTop: '5px' }}>
                                    <div>at</div>
                                    <div style={{ textDecoration: 'underline', paddingLeft: '5px' }}>{mentorPhone}</div>
                                    <div style={{ paddingLeft: '5px' }}>to book the session.</div>
                                </div>
                            )
                            : 'session.'
                        }</div>
                        {
                            !isBatchPopup
                            ? (
                                <div>
                                    <div className={styles.contactSchoolText}>OR</div>
                                    <div className={styles.contactSchoolText}>
                                        Reach out to us at<div style={{ textDecoration: 'underline', paddingLeft: '5px' }}>8827706789</div>.
                                    </div>
                                </div>
                            )
                            : <div />
                        }
                        <div
                            className={cx(styles.okButton)}
                            onClick={() => closeSchoolAdminPopup()}
                        >
                            OK
                        </div>
                    </div>
                </PopUp>
        )
    }
}

export default ContactSchoolAdminPopup
