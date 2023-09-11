import React, { Component, useEffect, useRef } from 'react'
import cx from 'classnames'
import { animate } from 'framer-motion'
import { ImageBackground } from '../../../image'
import { enrollNowGA } from '../../../utils/analytics/ga'
import Testimonials from './Testimonials'
import { TextCarousel } from './TextCarousel'
import isFeatureEnabled from '../../../utils/isFeatureEnabled'
import './Hero.scss'
import { Link } from 'react-router-dom'

const countries = ['3+ Countries', 'USA', 'UAE', 'INDIA'];
const boards = ['6+ Boards', 'IB', 'State board', 'ICSE', 'CBSE', 'British', 'BSME'];

function Counter({ from, to, className }) {
  const nodeRef = useRef();

  useEffect(() => {
    const node = nodeRef.current;

    const controls = animate(from, to, {
      duration: 2.5,
      delay: .3,
      onUpdate(value) {
        node.textContent = Number(value.toFixed(0)).toLocaleString();
      }
    });

    return () => controls.stop();
  }, [from, to]);

  return (
    <>
      <div className={cx(className)} ref={nodeRef} /><span>+ Students</span>
    </>
  )
}

const HeroHeader = ({ mailId, setMailId, signUp }) => (
  <div className={cx('b2b-landing-page-hero-body', 'hero-body-scroll')}>
    <h1 className={cx('b2b-landing-page-hero-title', 'sr-200-15-600')}>
      Programming a <br />
      <span>Better Future</span>
    </h1>
    <h2 className={cx('b2b-landing-page-hero-info', 'sr-250-15-600')}>
      Integrated Coding solutions for schools
    </h2>
    <div className='b2b-landing-page-hero-input-container sr-300-5-600'>
      <div className={cx('b2b-landing-page-hero-input', 'sr-250-15-600')}>
        <input placeholder='Enter your email address' value={mailId} onChange={(e) => {
          setMailId(e.target.value)
        }}>
        </input>
        <span className={cx('b2b-landing-page-hero-input-icon')}></span>
      </div>
    </div>
    <div className='b2b-landing-page-hero-button-container sr-300-5-600'>
      <Link className={cx('b2b-landing-page-getStarted-button')}
        onClick={() => signUp(mailId)}
        to={{
          pathname: `/signup-school`,
          state: {
            mailId,
          },
        }}
      >
        <span>Get Started</span>
      </Link>
    </div>
  </div>
)
export default class Hero extends Component {
  state = {
    mailId: '',
    HeroSlides: [
      {
        id: 0,
        content: 'Text-based coding curriculum',
        thumbnailPng: require('../../../assets/b2bLandingPage/HeroSection/TextCoding.png'),
        thumbnailWebp: require('../../../assets/b2bLandingPage/HeroSection/TextCoding.webp'),
        customRender: (
          <div className='b2b-landing-page-hero-textBasedAnimation'>
            <div
              className={'b2b-landing-page-journey-toolbar'}
            >
                <div /> <div /> <div />
            </div>
            <div className="b2b-landing-page-hero-codeAnim-container">
              <div className='b2b-landing-page-hero-code-container'>
                <code>
                  <p className="b2b-landing-page-hero-codeAnim-line1">
                    <span className='b2b-landing-page-hero-codeAnim-lineNumber'>1&nbsp;</span>
                    <span className='b2b-landing-page-hero-cy-keyword'>for</span>
                    <span>&nbsp;i</span>
                    <span className='b2b-landing-page-hero-cy-keyword'>&nbsp;in</span>
                    <span className='b2b-landing-page-hero-cy-function'>&nbsp;range</span>
                    <span>(</span>
                    <span className="b2b-landing-page-hero-cy-numeric">9</span>
                    <span>)</span>
                    <span>:</span>
                  </p>
                  <br />
                  <p className='b2b-landing-page-hero-codeAnim_line2'>
                    <span className='b2b-landing-page-hero-codeAnim-lineNumber'>2</span>
                    <span className="b2b-landing-page-hero-codeAnim_line2-marginLeft">
                      <span className="b2b-landing-page-hero-cy-keyword">if</span>
                      <span>&nbsp;i</span>
                      <span className="b2b-landing-page-hero-cy-keyword">&nbsp;==</span>
                      <span className="b2b-landing-page-hero-cy-numeric">&nbsp;0</span>
                      <span>:</span>
                    </span>
                  </p>
                  <br />
                  <p class="b2b-landing-page-hero-codeAnim_line3">
                    <span className='b2b-landing-page-hero-codeAnim-lineNumber'>3</span>
                    <span className='b2b-landing-page-hero-codeAnim_line3-marginLeft'>
                      <span className="b2b-landing-page-hero-cy-keyword">print</span>(
                      <span className="b2b-landing-page-hero-cy-string">'*'</span>
                      <span className="b2b-landing-page-hero-cy-keyword">
                        &nbsp;* <span className="b2b-landing-page-hero-cy-numeric">11</span>
                      </span>
                      )
                    </span>
                  </p>
                  <br />
                  <p className="b2b-landing-page-hero-codeAnim_line4">
                    <span className='b2b-landing-page-hero-codeAnim-lineNumber'>4</span>
                    <span className="b2b-landing-page-hero-codeAnim_line4-marginLeft">
                      <span className="b2b-landing-page-hero-cy-keyword">else</span>
                      :
                    </span>
                  </p>
                  <br />
                  <p className="b2b-landing-page-hero-codeAnim_line5">
                    <span className='b2b-landing-page-hero-codeAnim-lineNumber'>5</span>
                    <span className='b2b-landing-page-hero-codeAnim_line5-marginLeft'>
                      <span className="b2b-landing-page-hero-cy-keyword">print</span>(
                      <span className="b2b-landing-page-hero-cy-string">' '</span>
                      <span className="b2b-landing-page-hero-cy-keyword">
                        *<span className="b2b-landing-page-hero-cy-numeric">5</span>
                      </span>
                      <span className="b2b-landing-page-hero-cy-keyword b2b-landing-page-hero-cy-padding">+</span>
                      <span className="b2b-landing-page-hero-cy-string">'*'</span>
                      <span className="b2b-landing-page-hero-cy-keyword b2b-landing-page-hero-cy-padding">+</span>
                      <span className="b2b-landing-page-hero-cy-string">' '</span>
                      <span className="b2b-landing-page-hero-cy-keyword">
                        *<span className="b2b-landing-page-hero-cy-numeric">5</span>
                      </span>
                      )
                    </span>
                  </p>
                </code>
              </div>
              <div id='b2b-landing-page-code-output-container'>
                <button
                  onClick={() => {
                    const el = document.getElementById('b2b-landing-page-code-output-container')
                    el.classList.add('b2b-landing-page-code-output-visible')
                  }}
                  className='b2b-landing-page-code-executeBtn'
                />
              </div>
            </div>
          </div>
        )
      },
      {
        id: 1,
        content: 'Expert Mentors',
        thumbnailPng: require('../../../assets/b2bLandingPage/HeroSection/ExpertMentors.gif'),
        thumbnailWebp: require('../../../assets/b2bLandingPage/HeroSection/ExpertMentors.gif'),
        customRender: (
          <div className={'b2b-landing-page-journey-toolbar'}>
            <div /> <div /> <div />
          </div>
        )
      },
      {
        id: 2,
        content: 'Comprehensive Learning Management System',
        thumbnailPng: require('../../../assets/b2bLandingPage/HeroSection/LMS.png'),
        thumbnailWebp: require('../../../assets/b2bLandingPage/HeroSection/LMS.webp'),
        customRender: (
          <div className='b2b-landing-page-hero-lms-container'>
            <div className='b2b-landing-page-hero-lms-icon-container'>
              <ImageBackground
                src={require('../../../assets/b2bLandingPage/HeroSection/LMSPerson.webp')}
                srcLegacy={require('../../../assets/b2bLandingPage/HeroSection/LMSPerson.png')}
                className='b2b-landing-page-hero-lms-featureIcon'
              />
              <ImageBackground
                src={require('../../../assets/b2bLandingPage/HeroSection/LMSAnalytics.webp')}
                srcLegacy={require('../../../assets/b2bLandingPage/HeroSection/LMSAnalytics.png')}
                className='b2b-landing-page-hero-lms-featureIcon'
              />
              <ImageBackground
                src={require('../../../assets/b2bLandingPage/HeroSection/LMSCalendar.webp')}
                srcLegacy={require('../../../assets/b2bLandingPage/HeroSection/LMSCalendar.png')}
                className='b2b-landing-page-hero-lms-featureIcon'
              />
              <ImageBackground
                src={require('../../../assets/b2bLandingPage/HeroSection/LMSReports.webp')}
                srcLegacy={require('../../../assets/b2bLandingPage/HeroSection/LMSReports.png')}
                className='b2b-landing-page-hero-lms-featureIcon'
              />
              <ImageBackground
                src={require('../../../assets/b2bLandingPage/HeroSection/LMSOverlay.webp')}
                srcLegacy={require('../../../assets/b2bLandingPage/HeroSection/LMSOverlay.png')}
                className='b2b-landing-page-hero-lms-overlayAnimation'
              />
            </div>
          </div>
        )
      },
    ]
  }

