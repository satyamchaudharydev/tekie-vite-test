import React, { Component } from 'react'
import PopUp from '../PopUp/PopUp'
import styles from './PaymentSuccessModal.module.scss'
import { ReactComponent as PaymentSuccessDrop } from '../../assets/payment_success_drop.svg'
import { ActionButton } from "../Buttons";
import { Button } from '../../photon'
import BottomUpConfetti from "../../assets/animations/bottomUpConfetti.json";
import Lottie from "react-lottie";
import ContactSchoolAdminPopup from '../../pages/Sessions/components/SchoolAdminPopup/ContactSchoolAdminPopup'
import { get } from "lodash";
import CloseIcon from '../../assets/Close.jsx'
import fetchStudentCurrentStatus from '../../queries/fetchStudentCurrentStatus';
import { ImageBackground } from '../../image';
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils';

const buttonTextProps = {
    hideIconContainer: true,
    buttonTextCenterAligned: true
}

class PaymentSuccessModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            showConfetti: false,
            showContactSchoolPopup: false,
            showBatchPopup: false
        }
    }

    confettiOption = {
        loop: false,
        autoplay: true,
        animationData: BottomUpConfetti,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.visible && prevProps.visible !== this.props.visible) {
            setTimeout(async () => {
                fetchStudentCurrentStatus(this.props.userId)
                this.setState({
                    showConfetti: true
                })
            }, 700)
        }
    }

    bookSession = () => {
        const { loggedInUser, studentProfile } = this.props
        this.props.closePaymentSuccessPopup()
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '0.batch'))
        if (loggedInUser && loggedInUser.getIn(['parent', 'source']) === 'school') {
            this.setState({
                showContactSchoolPopup: true
            })
        } else if (
            studentProfile &&
            get(batchDetail, 'id') &&
            (get(batchDetail, 'type') === 'b2b' || get(batchDetail, 'type') === 'b2b2c')
        ) {
            this.setState({
                showBatchPopup: true
            })
        } else {
            this.props.showBookPopup(this.props.topicId, this.props.topicName)
        }
    }

    getSchoolInfo = () => {
        const { loggedInUserSchoolInfo } = this.props
        let userSchoolInfo = {}
        if (loggedInUserSchoolInfo) {
            loggedInUserSchoolInfo.toJS().forEach(_u => {
                if (get(_u, 'parentProfile')) {
                    userSchoolInfo = _u
                }
            })
        }

        return userSchoolInfo
    }

    render() {
        const { visible, closePaymentSuccessPopup, newFlow } = this.props
        if (newFlow) {
            return (
                <>
                    <PopUp
                        showPopup={visible}
                        closePopUp={closePaymentSuccessPopup}
                    >
                        <div
                            className={styles.mainContainer}
                            style={{
                                padding: '12px',
                                backgroundImage: `url(${require('../../assets/starsBg.png')})`,
                                backgroundPosition: 'top',
                                backgroundSize: 'contain'
                            }}
                        >
                            <div className={styles.paymentSuccessClose} onClick={closePaymentSuccessPopup}>
                                <div className={styles.paymentSuccessCloseIcon}>
                                    <CloseIcon />
                                </div>
                            </div>
                            <div className={styles.paymentSuccessCheck}>
                                <ImageBackground
                                    src={require('../../assets/checkmark-outline.png')}
                                    srcLegacy={require('../../assets/checkmark-outline.png')}
                                />
                            </div>
                            <div
                                style={{ color: '#504F4F', fontWeight: 'bold' }}
                                className={styles.paymentSuccessContainer}
                            >
                                Payment Successful
                            </div>
                            <div
                                style={{ color: '#504F4F', opacity: 0.7, fontWeight: 'normal' }}
                                className={styles.paymentSuccessSubHeader}
                            >
                                Your payment was successful. Continue to the Learning App.
                            </div>
                            <div className={styles.paymentSuccessActionContainer}>
                                <div
                                    onClick={this.bookSession}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        zIndex: '9999999'
                                    }}
                                >
                                    <Button title={'Book Session'} />
                                </div>
                            </div>
                            {this.state.showConfetti && (
                                <Lottie
                                    options={this.confettiOption}
                                    style={{ position: 'absolute' }}
                                />
                            )}
                        </div>
                    </PopUp>
                    <ContactSchoolAdminPopup
                        visible={this.state.showContactSchoolPopup || this.state.showBatchPopup}
                        closeSchoolAdminPopup={() => this.setState({ showContactSchoolPopup: false, showBatchPopup: false })}
                        loggedInUser={this.props.loggedInUser}
                        schoolInfo={this.getSchoolInfo()}
                        isBatchPopup={this.state.showBatchPopup}
                        studentProfile={this.props.studentProfile}
                    />
                </>
            )
        }
        return (
            <>
                <PopUp
                    showPopup={visible}
                    closePopUp={closePaymentSuccessPopup}
                >
                    <div className={styles.mainContainer}>
                        <div className={styles.paymentSuccessDrop}>
                            <PaymentSuccessDrop />
                        </div>
                        <div className={styles.paymentSuccessContainer}>
                            Payment Successful!
                        </div>
                        <div className={styles.paymentSuccessSubHeader}>
                            You have successfully enrolled in course
                        </div>
                        <div className={styles.paymentSuccessCourseContainer}>
                            {this.props.courseTitle}
                        </div>
                        <div className={styles.paymentSuccessActionContainer}>
                            <div className={styles.paymentSuccessActionText}>
                                Continue your learning journey ...
                            </div>
                            <div
                                onClick={this.bookSession}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    zIndex: '9999999'
                                }}
                            >
                                <ActionButton
                                    {...buttonTextProps}
                                    title={'Book Session'}
                                    active={true}
                                    hoverToCursor={true}
                                />
                            </div>
                        </div>
                        {this.state.showConfetti && (
                            <Lottie
                                options={this.confettiOption}
                                style={{ position: 'absolute' }}
                            />
                        )}
                    </div>
                </PopUp>
                <ContactSchoolAdminPopup
                    visible={this.state.showContactSchoolPopup || this.state.showBatchPopup}
                    closeSchoolAdminPopup={() => this.setState({ showContactSchoolPopup: false, showBatchPopup: false })}
                    loggedInUser={this.props.loggedInUser}
                    schoolInfo={this.getSchoolInfo()}
                    isBatchPopup={this.state.showBatchPopup}
                    studentProfile={this.props.studentProfile}
                />
            </>
        )
    }
}

export default PaymentSuccessModal
