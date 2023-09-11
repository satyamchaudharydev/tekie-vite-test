import React, { Component } from 'react'
import { get } from 'lodash'
import styles from './MyReferrals.module.scss'
import {CreditButton} from "../../components/Buttons/CreditButton";
import {MAXIMUM_EARNED_CREDIT_LIMIT, MINIMUM_BANK_LIMIT, referralCredits} from "../../config";
import {ReactComponent as CircleCheckIcon} from "../../assets/circleCheckIcon.svg";
import {ReactComponent as CircleCheckGreyIcon} from "../../assets/circleCheckGreyicon.svg";
import fetchUserInvites from "../../queries/fetchInvitedUsers";
import formatDate from "../../utils/date-utils/formateDate";
import {getToasterBasedOnType, Toaster} from "../../components/Toaster";
import cx from "classnames";
import {hs} from "../../utils/size";
import Log from './Log';
import Redeem from './Redeem';
import withScale from '../../utils/withScale';

class MyReferrals extends Component {
    state = {
        isLoading: false,
        logs: [],
        isRedeemVisible: false
    }

    async componentDidMount() {
        // if (this.props.invitedUsersStatus && this.props.invitedUsersStatus.toJS() && !this.props.invitedUsersStatus.toJS().userInvite) {
        await fetchUserInvites(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id).call()
        // }
        document.querySelector('#tk-route-container').style.overflow = 'visible'
        this.setState({
            isLoading: false
        })
    }

    componentWillUnmount() {
        document.querySelector('#tk-route-container').style.overflow = 'scroll'
    }

    onBankTransfer() {
        getToasterBasedOnType({
            type: 'error',
            message: `Minimum amount for bank transfer is ₹${MINIMUM_BANK_LIMIT}`
        })
    }

    getCreditsForAUser = (invitedUser) => {
        let credits = 0;
        if(invitedUser.registrationVerified){
            credits = credits + referralCredits[1].registrationVerified
        }
        if(invitedUser.trialTaken){
            credits = credits + referralCredits[1].trialTaken
        }
        if(invitedUser.coursePurchased){
            credits = credits + referralCredits[1].coursePurchased
        }
        return credits
    }