  renderTekieStats = () => {
    return (
     <div className={cx('b2b-landing-page-hero-teamFromContainer', 'b2b-landing-page-hero-noBackground', 'b2b-landing-page-hero-noMobile')}>
        <div className={cx('b2b-landing-page-hero-flexSingleRow')}>
          <div className={cx('b2b-landing-page-hero-row','b2b-landing-page-hero-row-justify')}>
            <div className={cx('b2b-landing-page-hero-counter-container')}>
              <span className={cx('b2b-landing-page-hero-checkmark-icon')}></span>
              <Counter from={0} to={20000} />
            </div>
            <div className={cx('b2b-landing-page-hero-common-container')}>
              <span className={cx('b2b-landing-page-hero-checkmark-icon')}></span>
              <TextCarousel
                animationSpeedInSec={1}
                contentArray={boards}
                className="b2b-landing-page-showcase-text"
                styles={{
                  letterSpacing: 0,
                  userSelect: "none"
                }}
              />
            </div>
            <div className={cx('b2b-landing-page-hero-common-container')}>
              <span className={cx('b2b-landing-page-hero-checkmark-icon')}></span>
              <TextCarousel
                animationSpeedInSec={.8}
                contentArray={countries}
                className="b2b-landing-page-showcase-text"
                styles={{
                  letterSpacing: 0,
                  userSelect: "none"
                }}
              />
            </div>
          </div>
        </div>
      </div>     
    )
  }
  render() {
    const shouldIITIIMEnabled = isFeatureEnabled('landingPageIITIIM')
    const { isDesktop } = this.props

    return (
      <>
        <div
          className={cx('b2b-landing-page-hero-container')}
          id="__landing_hero_container"
        >
          <div className={cx('b2b-landing-page-hero-absoluteContainer', 'b2b-landing-page-hero-flexColumn')}>
            <div className={'b2b-landing-page-hero-top-container'}>
              <HeroHeader
                signUp={this.props.signUp}
                mailId={this.state.mailId}
                setMailId={(mailId) => {
                  this.setState({
                    mailId,
                  })
                }}
              />
              <Testimonials
                customImageBGStyles={{
                  boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#cfefff',
                }}
                animationSpeed={6500}
                slides={this.state.HeroSlides}
              />
            </div>
            {this.renderTekieStats()}
            <div className={cx('b2b-landing-page-hero-teamFromContainer', !shouldIITIIMEnabled && 'b2b-landing-page-hero-teamFromContainerNoIIT')}>
              <div className={cx('b2b-landing-page-hero-broughtToYou', 'sr-700-10-600')}>Brought to you by a team from</div>
              <div className={cx('b2b-landing-page-hero-flexSingleRow', !shouldIITIIMEnabled && 'b2b-landing-page-hero-flexSingleRowNoIIT')}>
                <div className={cx('b2b-landing-page-hero-row', !shouldIITIIMEnabled && 'b2b-landing-page-hero-noIITFeatureRow')}>
                  <ImageBackground
                    className={cx('b2b-landing-page-hero-google', 'sr-200-10-600')}
                    src={require('../../../assets/b2bLandingPage/logos/google_logo.svg')}
                    srcLegacy={require('../../../assets/b2bLandingPage/logos/google_logo.svg')}
                  />
                  <ImageBackground
                    className={cx('b2b-landing-page-hero-intel', 'sr-250-10-600')}
                    src={require('../../../assets/b2bLandingPage/logos/intel_logo.svg')}
                    srcLegacy={require('../../../assets/b2bLandingPage/logos/intel_logo.svg')}
                  />
                  <ImageBackground
                    className={cx('b2b-landing-page-hero-microsoft', 'sr-300-10-600')}
                    src={require('../../../assets/b2bLandingPage/logos/microsoft_logo.svg')}
                    srcLegacy={require('../../../assets/b2bLandingPage/logos/microsoft_logo.svg')}
                  />
                  <ImageBackground
                    className={cx('b2b-landing-page-hero-amazon', 'sr-350-10-600')}
                    src={require('../../../assets/b2bLandingPage/logos/amazon_logo.svg')}
                    srcLegacy={require('../../../assets/b2bLandingPage/logos/amazon_logo.svg')}
                    style={{ marginRight: 0 }}
                  />
                  <ImageBackground
                    className={cx('b2b-landing-page-hero-microsoft', 'b2b-landing-page-hero-displayOnlyDesktop', 'sr-350-10-600')}
                    src={require('../../../assets/b2bLandingPage/logos/harvard_logo.svg')}
                    srcLegacy={require('../../../assets/b2bLandingPage/logos/harvard_logo.svg')}
                    style={{ marginRight: 0 }}
                  />
                  {shouldIITIIMEnabled && (
                    <>
                      <div className={cx('b2b-landing-page-hero-iconText', 'b2b-landing-page-hero-displayOnlyDesktop', 'sr-400-10-600')}>IIT DELHI</div>
                      <div className={cx('b2b-landing-page-hero-iconText', 'b2b-landing-page-hero-displayOnlyDesktop', 'sr-450-10-600')}>IIM Ahmedabad</div>
                      <div className={cx('b2b-landing-page-hero-iconText', 'b2b-landing-page-hero-displayOnlyDesktop', 'sr-500-10-600')}>NITs</div>
                    </>
                  )}
                </div>
                <div className={cx('b2b-landing-page-hero-row', 'b2b-landing-page-hero-displayOnlyMobile', 'b2b-landing-page-hero-rowText')}>
                  <ImageBackground
                    className={cx('b2b-landing-page-hero-microsoft', 'b2b-landing-page-hero-displayOnlyMobile', 'sr-350-10-600')}
                    srcLegacy={require('../../../assets/b2bLandingPage/logos/harvard_logo.svg')}
                    src={require('../../../assets/b2bLandingPage/logos/harvard_logo.svg')}
                    style={{ marginRight: 0 }}
                  />
                  {shouldIITIIMEnabled && (
                    <>
                      <div className={cx('b2b-landing-page-hero-iconText', 'iit-delhi-scroll')}>IIT DELHI</div>
                      <div className={cx('b2b-landing-page-hero-iconText', 'iim-scroll')}>IIM Ahmedabad</div>
                      <div className={cx('b2b-landing-page-hero-iconText', 'nit-scroll')}>NITs</div>
                    </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
