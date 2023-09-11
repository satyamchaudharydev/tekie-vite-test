import React, { Component } from 'react'
import { ReactComponent as InviteIcon } from '../../assets/inviteIcon.svg'
import { ReactComponent as InviteCouponBox } from '../../assets/inviteCouponBox.svg'
import { ReactComponent as CopyIcon } from '../../assets/copyIcon.svg'
import { ReactComponent as CircleCheckIcon } from '../../assets/circleCheckIcon.svg'
import styles from './Invite.module.scss'
import { NextButton } from "../../components/Buttons/NextButton";
import fetchStudentProfile from "../../queries/fetchStudentProfile";
import { getToasterBasedOnType, Toaster } from "../../components/Toaster";
import ShareOverlay from "./component/ShareOverlay/ShareOverlay";
import { motion } from 'framer-motion'
import { GIFT_VOUCHER_AMOUNT, MINIMUM_BANK_LIMIT, referralCredits } from "../../config";
import {
    EmailShareButton,
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    EmailIcon,
    FacebookIcon,
    LinkedinIcon,
    TwitterIcon,
    WhatsappIcon
} from 'react-share';
import fetchUserInvitesMeta from '../../queries/fetchUserInvitesMeta'
import withScale from '../../utils/withScale'

const codeCopiedToast = {
    type: 'success',
    message: 'Invite URL copied to clipboard',
    toastId: 'copy-invite-code'
}

class Invite extends Component {
    state = {
        visibleShareOverlay: false,
    }

    async componentDidMount() {
        if (!this.props.accountProfileSuccess) {
            await fetchStudentProfile(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id)
        }
        fetchUserInvitesMeta(this.props.loggedInUser.get('id')).call()
        this.setState({
            isLoading: false
        })
    }

    onShareButtonClick = () => {
        this.setState({ visibleShareOverlay: true })
    }

    copyCodeToClipboard = () => {
        const el = this.textArea
        el.select()
        document.execCommand("copy")
        getToasterBasedOnType(codeCopiedToast)
    }

    closeShareOverlay = () => {
        this.setState({ visibleShareOverlay: false })
    }