    render() {
        const {userCredit, invitedUsers} = this.props
        const invitedUsersToJS = invitedUsers && invitedUsers.toJS()
        const userCreditToJS = userCredit && userCredit.toJS()
        const breakPoint = 900
        const isDesktop = window.innerWidth > breakPoint

        return (
            <div className={styles.container}>
                
                <div className={cx(styles.bodyContainer,  styles.flexStart)}>
                    {invitedUsersToJS && invitedUsersToJS.length > 0 ? invitedUsersToJS.map((invitedUser, id) => (
                    <div className={styles.invitedUserContainer}>
                        <div className={styles.invitedUserHeaderContainer}>
                            <div className={styles.invitedUserHeaderName}>
                                {invitedUser.acceptedBy && invitedUser.acceptedBy.name} |
                                {invitedUser.acceptedBy && invitedUser.acceptedBy.studentProfile &&
                                ` ${invitedUser.acceptedBy.studentProfile.parents[0].user.phone.countryCode}`}
                                {invitedUser.acceptedBy && invitedUser.acceptedBy.studentProfile &&
                                ` ${invitedUser.acceptedBy.studentProfile.parents[0].user.phone.number}`}
                            </div>
                            <div className={styles.invitedUserHeaderCredit}>
                                {isDesktop && 'Credits Earned:'}
                                <span style={{whiteSpace: 'pre', color: '#00ade6'}}> {
                                    this.getCreditsForAUser(invitedUser)
                                }</span>
                            </div>
                        </div>

                        <div className={styles.invitedUserBodyContainer}>
                            <div className={cx(styles.invitedUserBodyStepParentContainer,
                                styles.fullOpacity,
                                invitedUser.registrationVerified && styles.coloredBorder)} style={{marginTop: `${hs(32)}px`}}>
                                <div className={styles.referralStepsCheckBox}>
                                    <CircleCheckIcon />
                                </div>
                                <div className={styles.invitedUserBodyStepContainer}>
                                    <div className={styles.invitedUserBodyStepLeftContainer}>
                                        <div className={styles.invitedUserBodyStepLeftUpperText}>
                                            Referral invite accepted
                                        </div>
                                        <div className={styles.invitedUserBodyStepLeftBottomText}>
                                            Accepted on: {formatDate(new Date(invitedUser.createdAt)).date}
                                        </div>
                                    </div>
                                    {isDesktop && (
                                        <div className={styles.invitedUserHeaderCredit}>
                                            Gift Voucher applied
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={cx(styles.invitedUserBodyStepParentContainer,
                                invitedUser.registrationVerified && styles.fullOpacity,
                                invitedUser.trialTaken && styles.coloredBorder)}>
                                <div className={styles.referralStepsCheckBox}>
                                    {invitedUser.registrationVerified ?
                                        <CircleCheckIcon /> :
                                        <CircleCheckGreyIcon />
                                    }
                                </div>
                                <div className={styles.invitedUserBodyStepContainer}>
                                    <div className={styles.invitedUserBodyStepLeftContainer}>
                                        <div className={styles.invitedUserBodyStepLeftUpperText}>
                                            Registration Verified
                                        </div>
                                        {invitedUser.registrationVerified &&
                                        <div className={styles.invitedUserBodyStepLeftBottomText}>
                                            Verification  Date: {formatDate(new Date(invitedUser.registrationVerifiedDate)).date}
                                        </div>}
                                    </div>
                                    <div className={styles.invitedUserHeaderCredit}>
                                        +
                                        <span className={invitedUser.registrationVerified && styles.blueColor} style={{whiteSpace: 'pre', color: '#333333'}}> {referralCredits[1].registrationVerified}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={cx(styles.invitedUserBodyStepParentContainer,
                                invitedUser.trialTaken && styles.fullOpacity,
                                invitedUser.coursePurchased && styles.coloredBorder)}>
                                <div className={styles.referralStepsCheckBox}>
                                    {invitedUser.trialTaken ?
                                        <CircleCheckIcon /> :
                                        <CircleCheckGreyIcon />
                                    }
                                </div>
                                <div className={styles.invitedUserBodyStepContainer}>
                                    <div className={styles.invitedUserBodyStepLeftContainer}>
                                        <div className={styles.invitedUserBodyStepLeftUpperText}>
                                            Trial session taken
                                        </div>
                                        {invitedUser.trialTaken &&
                                        <div className={styles.invitedUserBodyStepLeftBottomText}>
                                            Session Date: {formatDate(new Date(invitedUser.trialTakenDate)).date}
                                        </div>}
                                    </div>
                                    <div className={styles.invitedUserHeaderCredit}>
                                        +
                                        <span className={invitedUser.trialTaken && styles.blueColor} style={{whiteSpace: 'pre', color: '#333333'}}> {referralCredits[1].trialTaken}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={cx(styles.invitedUserBodyStepParentContainer,
                                invitedUser.coursePurchased && styles.fullOpacity)}
                                 style={{borderColor: '#ffffff'}}>
                                <div className={styles.referralStepsCheckBox}>
                                    {invitedUser.coursePurchased ?
                                        <CircleCheckIcon /> :
                                        <CircleCheckGreyIcon />
                                    }
                                </div>
                                <div className={styles.invitedUserBodyStepContainer}>
                                    <div className={styles.invitedUserBodyStepLeftContainer}>
                                        <div className={styles.invitedUserBodyStepLeftUpperText}>
                                            Course purchased
                                        </div>
                                        {invitedUser.coursePurchased &&
                                        <div className={styles.invitedUserBodyStepLeftBottomText}>
                                            Purchased on: {formatDate(new Date(invitedUser.coursePurchasedDate)).date}
                                        </div>}
                                    </div>
                                    <div className={styles.invitedUserHeaderCredit}>
                                        +
                                        <span className={invitedUser.coursePurchased && styles.blueColor} style={{whiteSpace: 'pre', color: '#333333'}}> {referralCredits[1].coursePurchased}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>)) :
                    <div className={styles.noRefer}>
                        <div className={styles.emptyInvitedUsersText}>
                            <a
                                style={{cursor: 'pointer', color: '#00ade6', textDecoration: 'underline'}}
                                href={'/settings/invite'}
                            >
                                Click here{' '}
                            </a>
                            to refer your first friend and earn upto {MAXIMUM_EARNED_CREDIT_LIMIT} credits!
                        </div>
                    </div>
                    }
                    {this.props.userCreditLog.toJS()
                        .filter(credit => ['signUpBonus', 'coursePurchased', 'bankTransfer'].includes(credit.reason))
                        .map((credit) => (
                        <Log
                            {...credit}
                        />
                    ))}
                </div>
                <div className={styles.creditContainer}>
                    <CreditButton
                        title={(userCreditToJS && userCreditToJS.length > 0 ?
                            userCreditToJS[0] ?
                                userCreditToJS[0].credits || 0
                                : 0
                            : 0)}
                        onClick={() => {
                            this.setState({ isRedeemVisible: true })
                        }}
                    />
                    <div className={styles.creditInfoText}>( 1 Credit = 1₹)</div>
                </div>
                <Redeem
                    visible={this.state.isRedeemVisible}
                    credits={get(userCreditToJS, '[0].credits', 0)}
                    close={() => {
                        this.setState({ isRedeemVisible: false })
                    }}
                    onBankTransfer={this.onBankTransfer}
                />
            </div>
        )
    }
}

export default withScale(MyReferrals, {})
