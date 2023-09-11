/* eslint-disable */
import React, { Component } from 'react'
import cx from 'classnames'
import Header from './Header'
import { Link } from 'react-router-dom'
import { LinksClicksGA } from '../../../utils/analytics/ga'
import { Helmet } from 'react-helmet'
import '../styles.scss'
import './Legal.scss'

export default class PrivacyPolicy extends Component {
  componentDidMount() {
    window.location.reload()
    LinksClicksGA('/refund')
    document.querySelector('body').style.background = '#04171f'
    window.scrollTo({
      top: 0
    })
  }

  componentWillUnmount() {
    document.querySelector('body').style.background = '#fff'
  }

  render() {
    return <></>
    return (
      <div>
        <Helmet>
          <link rel="canonical" href="https://www.tekie.in/refund" />
        </Helmet>
        <Header
          logoClickable
          openLogin={() => {
            this.props.history.push('/', {
              login: true
            })
        }} />
                <div className={'landing-page-legal-container'}>
                    <div className={'landing-page-legal-title'}>REFUND POLICY</div>
                    <div className={'landing-page-legal-body'}>
                        <div className={'landing-page-legal-lastUpdated'}>Last Updated: June 22, 2021</div>
                        <div className={'landing-page-legal-textMarginSm'}>
                        If you (student/parent/guardian) do not wish to continue with the classes that you have purchased on (www.tekie.in/www.tekie.us), we/us/company (Kiwhode Learning Private Limited) will refund the fee paid for the unused classes. 
                        To get this refund you will need to submit a request and provide certain details. This FAQ will guide you on these requirements. 
                        In addition, please do read our Terms of Use and Privacy Policy to get a better understanding of your and our rights and obligations. 
                        </div>
                        <div className={'landing-page-legal-title2'}>How to submit a refund request?</div>
                        {/* <div className={'landing-page-legal-title2Underline'}>If you enrolled for our ‘Grade 6-12 with mentors’ program</div> */}
                        <div className={'landing-page-legal-textMarginSm'}>
                        <span>You just have to mail us.</span><br/><br/>
                        Please mail your refund request to our <a className='landing-page-legal-link'  href="mailto:support@tekie.in">support team.</a><br/>
                        The refund process may include a call to you for feedback and/or validation of key information that may be required to process the refund request. 

                        </div>
                        <div className={'landing-page-legal-title2'}>What will be the refund amount that you will get?</div>
                        {/* <div className={'landing-page-legal-title2Underline'}>If you enrolled for our ‘Grade 6-12 with mentors’ program</div> */}
                        <div className={'landing-page-legal-textMarginSm'}>
                        <span>We will refund the fee paid for the unused classes.</span><br/><br/>
                        All refunds shall be calculated on a pro-rata basis (i.e., based on the total number of classes completed in the course as against the total number of classes purchased in the course). Please note that refund will not factor the discounts offered at the time of purchase of the course. 
                        Also, do note that the refund in case of credit cards, debit cards, or EMI transaction will be subject to deduction of down payment, intervention/ any other charges levied by the bank(s), and other appropriate deductions as per applicable law.
                        </div>
                        <div className={'landing-page-legal-title2'}>What will happen once you submit a refund request?</div>
                        {/* <div className={'landing-page-legal-title2Underline'}>If you enrolled for our ‘Grade 6-12 with mentors’ program</div> */}
                        <div className={'landing-page-legal-textMarginSm'}>
                        <span>We will process your refund request in a time bound manner.</span><br/><br/>
                        Our team will verify the refund request. We assure you we will respond to the request within 48 hours from the date of receipt of the request. If there is a delay in the response, then you can write to our <a className='landing-page-legal-link' href="mailto:support@tekie.in">support team</a>.
                        </div>
                        <div className={'landing-page-legal-title2'}>How long will the refund take?</div>
                        {/* <div className={'landing-page-legal-title2Underline'}>If you enrolled for our ‘Grade 6-12 with mentors’ program</div> */}
                        <div className={'landing-page-legal-textMarginSm'}>
                        <span>We will process it as soon as possible.</span><br/><br/>
                        However, it may take up to 5-10 working days for the funds to reflect in your bank account after we have processed your refund request, depending on your financial institution or location. In some cases, it may take longer. Please do note this may not be under our control and is subject to applicable law. 
                        </div>
                        <div className={'landing-page-legal-title2'}>Can you ask for a refund at any time?</div>
                        {/* <div className={'landing-page-legal-title2Underline'}>If you enrolled for our ‘Grade 6-12 with mentors’ program</div> */}
                        <div className={'landing-page-legal-textMarginSm'}>
                        <span>Yes, within a reasonable period.</span><br/><br/>
                        If you have purchased a set of classes from us as a part of a course (Course), then we request that you seek a refund for any unused classes in the Course within 1 (one) year from the start date of the Course. 
                        </div>
                        <div className={'landing-page-legal-title2'}>Can you ask for refund for courses that are purchased as gifts?</div>
                        {/* <div className={'landing-page-legal-title2Underline'}>If you enrolled for our ‘Grade 6-12 with mentors’ program</div> */}
                        <div className={'landing-page-legal-textMarginSm'}>
                        <span>Yes.</span><br/><br/>
                        We will refund the fee paid for any unused classes. However, the amount will be refunded vide the original payment method (i.e., as per the original account/card/UPI/payee information, provided to us).
                        </div>
                        <div className={'landing-page-legal-title2'}>Can your refund request be denied?</div>
                        {/* <div className={'landing-page-legal-title2Underline'}>If you enrolled for our ‘Grade 6-12 with mentors’ program</div> */}
                        <div className={'landing-page-legal-textMarginSm'}>
                        <span>Yes, but only in extremely limited circumstances.</span><br/><br/>
                        We will endeavor to refund the fee paid for unused classes in all cases. However, in certain cases, we may deny a refund request including when:<br/><br/>

                        (i) multiple refunds have been requested for the same Course by the same student.<br/>
                        (ii) there are no unused classes, and the claim of refund is inaccurate or false.<br/>
                        (iii) if we have banned or disabled, the user account of any student due to violation of our Terms of Use and Privacy Policy.<br/>
                        (iv) if we suspect the user/student/person seeking the refund is attempting or undertaking a fraudulent transaction.<br/>
                        <br/>
                        Also, please remember that refund requests and any related restrictions are enforced to the extent permitted by applicable law. 
                        </div>
                        <div className={'landing-page-legal-title2'}>Can we change our refund policy?</div>
                        {/* <div className={'landing-page-legal-title2Underline'}>If you enrolled for our ‘Grade 6-12 with mentors’ program</div> */}
                        <div className={'landing-page-legal-textMarginSm'}>
                        <span>Yes.</span><br/><br/>
                        We may amend, modify, or change this refund policy at any point of time at our sole discretion and any change, update, or modification in the policy shall become effective immediately upon the same being posted, uploaded, or notified on our website (www.tekie.in/www.tekie.us).
                        <br/>
                        Also, please remember that refund requests and any related restrictions are enforced to the extent permitted by applicable law. 
                        </div>
          </div>
                    <div className={'landing-page-legal-footer'}>
            <div className={'landing-page-container'}>
              <div className={'landing-page-madeBy'}>
                MADE BY ENTREPRENEURS
                FOR THE NEXT GENERATION
                ENTREPRENEURS.
              </div>
            </div>
            <div className={'landing-page-socialMediaContainer'}>
              <div className={'landing-page-socialMediaWrapper'}>
                <a className={cx('landing-page-socialMediaIcon', 'landing-page-smFacebook')} href="https://www.facebook.com/tekie.in" target="_blank"></a>
                {/* <div className={cx('landing-page-socialMediaIcon', 'landing-page-smInstagram')}></div> */}
                <a className={cx('landing-page-socialMediaIcon', 'landing-page-smYoutube')} href="https://www.youtube.com/channel/UCCr7GPlTdZRXFEfveeuKcbg" target="_blank"></a>
                <a className={cx('landing-page-socialMediaIcon', 'landing-page-smLinkedin')} href="https://www.linkedin.com/company/tekie/" target="_blank"></a>
                {/* <div className={cx('landing-page-socialMediaIcon', 'landing-page-smTwitter')}></div>
                <div className={cx('landing-page-socialMediaIcon', 'landing-page-smMedium')}></div> */}
              </div>
            </div>
            <div className={cx('landing-page-divider', 'landing-page-displayOnlySmall')}></div>
            <div className={'landing-page-footerLinks'}>
              <Link to="/privacy" className={'landing-page-noneUnderline'}>
                <div className={cx('landing-page-footerLink', 'landing-page-footerLinkPaddingRight')}>Privacy</div>
              </Link>
              <Link to="/terms" className={'landing-page-noneUnderline'}>
                <div className={cx('landing-page-footerLink', 'landing-page-footerLinkPaddingRight', 'landing-page-footerLinkPaddingLeft')}>Terms</div>
              </Link>
              <Link to="/refund" className={'landing-page-noneUnderline'}>
                <div className={cx('landing-page-footerLink', 'landing-page-footerLinkPaddingLeft', 'landing-page-noborder')}>*Refunds</div>
              </Link>
            </div>
            <div className={cx('landing-page-footerLinksUnderlines', 'landing-page-displayOnlySmall')}>
              <div className={'landing-page-footerLinkUnderline'}></div>
              <div className={'landing-page-footerLinkUnderline'}></div>
              <div className={cx('landing-page-footerLinkUnderline', 'landing-page-footerLinkUnderlineNoMargin')}></div>
            </div>
            <div className={cx('landing-page-center')}>
              <Link to="/" onClick={() => {
                LinksClicksGA('Bottom Tekie Logo Click: From /refund')
              }}>
                <div className={'landing-page-tekieLogo'}></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
