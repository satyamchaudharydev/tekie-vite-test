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
    LinksClicksGA('/terms')
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
          <link rel="canonical" href="https://www.tekie.in/terms" />
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
                    <div className={'landing-page-legal-title'}>Terms of use</div>
                    <div className={'landing-page-legal-body'}>
                        <div className={'landing-page-legal-lastUpdated'}>Last Updated: May 07, 2020</div>
                        <div className={'landing-page-legal-text'}>
              Welcome to tekie.in’s Terms of Use! We are truly delighted to have you aboard. Thank you for choosing to use our services.
            </div>
                        <div className={'landing-page-legal-text'}>
              Please read these terms of use carefully before using this website. By using this website, you
              signify your consent to these terms of use. IF YOU DO NOT AGREE TO THESE TERMS OF USE,
              PLEASE DO NOT USE THE WEBSITE.
            </div>
                        <div className={'landing-page-legal-text'}>
              We have listed below important legal terms that apply to anyone who visits our website or uses
              our services. These terms are essential to protect both you and us and to make our services
              possible and more delightful for everyone. We understand that legal terms can be grilling to read,
              and we’ve tried to make the experience more pleasant. If you have any suggestions on how we can
              improve them, you are more than welcome to contact us at hello@tekie.in.
            </div>
                        <div className={'landing-page-legal-text'}>
              Your access to and use of this website, as well as all related websites operated by tekie.in( “site”)
              is subject to the following terms and conditions (“Terms of Use”) and all applicable laws. By
              accessing and browsing the site, you accept, without limitation or qualification, the Terms of Use
              and acknowledge that any other agreements between you and the site are superseded and of no
              force or effect:
            </div>
                        <div className={'landing-page-legal-text'}>
              1. You agree that the site itself, as well as all content, videos, learning materials, products,
              services and/or other materials, made available on the site by us or other third parties, as well as
              the look and feel of all of the foregoing, (collectively referred to as the “content”) are maintained
              for your personal use and information by Tekie, (“brandname”) and are the property of the
              company and/or its third party providers. You agree that such company content shall include all
              proprietary videos, HTML/CSS, javascript, graphics, voice, and sound recordings, artwork, photos,
              documents, and text as well as all other materials included in the site, excluding only the materials
              you provide. Subject to your compliance with these Terms of Use, the company hereby grants you
              a limited license, which is non-exclusive, non-transferable, and non-sublicensable, to access, view,
              and use the site solely for your personal purposes. No company content may be copied,
              reproduced, republished, recorded, uploaded, posted, transmitted, distributed, used for public or
              commercial purposes, or downloaded in any way unless written permission is expressly granted
              by the company. Modification of the content or use of the content for any other purpose is a
              violation of the copyright and other proprietary rights of the company, as well as other authors
              who created the materials, and may be subject to monetary damages and penalties. You may not
              distribute, modify, transmit or use the content of the site or any content, including any and all
              software, tools, graphics and/or sound files, for public or commercial purposes without the
              express written permission of the company.
            </div>
                        <div className={'landing-page-legal-text'}>
              2. All content, such as text, data, graphics files, videos and sound files, and other materials
              contained in the site, are the property of the company and/or a supplier to the company. No such
              materials may be used except as provided in these Terms of Use.
            </div>
                        <div className={'landing-page-legal-text'}>
              3. All trade names, trademarks, and images and biographical information of people used in the
              company content and contained in the site, including without limitation the name are either the
              property of, or used with permission by, the company. The use of content by you is strictly
              prohibited unless specifically permitted by these Terms of Use. Any unauthorized use of content
              may violate the copyright, trademark, and other proprietary rights of the company and/or third
              parties, as well as the laws of privacy and publicity, and other regulations and statutes. Nothing
              contained in this Agreement or in the site shall be construed as granting, by implication or
              otherwise, any license or right to use any trademark or other proprietary information without the
              express written consent of the company or third party owner. The company respects the
              copyright, trademark and all other intellectual property rights of others. The company has the
              right, but has no obligation, to remove content and accounts containing materials that it deems, in
              its sole discretion, to be unlawful, offensive, threatening, libelous, defamatory, pornographic,
              obscene or otherwise objectionable or violates any party’s intellectual property or these Terms of
              Use. If you believe that your intellectual property rights are being violated and/or that any work
              belonging to you has been reproduced on the site or in any content in any way, you may notify
              company at hello@tekie.in. Please provide your name and contact information, the nature of your
              work and how it is being violated, all relevant copyright and/or trademark registration
              information, the location/URL of the violation, and any other information you believe is relevant.
            </div>
                        <div className={'landing-page-legal-text'}>
              4. While the company uses reasonable efforts to include accurate and up-to-date information in
              the site, the Company makes no warranties or representations as to its accuracy. The company
              assumes no liability or responsibility for any errors or omissions in the content of the site.
            </div>
                        <div className={'landing-page-legal-text'}>
              5. When you register with the company and/or this site, you expressly consent to receive any
              notices, announcements, agreements, disclosures, reports, documents, communications
              concerning new products or services, or other records or correspondence from the company. You
              consent to receive notices electronically by way of transmitting the notice to you by email.
            </div>
                        <div className={'landing-page-legal-text'}>
              6. If you send comments or suggestions about the site to the company, including, but not limited
              to, notes, text, drawings, images, designs or computer programs, such submissions shall become,
              and shall remain, the sole property of the company. No submission shall be subject to any
              obligation of confidence on the part of the company. The company shall exclusively own all rights
              to (including intellectual property rights thereto), and shall be entitled to unrestricted use,
              publication, and dissemination as to all such submissions for any purpose, commercial or
              otherwise without any acknowledgment or compensation to you.
            </div>
                        <div className={'landing-page-legal-text'}>
              7. The company shall use commercially reasonable efforts to restrict unauthorized access to our
              data and files. However no system whether or not password protected can be entirely
              impenetrable. You acknowledge that it may be possible for an unauthorized third party to access,
              view, copy, modify, or distribute the data and files you store using the site. Use of the site is
              completely at your own risk.
            </div>
                        <div className={'landing-page-legal-text'}>
              8. The company will not intentionally disclose any personally identifying information about you to
              third parties, except where the company, in good faith, believes such disclosure is necessary to
              comply with the law or enforce these Terms of Use. By using the site, you signify your acceptance
              of the company’s privacy policy. If you do not agree with this privacy policy, in whole or part,
              please do not use this Site.
            </div>
                        <div className={'landing-page-legal-text'}>
              9. Neither the company nor any other party involved in creating, producing, or maintaining the
              site and/or any content on the site shall be liable under any circumstances for any direct,
              incidental, consequential, indirect or punitive damages arising out of your access to or use of this
              site. Without limiting the foregoing, all content on the site is provided “as is” without warranty of
              any kind, either expressed or implied, including, but not limited to, the implied warranties of
              merchantability or fitness for a particular purpose. The company does not warrant or make any
              representations regarding the use of the materials in the site, the results of the use of such
              materials, the suitability of such materials for any user’s needs or the likelihood that their use will
              meet any user’s expectations, or their correctness, accuracy, reliability, or correction. The
              company does not warrant that use of the materials will be uninterrupted or error free, that
              defects will be corrected, or that this site, the content, and/or the materials available on this site
              are free from bugs or viruses or other harmful components. The company shall not be responsible
              for any performance or service problems caused by any third party website or third party service
              provider(including, for example, your web service provider service, payment services, your
              software and/or any updates or upgrades to that software). Please note that the applicable
              jurisdiction may not allow the exclusion of implied warranties. Some of the above exclusions may
              thus not apply to you.
            </div>
                        <div className={'landing-page-legal-text'}>
              10. In no event shall the company be liable for any special, incidental, indirect, punitive, reliance
              or consequential damages, whether foreseeable or not, including, but not limited to, damage or
              loss of property, equipment, information or data, loss of profits, revenue or goodwill, cost of
              capital, cost of repalcement services, or claims for service interruptions or transmission
              problems, occasioned by any defect in the site, the content, and/or related materials, the inability
              to use services provided hereunder or any other cause whatsoever with respect thereto,
              regardless of theory of liability. This limitation will apply even if the company has been advised or
              is aware of the possibility of such damages.
            </div>
                        <div className={'landing-page-legal-text'}>
              11. You agree to indemnify and hold the company and each of its directors, officers employees,
              and agents, harmless from any and all liabilities, claims, damages and expenses, including
              reasonable attorney’s fees, arising out of or relating to (i) your breach of this Agreement, (ii) any
              violation by you of law or the rights of any third party, (iii) any materials, information, works and/
              or other content of whatever nature or media that you post or share on or through the site, (iv)
              your use of the site or any services that the company may provide via the site, and (v) your
              conduct in connection with the site or the services or with other users of the site or the services.
              The company reserves the right to assume the exclusive defense of any claim for which we are
              entitled to indemnification under this section. In such an event, you shall provide the company
              with such cooperation as is reasonably requested by the Company.
            </div>
                        <div className={'landing-page-legal-text'}>
              12. The provisions of these Terms of Use are for the benefit of the company, its subsidiaries,
              affiliates and its third party content providers and licensors, and each shall have the right to
              assert and enforce such provisions directly or on its own behalf.
            </div>
                        <div className={'landing-page-legal-text'}>
              13. This agreement shall be governed by and construed in accordance with the applicable laws of
              India, without giving effect to any principles of conflicts of law. If any provision of this agreement
              shall be unlawful, void, or for any reason unenforceable, then that provision shall be deemed
              severable from this agreement and shall not affect the validity and enforceability of any
              remaining provisions.
            </div>
                        <div className={'landing-page-legal-text'}>
              14. These Terms of Use may be revised from time to time by updating this posting. You are bound
              by any such revisions and should therefore periodically visit this page to review the then current
              Terms of Use to which you are bound.
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
                <a className={cx('landing-page-socialMediaIcon', 'landing-page-smFacebook')} href="https://www.facebook.com/Tekie.in/" target="_blank"></a>
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
                LinksClicksGA('Bottom Tekie Logo Click: From /terms')
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
