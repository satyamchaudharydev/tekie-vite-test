/* eslint-disable */
import React, { Component } from 'react'
import cx from 'classnames'
import Header from './Header'
import { Link } from 'react-router-dom'
import { LinksClicksGA } from '../../../utils/analytics/ga'
import { Helmet } from 'react-helmet'
import './Legal.scss'
import '../styles.scss'

export default class PrivacyPolicy extends Component {
  componentDidMount() {
    window.location.reload()
    LinksClicksGA('/privacy')
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
          <link rel="canonical" href="https://www.tekie.in/privacy" />
        </Helmet>
        <Header
          logoClickable
          openLogin={() => {
            this.props.history.push('/', {
              login: true
            })
          }}
          openEnrollmentForm={() => {
            this.props.history.push('/signup')
          }}
        />
        <div className={'landing-page-legal-container'}>
          <div className={'landing-page-legal-title'}>PRIVACY POLICY</div>
          <div className={'landing-page-legal-body'}>
            <div className={'landing-page-legal-lastUpdated'}>Last Updated: May 07, 2020</div>
            <div className={'landing-page-legal-text'}>
              Thank you for choosing us, we
              respect your privacy concerns on
              our website, www.tekie.in(the
              “Site”) and the services provided
              therein (the “Site”).
              The general purpose of a Privacy
              Policy is to explain what
              information is gathered during a
              visit to the site and how such
              information may be used, and
              how it is protected. If you do not
              consent to any of the terms
              enumerated in this Policy, please
              do not proceed to use the Site.
            </div>
            <div className={'landing-page-legal-text'}>
              Tekie(“Brandname”) is owned and
              operated by KIWHODE
              LEARNING PRIVATE LIMITED
              (the “Company”) to impart online
              education. The company reserves
              the right, at its discretion, to
              change the policy without notice.
              Your continued use of the site or
              Services after the posting of
              changes constitutes your binding
              acceptance of such changes. If
              you choose to discontinue use of
              the Site following a change in the
              policy but take no action with
              respect to your personal
              information and sensitive
              information with us, our use of
              your personal information and
              sensitive information shall remain
              subject to the Policy in effect
              prior to the change. You
              are responsible for periodically
              reviewing this Policy in order to
              be aware of any changes thereto.
            </div>
            <div className={'landing-page-legal-text'}>
              Please read this privacy policy
              (“Policy“) carefully before using
              the Application, Website, its
              services, and products, along with
              the Terms of Use (“ToU“)
              provided on the Application and
              on the Website. Your use of the
              Website, Application, or services
              in connection with Website, or
              registrations with us through any
              mode shall signify your
              acceptance of this Policy and your
              agreement to be legally bound by
              the same.
            </div>
            <div className={'landing-page-legal-text'}>
              We reserve the right to update or
              change our Privacy Policy at any
              time and you should check this
              Privacy Policy periodically. Your
              continued use of the
              Service after we post any
              modifications to the Privacy
              Policy on this page will constitute
              your acknowledgment of the
              modifications and your consent to
              abide and be bound by the
              modified Privacy Policy.
            </div>
            <div className={'landing-page-legal-text'}>
              We will also notify you of any
              material changes either through a
              pop-up notice, e-mail address you
              have provided us or through
              other reasonable means. Any
              such changes are effective
              immediately when we post them,
              and apply to all access to and use
              of the Services thereafter.
            </div>
            <div className={'landing-page-legal-title2'}>What personal information we collect</div>
            <div className={'landing-page-legal-textCenter'}>TEKIE may use your Personal Information collected:</div>
            <div className={'landing-page-legal-textBullet'}>
              To recommend more relevant and
              appropriate courses/products
              based on your learning priorities.
            </div>
            <div className={'landing-page-legal-textBullet'}>
              To contact you about updates /
              new courses and products that will
              be relevant for you or your
              child, via email newsletter,
              targeted email, or social media
              posts.
            </div>
            <div className={'landing-page-legal-textBullet'}>
              Conduct marketing and technical
              research to assist us in improving
              our customer services,
              benchmarking our performance,
              and to help us improve the general
              user experience on our platform.
            </div>
            <div className={'landing-page-legal-textBullet'}>
              By using tekie.in and/or registering
              yourself at tekie.in you authorize
              Tekie (including its
              representatives, affiliates, and its
              business partners) to contact you
              via email or phone call or SMS and
              offer you our services for the
              product you have opted for,
              imparting product knowledge,
              offer promotional offers running
              on tekie.in and offers by its
              business partners and
              associated third parties, for which
              reasons your information may be
              collected in the manner as detailed
              under this Policy. You hereby agree
              that you authorize Tekie to contact
              you for the
              above-mentioned purposes even if
              you have registered yourself under
              DND or DNC or NCPR service(s).
              Your authorization, in this regard,
              shall be valid as long as your
              account is not deactivated by
              either you or us.
            </div>
            <div className={'landing-page-legal-title2'}>Protection of Personal Information</div>
            <div className={'landing-page-legal-text'}>
              Tekie does not sell personal
              information, and personal
              information will never be shared
              with third parties for their
              marketing purposes. Information
              and data collected from you will
              not be disclosed to any other third
              party establishment. Our aim is
              only to use this information to
              serve you better through targeted
              products and course offerings.
            </div>
            <div className={'landing-page-legal-text'}>
              For online payments, your financial
              info (credit card numbers, billing
              address, etc.) will be entered by
              you directly into our payment
              processor’s web page and stored
              by them securely – it will not live in
              our databases.
            </div>
            <div className={'landing-page-legal-text'}>
              However, should we plan to merge/
              sell all or substantially all of our
              business to another business
              entity or similar other transaction
              or be required by that business
              entity, we may transfer or disclose
              your Personal Information and
              Sensitive Information to that
              business entity who may collect,
              use or disclose such information
              for the purposes of evaluating the
              proposed transaction or for
              operating and managing the affairs
              of the acquired business or for
              other purposes identified in this
              Policy.
            </div>
            <div className={'landing-page-legal-text'}>
              Notwithstanding anything
              contained in this Privacy Policy, we
              reserve the right to disclose any
              Personal Information or Sensitive
              Information that may be required
              to be disclosed mandatorily under
              applicable law or where the
              disclosure is necessary to comply
              with any legal obligation or to law
              enforcement authorities or other
              government officials, without prior
              notice or consent of the site / app
              user.
            </div>
            <div className={'landing-page-legal-title2'}>Cookies</div>
            <div className={'landing-page-legal-text'}>
              We may track your preferences
              and activities on the Site.
              “Cookies” are small pieces of data
              sent from a website and stored on
              the user's computer by the user's
              web browser while the user is
              browsing. Cookies are designed to
              be a reliable mechanism for
              websites to remember stateful
              information or to record the user's
              browsing activity. They keep a
              record of your activities on the
              Site making your subsequent
              visits to the site more efficient.
              Cookies may store a variety of
              information, including, the
              number of times that you access a
              site, registration information, and
              the number of times that you view
              a particular page or other items on
              the site. The use of cookies is a
              common practice adopted by most
              major sites to better serve their
              clients. Most browsers are
              designed to accept cookies, but
              they can be easily modified to
              block cookies.
            </div>
            <div className={'landing-page-legal-text'}>
              By continuing the use of the Site,
              you are agreeing to our use of
              cookies. If you do not agree with
              our use of cookies, you can block
              them in your browser setting, but
              this may result in the loss of some
              functions on the Site.
            </div>
            <div className={'landing-page-legal-title2'}>HOW WE RETAIN YOUR DATA AND INFORMATION</div>
            <div className={'landing-page-legal-text'}>
              We will retain your Personal and
              Sensitive Information only as long
              as it is reasonably required or
              otherwise permitted or required
              by applicable law or regulatory
              requirements. We may also retain
              your Personal and Sensitive
              Information so long as it is
              necessary to fulfill the
              purposes for which it was collected
              (including for purposes of meeting
              any legal, administrative,
              accounting, or other reporting
              requirements). Your Personal and
              Sensitive Information is
              safeguarded against inappropriate
              access and disclosure, as per this
              Privacy Policy.
            </div>
            <div className={'landing-page-legal-text'}>
              We also maintain appropriate and
              adequate administrative, technical, and physical safeguards designed to protect your Personal and Sensitive Information against
              accidental, unlawful or unauthorized destruction, loss, alteration, access, disclosure, or
              use.
            </div>
            <div className={'landing-page-legal-title2'}>
              SUBSCRIPTION /<br className={'landing-page-legal-displayOnlySmall'} />
              UNSUBSCRIPTION <br className={'landing-page-legal-displayOnlySmall'} />
              FROM UPDATES
            </div>
            <div className={'landing-page-legal-text'}>
              The Site provides an option for all
              the users to subscribe or
              unsubscribe from receiving any
              promotional or marketing
              communications from us. If you do
              not wish to receive any promotional
              or marketing communications from
              us, you can contact us at to inform
              us of this preference.
            </div>
            <div className={'landing-page-legal-title2'}>
              SECURITY
            </div>
            <div className={'landing-page-legal-text'}>
              We venture to keep your Personal
              and Sensitive information secure,
              up-to-date, accurate in the
              best possible manner as it may be
              necessary for the purpose for
              which it was collected. We
              understand the value and the
              importance you attach to your
              Personal and Sensitive Information
              given to us and therefore we
              have:-
              (i) taken all reasonable measures
              and precautions to keep such
              information safe and secure and to
              prevent any unauthorized access
              to or misuse of the same
              (ii) enable you to review and edit
              the same.
            </div>
            <div className={'landing-page-legal-text'}>
              However, we shall not be liable to
              any user for any loss, damage
              (whether direct, indirect,
              consequential or incidental) or
              harm caused to the user due to the
              unauthorized access or misuse of
              the Personal or Sensitive
              Information by any third party.
            </div>
            <div className={'landing-page-legal-title2'}>
              CONTACT INFORMATION
            </div>
            <div className={'landing-page-legal-textSm'} style={{ alignSelf: 'flex-start' }}>
              Email ID: <a className={'landing-page-legal-link'} href="mailto:hello@tekie.in">hello@tekie.in</a>
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
                LinksClicksGA('Bottom Tekie Logo Click: From /privacy')
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
