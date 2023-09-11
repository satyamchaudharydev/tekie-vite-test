import React, { Component } from 'react'
import Lottie from "react-lottie";
import styles from './Invite.module.scss'
import InviteLottie from '../../assets/animations/invite.json'
import { ReactComponent as CircleCheckIcon } from '../../assets/circleCheckIcon.svg'
import {GIFT_VOUCHER_AMOUNT, MINIMUM_BANK_LIMIT, referralCredits} from "../../config";
import withScale from '../../utils/withScale'
import cx from 'classnames'
import { Link } from 'react-router-dom';

class InviteLoggedOut extends Component {
  // componentDidMount() {
  //   this.confettiOption.
  // }
  confettiOption = {
    loop: false,
    autoplay: true,
    animationData: InviteLottie,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
  }

  render() {
    const breakPoint = 900
    const isDesktop = window.innerWidth > breakPoint
    return (
      <div className={styles.loggedOutContainer}>
        <div className={styles.header}>
          <Link to="/">
            <div className={styles.logo}></div>
          </Link>
        </div>
        <div className={styles.mainRow}>
          <div className={styles.imageContainer}>
            <div className={styles.imageContainerAbsolute} style={{ alignItems: 'flex-end' }}>
              <Lottie
                options={this.confettiOption}
                style={{position:'absolute'}}
              />
            </div>
            <div className={styles.imageContainerAbsolute}>
              <div className={styles.imageDrop}>
              </div>
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.title}>Refer & Earn!</div>
            <div className={isDesktop ? styles.referralStepsTitle : styles.referralStepsTitleM} style={{ width: 'unset', marginLeft: 0 }}>Invite your friends and get cash rewards!</div>
            <Link to="/login?redirect=/settings/invite" style={{ textDecoration: 'none' }}>
              <div className={styles.inviteButton}>Invite Now!</div>
            </Link>
          </div>
        </div>
        <div className={styles.cardLogout}>
          <div className={styles.titleH2}>How does it work?</div>
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
                  <div className={cx(styles.referralStepsDescContainer, styles.refferalStepsDescContainerLoggedOut)}>
                      <div className={styles.referralStepsDesc}>
                          <span style={{whiteSpace: 'pre'}}>- </span>
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
          <div className={styles.titleH2}>Referral Rules</div>
          <div className={styles.referralStepsCriteriaWrapperM}>
            <div className={cx(styles.referralStepsCriteriaContainer, styles.referralStepsCriteriaContainerL)}>
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
                    <span style={{whiteSpace: 'pre'}}>5. To view your credits balance, </span>
                    <Link
                        style={{cursor: 'pointer', color: '#00ade6', textDecoration: 'underline'}}
                        to={'/signup?redirect=/settings/myReferrals'}
                    >
                        click here
                    </Link>
                </div>
            </div>
        </div>
        </div>
      </div>
    )
  }
}

export default withScale(InviteLoggedOut, {})