    render() {
        const { profile } = this.props
        const inviteCode = profile && profile.toJS() && profile.toJS().inviteCode
        const title = `Check out the World's First Educational Series on Programming for kids(age 10+) by Tekie. Get an exclusive FREE Trial Live Coding Class & unlock an EXTRA ₹${GIFT_VOUCHER_AMOUNT} off on the course purchase using my unique referral link: `;
        const shareUrl = inviteCode && `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/signup?referralCode=${inviteCode}`;
        const breakPoint = 900
        const isDesktop = window.innerWidth > breakPoint
        return (
            <div className={styles.container}>
                <Toaster />
                <div className={styles.bodyContainer}>
                    <div className={styles.inviteIcon}>
                        <InviteIcon />
                    </div>
                    <div className={styles.referTitle}>
                        Refer a friend and earn!
                    </div>
                    <div className={styles.inviteCouponContainer}>
                        <div className={styles.inviteCouponBox}>
                            <InviteCouponBox />
                        </div>
                        <textarea
                            className={styles.referralCode}
                            ref={(textarea) => this.textArea = textarea}
                            value={inviteCode && `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/signup?referralCode=${inviteCode}`}
                        />
                        <motion.div
                            className={styles.copyIcon}
                            onClick={this.copyCodeToClipboard}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <CopyIcon />
                        </motion.div>
                    </div>
                    <div className={styles.shareButtonContainer}>
                        {/*<div className={styles.shareButton}
                             onClick={this.onShareButtonClick}
                        >
                            <NextButton
                                title='Share Now!'
                            />
                        </div>*/}
                        <WhatsappShareButton
                            url={shareUrl}
                            title={title}
                            className={styles.react_share_shareButton}
                        >
                            <div className={styles.shareButtonIcon}><WhatsappIcon size={'100%'} round={true} /></div>
                        </WhatsappShareButton>

                        <FacebookShareButton
                            url={shareUrl}
                            quote={title}
                            className={styles.react_share_shareButton}
                        >
                            <div className={styles.shareButtonIcon}><FacebookIcon size={'100%'} round={true} /></div>
                        </FacebookShareButton>

                        <TwitterShareButton
                            url={shareUrl}
                            title={title}
                            via={'Tekie'}
                            className={styles.react_share_shareButton}
                        >
                            <div className={styles.shareButtonIcon}><TwitterIcon size={'100%'} round={true} /></div>
                        </TwitterShareButton>

                        <LinkedinShareButton
                            summary={title}
                            url={shareUrl}
                            source={shareUrl}
                            title={title}
                            className={styles.react_share_shareButton}
                        >
                            <div className={styles.shareButtonIcon}><LinkedinIcon size={'100%'} round={true} /></div>
                        </LinkedinShareButton>

                        <EmailShareButton
                            subject={`Tekie: Claim your free trial session and a ₹${GIFT_VOUCHER_AMOUNT} gift voucher`}
                            url={shareUrl}
                            body={title}
                            className={styles.react_share_shareButton}
                        >
                            <div className={styles.shareButtonIcon}><EmailIcon size={'100%'} round={true} /></div>
                        </EmailShareButton>

                    </div>

                    {isDesktop ? (
                        <>
                            <div className={styles.referralStepsTitleContainer}>
                                <div className={styles.referralStepsTitle}>
                                    Friend Signs up
                                </div>
                                <div className={styles.referralStepsTitle}>
                                    Gets Verified
                                </div>
                                <div className={styles.referralStepsTitle}>
                                    Attends Trial Session
                                </div>
                                <div className={styles.referralStepsTitle}>
                                    Course Purchased!
                                </div>
                            </div>
                            <div className={styles.referralStepsCheckBoxContainer}>
                                <div className={styles.referralStepsCheckBox}>
                                    <CircleCheckIcon />
                                </div>
                                <div className={styles.referralStepsCheckBox}>
                                    <CircleCheckIcon />
                                </div>
                                <div className={styles.referralStepsCheckBox}>
                                    <CircleCheckIcon />
                                </div>
                                <div className={styles.referralStepsCheckBox}>
                                    <CircleCheckIcon />
                                </div>
                            </div>
                            <div className={styles.referralStepsDescContainer}>
                                <div className={styles.referralStepsDesc}>
                                    <span style={{ whiteSpace: 'pre' }}>- </span>
                                    <span>He/She gets ₹{GIFT_VOUCHER_AMOUNT}/- off
                                        on our course as a gift when
                                        signing up with this link.
                                    </span>
                                </div>
                                <div className={styles.referralStepsDesc}>
                                    <span>- Earn {referralCredits[1].registrationVerified} credits</span>
                                </div>
                                <div className={styles.referralStepsDesc}>
                                    <span>- Earn {referralCredits[1].trialTaken} more credits</span>
                                </div>
                                <div className={styles.referralStepsDesc}>
                                    <span>- Earn {referralCredits[1].coursePurchased}  more credits</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.referralWrapperM}>
                            <div className={styles.referralContainerM}>
                                <div className={styles.stepsRowM}>
                                    <div className={styles.stepsM}>
                                        <div className={styles.referralStepsCheckBox}>
                                            <CircleCheckIcon />
                                        </div>
                                        <div className={styles.stepLineM}></div>
                                    </div>
                                    <div>
                                        <div className={styles.referralStepsTitleM}>
                                            Friend Signs up
                                        </div>
                                        <div className={styles.referralStepsDescM}>
                                            He/She gets ₹{GIFT_VOUCHER_AMOUNT}/- off
                                            on our course as a gift when
                                            signing up with this link.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.referralContainerM}>
                                <div className={styles.stepsRowM}>
                                    <div className={styles.stepsM}>
                                        <div className={styles.referralStepsCheckBox}>
                                            <CircleCheckIcon />
                                        </div>
                                        <div className={styles.stepLineM}></div>
                                    </div>
                                    <div>
                                        <div className={styles.referralStepsTitleM}>
                                            Gets Verified
                                        </div>
                                        <div className={styles.referralStepsDescM}>
                                            Earn {referralCredits[1].registrationVerified} credits
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.referralContainerM}>
                                <div className={styles.stepsRowM}>
                                    <div className={styles.stepsM}>
                                        <div className={styles.referralStepsCheckBox}>
                                            <CircleCheckIcon />
                                        </div>
                                        <div className={styles.stepLineM}></div>
                                    </div>
                                    <div>
                                        <div className={styles.referralStepsTitleM}>
                                            Attends Trial Session
                                        </div>
                                        <div className={styles.referralStepsDescM}>
                                            <span>Earn {referralCredits[1].trialTaken} more credits</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.referralContainerM}>
                                <div className={styles.stepsRowM}>
                                    <div className={styles.stepsM}>
                                        <div className={styles.referralStepsCheckBox}>
                                            <CircleCheckIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.referralStepsTitleM}>
                                            Course Purchased!
                                        </div>
                                        <div className={styles.referralStepsDescM}>
                                            Earn {referralCredits[1].coursePurchased}  more credits
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}



                    <div className={styles.referralStepsCriteriaWrapperM}>
                        <div className={styles.referralStepsCriteriaContainer}>
                            <div className={styles.referralStepsCriteriaTitle}>
                                Gift Voucher Eligibilty Criteria:
                            </div>
                            <div className={styles.referralStepsCriteriaPoints}>
                                1. Can only be applied for a maximum of 10 newly registered friends.
                            </div>
                            <div className={styles.referralStepsCriteriaPoints}>
                                2. One gift voucher can only be redeemed by one person only once.
                            </div>
                            <div className={styles.referralStepsCriteriaPoints}>
                                3. You can redeem credits either on our courses or get it transferred directly into your bank.
                            </div>
                            <div className={styles.referralStepsCriteriaPoints}>
                                4. The minimum credits required for the bank transfer is {MINIMUM_BANK_LIMIT} (1 Credit = 1₹).
                            </div>
                            <div className={styles.referralStepsCriteriaPoints}>
                                <span style={{ whiteSpace: 'pre' }}>5. To view your credits balance, </span>
                                <a
                                    style={{ cursor: 'pointer', color: '#00ade6', textDecoration: 'underline' }}
                                    href={'/settings/myReferrals'}
                                >
                                    click here
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
                <div className={styles.refferalCount}>
                    {this.props.userInvitesCount} / 10 Referrals Used
                </div>
                {/*<ShareOverlay
                    visible={this.state.visibleShareOverlay}
                    closeOverlay={this.closeShareOverlay}
                    shareUrl={inviteCode && `${import.meta.env.REACT_APP_TEKIE_WEB_URL}/signup?referralCode=${inviteCode}`}
                    title={'This has been shared from Tekie'}
                />*/}
            </div>
        )
    }
}

export default withScale(Invite, {})
