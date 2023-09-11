import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import cx from 'classnames'
import qs from 'query-string'
import Style from 'style-it'
import { range } from 'lodash'
import { getToasterBasedOnType, Toaster } from '../../components/Toaster'
import { ImageBackground } from '../../image'
import Lottie from 'react-lottie'
import { motion } from 'framer-motion'
import Hero from './components/Hero'
import Header from './components/Header'
import Prompt from './components/Prompt'
import { LinksClicksGA } from '../../utils/analytics/ga'
import HorizontalScroll from './components/HorizontalScroll'
import Testimonials from './components/Testimonials'
import YoutubeEmbed from '../LandingPage/components/YoutubeEmbed'
import SignupLoginModal from '../Signup/SignupLogin'
import TopArrowSVGToRight from '../../assets/b2bLandingPage/topArrowTowardsRight'
import MiddleArrowSVGToRight from '../../assets/b2bLandingPage/middleArrowTowardsRight'
import TopArrowSVGToLeft from '../../assets/b2bLandingPage/topArrowTowardsLeft'
import BottomArrowSVGToLeft from '../../assets/b2bLandingPage/bottomArrowTowardsLeft'
import TekieMentorAnimation from '../../assets/animations/tekie-mentor-animation.json'
import ArrowSVG from '../../assets/arrowIcon'
import 'swiper/swiper.scss';
import { hs, hsm } from '../../utils/size'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'react-phone-input-2/lib/style.css'
import './styles.scss'
import ChatWidget from '../../components/ChatWidget'
import { filterKey } from '../../utils/data-utils'
import { connect } from 'react-redux'
import fetchStudentCurrentStatus from '../../queries/fetchStudentCurrentStatus'
import renderChats from '../../utils/getChatTags'

const breakPoint = 900

const journeyAnimationVariants = {
  initial: { opacity: 0.2 },
  animate: {
    opacity: 1,
    transition: {
      delay: 0.5
    }
  }
};

const tekieMentorOptions = {
  loop: true,
  autoplay: false,
  animationData: TekieMentorAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
}

const Divider = ({ classNames, id }) => {
  return (
    <div className={'b2b-landing-page-divider-container'} id={id}>
      <div className={cx('b2b-landing-page-divider', 'b2b-landing-page-dividerTop', classNames)}></div>
    </div>
  )
}
class B2BLandingPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isSignin: false,
      isDesktop: typeof window === 'undefined' ? true : window.innerWidth > breakPoint,
      tekieTourVideoVisible: false,
      selectedCodersJourneyIndex: 0,
      isTekieMentorAnimPaused: true,
      testimonialStepMobile: 0,
      testimonials: [
        {
          id: 0,
          text: '“ DPS Ujjain students will be energized by professionals from leading technical programming backgrounds to explore, critically analyse & creatively think of solutions to problems “',
          profileDesignation: 'Pro-Vice Chairman, Delhi Public School, Ujjain',
          profileImage: require('../../assets/b2bLandingPage/Testimonials/dpsProViceChairmanProfile.png'),
          profileImageWebp: require('../../assets/b2bLandingPage/Testimonials/dpsProViceChairmanProfile.webp'),
          orgLogo: require('../../assets/b2bLandingPage/Testimonials/delhiPublicSchoolLogo.png'),
          backgroundImage: require('../../assets/b2bLandingPage/Testimonials/delhiPublicSchoolBanner.png'),
          webpBackgroundImage: require('../../assets/b2bLandingPage/Testimonials/delhiPublicSchoolBanner.webp'),
        },
        {
          id: 1,
          text: 'Tekie has opened up a new world which makes students realise that they can do much more on the basis of their creativity and understanding. Learning to code is really a valuable skill for the future.',
          profileDesignation: 'Principal, Mayoor School, Sri Ganganagar',
          profileImage: require('../../assets/b2bLandingPage/Testimonials/mayoorSchoolPrincipalProfile.png'),
          profileImageWebp: require('../../assets/b2bLandingPage/Testimonials/mayoorSchoolPrincipalProfile.webp'),
          orgLogo: require('../../assets/b2bLandingPage/Testimonials/mayoorSchoolLogo.png'),
          backgroundImage: require('../../assets/b2bLandingPage/Testimonials/mayoorSchoolBanner.png'),
          webpBackgroundImage: require('../../assets/b2bLandingPage/Testimonials/mayoorSchoolBanner.webp'),
        },
        {
          id: 2,
          text: 'Tekie offers text-based coding along with animated videos that the students find very interesting. Coding is an essential skill for the future and we are glad to have Tekie with us on this journey.',
          profileDesignation: 'Principal, StudyWell Public School, Sitapur',
          profileImage: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicSchoolPrincipalProfile.png'),
          profileImageWebp: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicSchoolPrincipalProfile.webp'),
          orgLogo: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicLogo.png'),
          backgroundImage: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicSchoolBanner.png'),
          webpBackgroundImage: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicSchoolBanner.webp'),
        },
        {
          id: 3,
          text: 'The fun activities and competitions juxtaposed with sound academic instruction has been the ideal way to introduce coding to the students of Swiss Cottage school.',
          profileDesignation: 'Principal, Swiss Cottage school, New Delhi',
          profileImage: require('../../assets/b2bLandingPage/Testimonials/swissCottageSchoolPrincipalProfile.png'),
          profileImageWebp: require('../../assets/b2bLandingPage/Testimonials/swissCottageSchoolPrincipalProfile.webp'),
          orgLogo: require('../../assets/b2bLandingPage/Testimonials/swissCottageSchoolLogo.png'),
          backgroundImage: require('../../assets/b2bLandingPage/Testimonials/swissCottageSchoolBanner.png'),
          webpBackgroundImage: require('../../assets/b2bLandingPage/Testimonials/swissCottageSchoolBanner.webp'),
        },
        {
          id: 4,
          text: 'Tekie offers text-based coding that got us excited about their course. DPS trusts that coding is important for the future and we are proud to be part of Tekie family!',
          profileDesignation: 'Principal, Delhi Public School, Ujjain',
          profileImage: require('../../assets/b2bLandingPage/Testimonials/dpsujjainPrincipalProfile.png'),
          profileImageWebp: require('../../assets/b2bLandingPage/Testimonials/dpsujjainPrincipalProfile.webp'),
          orgLogo: require('../../assets/b2bLandingPage/Testimonials/delhiPublicSchoolLogo.png'),
          backgroundImage: require('../../assets/b2bLandingPage/Testimonials/delhiPublicSchoolBanner.png'),
          webpBackgroundImage: require('../../assets/b2bLandingPage/Testimonials/delhiPublicSchoolBanner.webp'),
        },
        // {
        //   id: 5,
        //   text: 'Tekie’s interactive text-based curriculum and the attention each student gets make it a promising solution. Students love to attend Tekie’s classes and we are glad to partner with them!',
        //   profileDesignation: 'Teacher, StudyWell Public School, Sitapur',
        //   profileImage: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicSchoolProfile.png'),
        //   profileImageWebp: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicSchoolProfile.webp'),
        //   orgLogo: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicLogo.png'),
        //   backgroundImage: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicSchoolBanner.png'),
        //   webpBackgroundImage: require('../../assets/b2bLandingPage/Testimonials/studyWellPublicSchoolBanner.png'),
        // },
      ],
      immersivePedogogySlides: [
        {
          id: 0,
          content: 'Interactive Practice Exercises',
          description: 'Creatively designed workbooks and coding exercises to develop algorithmic thinking.',
          thumbnailPng: require('../../assets/b2bLandingPage/ImmersivePedagogy/Reports.png'),
          thumbnailWebp: require('../../assets/b2bLandingPage/ImmersivePedagogy/Reports_lossless.webp')
        },
        {
          id: 1,
          content: 'Interactive Chats',
          description: 'Learn concepts and apply your learnings in a fun way.',
          thumbnailPng: require('../../assets/b2bLandingPage/ImmersivePedagogy/Chats.png'),
          thumbnailWebp: require('../../assets/b2bLandingPage/ImmersivePedagogy/Chats_lossless.webp')
        },
        {
          id: 2,
          content: 'Code Playground',
          description: 'Inbuilt code simulator for students to create as they learn.',
          thumbnailPng: require('../../assets/b2bLandingPage/ImmersivePedagogy/CodePlayground.png'),
          thumbnailWebp: require('../../assets/b2bLandingPage/ImmersivePedagogy/CodePlayground_lossless.webp')
        },
        {
          id: 3,
          content: 'DIY Projects',
          description: 'Students take up projects to apply their learnings.',
          thumbnailPng: require('../../assets/b2bLandingPage/ImmersivePedagogy/InteractiveClasses.png'),
          thumbnailWebp: require('../../assets/b2bLandingPage/ImmersivePedagogy/InteractiveClasses_lossless.webp')
        },
        {
          id: 4,
          content: 'Live Sessions',
          description: 'Online/offline sessions to guide and clarify doubts.',
          thumbnailPng: require('../../assets/b2bLandingPage/ImmersivePedagogy/LiveSessions.png'),
          thumbnailWebp: require('../../assets/b2bLandingPage/ImmersivePedagogy/LiveSessions_lossless.webp')
        },
        {
          id: 5,
          content: 'Gamified Learning Path',
          description: 'Students go on a learning journey through the course, completing missions and unlocking characters.',
          thumbnailPng: require('../../assets/b2bLandingPage/ImmersivePedagogy/Journey.png'),
          thumbnailWebp: require('../../assets/b2bLandingPage/ImmersivePedagogy/Journey_lossless.webp')
        },
        {
          id: 6,
          content: 'Engaging Video Content',
          description: 'World\'s first animated series on coding makes learning fun.',
          thumbnailPng: require('../../assets/b2bLandingPage/ImmersivePedagogy/Videos.png'),
          thumbnailWebp: require('../../assets/b2bLandingPage/ImmersivePedagogy/Videos_lossless.webp')
        },
      ],
      features: [
        [
          {
            icon: require('../../assets/b2bLandingPage/icons/person-circle-outline.png'),
            heading: 'Student Management',
            list: ['learning progress', 'student attendance', 'homework status', 'student rankings'],
          },
          {
            icon: require('../../assets/b2bLandingPage/icons/analytics-outline.svg'),
            heading: 'Teacher Management',
            list: ['Teacher Performance Tracker', 'Teacher Ratings & Reviews', 'Student feedbacks'],
          }
        ],
        [
          {
            icon: require('../../assets/b2bLandingPage/icons/calendar-outline.svg'),
            heading: 'Curriculum Management',
            list: ['class schedule assistance', 'timetable management', 'overall class progress', 'parent-teacher meeting'],
          },
          {
            icon: require('../../assets/b2bLandingPage/icons/pencil-outline.svg'),
            heading: 'Assessments',
            list: ['half-yearly assessments', 'yearly assessments', 'Student performance report'],
          }
        ],
      ],
      tekieMentorForceHighlights: [
        { title: (<> 4.90 &#9733; </>), description: 'Avg. Rating' },
        { title: 'Friendly & Dedicated', description: 'Common reviews' },
        { title: 'Java, Python', description: 'Familiar Languages' },
        { title: 'Achievements', description: (<> AI/ML Projects, PyGames, <br /> Hackathons, etc. </>) },
        { title: '3.5 +', description: 'Years experience in coding' }
      ],
      codersJourney: [
        {
          id: 0,
          program: 'Block-based programming',
          title: 'Building Logic & Algorithmic Thinking',
          class: '1 - 3',
          description: (
            <>
              <div className={'b2b-landing-page-journey-slide-description'}>
                This course is designed to improve the kid's creativity, sequential thinking, and logic by diving
                into intuitive puzzles, mazes, and games.
              </div>
              <div className={'b2b-landing-page-journey-slide-description'}>
                The curriculum covers all core topics of block-based
                coding from grades 1 to 3, with an increase in topic depths and complexities each year
              </div>
            </>
          ),
          tags: ['Code.org', 'Sprite Lab', 'Game Lab', 'App Lab', 'Artist'],
          tagsColor: '#65DA7A',
          imageWebp: require('../../assets/b2bLandingPage/CodersJourney/class1-2_lossless.webp'),
          image: require('../../assets/b2bLandingPage/CodersJourney/class1-2.png'),
          backdropColor: '#65DA7A'
        },
        {
          id: 1,
          program: 'Block-based programming',
          title: 'Intro to Coding with Blockly',
          class: '4 - 5',
          description: (
            <>
              <div className={'b2b-landing-page-journey-slide-description'}>
                Once the kids develop a base of algorithmic thinking and logic building through grades 1-3, this course gets them started on the basic concepts of programming using block-based coding and its reference to text-based syntax.
              </div>
              <div className={'b2b-landing-page-journey-slide-description'}>
                The course mainly focuses on problem-solving and solution designing through algorithms and applying logic in Blockly.
              </div>
            </>
          ),
          tags: ['Blockly'],
          tagsColor: '#01AA93',
          imageWebp: require('../../assets/b2bLandingPage/CodersJourney/class3-5_lossless.webp'),
          image: require('../../assets/b2bLandingPage/CodersJourney/class3-5.png'),
          backdropColor: '#01AA93'
        },
        {
          id: 2,
          program: 'PROGRAMME I',
          title: 'Intro to Coding',
          class: '6 - 7',
          description: (
            <>
              <div className={'b2b-landing-page-journey-slide-description'}>
                For students who are beginnning to learn text-based coding to get a flavor and see if it excites them.
              </div>
              <div className={'b2b-landing-page-journey-slide-description'}>
                Foundational knowledge to write basic scripts. Concepts covere here are same across all programming languages.
              </div>
            </>
          ),
          tags: ['python', 'advance python'],
          tagsColor: '#D34B57',
          imageWebp: require('../../assets/b2bLandingPage/CodersJourney/class6-7_lossless.webp'),
          image: require('../../assets/b2bLandingPage/CodersJourney/class6-7.png'),
          backdropColor: '#D34B57'
        },
        {
          id: 3,
          program: 'Programme II',
          title: 'Interest-based Specialisation',
          class: '8 - 10',
          description: (
            <>
              <div className={'b2b-landing-page-journey-slide-description'}>
                We introduce advance topics and build upon the foundation concepts they learned in Level 1.
              </div>
              <div className={'b2b-landing-page-journey-slide-description'}>
                Students will have multiple specialisations available to choose their field of study.
              </div>
            </>
          ),
          tags: ['Javascript', 'CSS', 'HTML5'],
          tagsColor: '#8C61CB',
          imageWebp: require('../../assets/b2bLandingPage/CodersJourney/class8-9_lossless.webp'),
          image: require('../../assets/b2bLandingPage/CodersJourney/class8-9.png'),
          backdropColor: '#8C61CB'
        },
        // {
        //   id: 4,
        //   program: 'Programme III',
        //   title: 'Apprenticeship Program',
        //   class: '11 - 12',
        //   description: (
        //     <>
        //       <div className={'b2b-landing-page-journey-slide-description'}>
        //         Students will work on projects in an apprenticeship setting writing production-ready code.
        //       </div>
        //     </>
        //   ),
        //   tags: [],
        //   tagsColor: '',
        //   imageWebp: require('../../assets/b2bLandingPage/CodersJourney/class10-12_lossless.webp'),
        //   image: require('../../assets/b2bLandingPage/CodersJourney/class10-12.png'),
        //   backdropColor: '#FAAD14'
        // },
      ]
    }
  }

  componentDidMount() {
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
      this.setState({ isDesktop: window.innerWidth > breakPoint })
      vh = window.innerHeight * 0.01;
      if (window.innerWidth < 500) {
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      } else {
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    })
    window.scrollTo({
      top: 0
    })
    this.setUTMParametersToLocalStorage()
    const observer = this.registerIntersectionObserver()
    const journeyEl = document.querySelector('#codersJourneySection')
    const tekieMentorAnim = document.querySelector('#tekieMentorAnim')
    if (tekieMentorAnim) {
      observer.observe(tekieMentorAnim)
    }
    if (journeyEl) {
      observer.observe(journeyEl)
    }
    if (this.props.isLoggedIn) {
      fetchStudentCurrentStatus(this.props.userId)
    }
  }

  componentDidUpdate = async () => {
    const { isLoggedIn, studentCurrentStatus, loggedInUser } = this.props
    if (window && window.fcWidget) {
      window.fcWidget.on("widget:opened", () => {
        renderChats({
          isLoggedIn,
          studentCurrentStatus,
          loggedInUser,
          b2BLandingPage: true
        })
      })
    }
  }
  registerIntersectionObserver = () => {
    return new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        if (this.state.isTekieMentorAnimPaused) {
          this.setState({
            isTekieMentorAnimPaused: false,
          })
        }
        if (!this.autoJourneyPlay) {
          this.enableJourneyAutoPlay()
        }
      }
    }, { root: null, rootMargin: "0px", threshold: 1 })
  }

  enableJourneyAutoPlay = () => {
    this.autoJourneyPlay = setInterval(() => {
      this.setState({
        selectedCodersJourneyIndex: this.cycleIndex(this.state.selectedCodersJourneyIndex + 1)
      })
    }, 5000)
  }

  disableJourneyAutoPlay = () => {
    window.clearInterval(this.autoJourneyPlay)
  }

  signUp = async (email) => {
    if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
      fetch(`https://script.google.com/macros/s/AKfycbxcJLDIkZ4_J2G74R9pDnTCSUYXLU6hD4hYt6fQcjPweYWuYpeXzwft/exec?email=${email}`)
    }
  }

  setUTMParametersToLocalStorage = () => {
    const params = qs.parse(window.location.search)
    if (params.utm_source) {
      localStorage.setItem('utm_source', params.utm_source)
    }
    if (params.utm_campaign) {
      localStorage.setItem('utm_campaign', params.utm_campaign)
    }
    if (params.utm_term) {
      localStorage.setItem('utm_term', params.utm_term)
    }
    if (params.utm_content) {
      localStorage.setItem('utm_content', params.utm_content)
    }
    if (params.utm_medium) {
      localStorage.setItem('utm_medium', params.utm_medium)
    }
  }

  cycleIndex(stepIndex) {
    return (stepIndex + this.state.codersJourney.length) % this.state.codersJourney.length
  }

  getProgressOffsetWidth = () => {
    const { codersJourney } = this.state
    const progressBar = document.getElementById('b2b-landing-page-journey-progress-nav')
    if (progressBar && progressBar.offsetWidth) {
      return progressBar.offsetWidth / (codersJourney.length - 1)
    }
    return 0
  }

  renderTestimonialCards = (testimony, isDesktop = true) => (
    <motion.div
      key={testimony.id}
      className={'b2b-landing-page-testimonial-card'}
      style={{ height: isDesktop ? `${window.innerHeight - 200}px` : '' }}
    >
      <div className={'b2b-landing-page-testimonial-image'}>
        <ImageBackground
          src={testimony.webpBackgroundImage}
          srcLegacy={testimony.backgroundImage}
          className={'b2b-landing-page-imageContainer'}
        />
      </div>
      <div className={'b2b-landing-page-testimonial-details'}>
        <div
          className={'b2b-landing-page-testimonial-profileImage'}>
          <ImageBackground
            src={testimony.profileImageWebp}
            srcLegacy={testimony.profileImage}
            className={'b2b-landing-page-imageContainer'}
          />
        </div>
        <div className={'b2b-landing-page-testimonial-detailsContainer'}>
          <div className={'b2b-landing-page-testimonial-details-feedback-text'}>
            {testimony.text}
          </div>
          <span className={'b2b-landing-page-testimonial-details-profile-designation'}>
            <ImageBackground
              src={testimony.orgLogo}
              srcLegacy={testimony.orgLogo}
              className={'b2b-landing-page-testimonial-org-logo'}
            />
            {testimony.profileDesignation}
          </span>
        </div>
      </div>
    </motion.div>
  )

  renderTestimonialSection = () => {
    const { isDesktop } = this.state
    return (
      <div className={'b2b-landing-page-testimonial-section'} id="testimonialSection">
        {isDesktop ? (
          <div style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
          }} className={'b2b-landing-page-testimonial-horizontal-section'}>
            <HorizontalScroll
              headerEl={(
                <div className={'b2b-landing-page-testtimonial-header-text'}>
                  Top-tier schools <span>trust Tekie</span>.
                </div>
              )}
            >
              <div
                className={'b2b-landing-page-horizontal-testimonial-cards-container'}
              >
                {this.state.testimonials.map(testimony => (
                  this.renderTestimonialCards(testimony)
                ))}
              </div>
            </HorizontalScroll>
          </div>
        ) : (
          <div style={{ overflow: 'hidden', width: '100vw' }}>
            <div className={'b2b-landing-page-testtimonial-header-text'}>
              Top-tier schools <span>trust Tekie</span>.
            </div>
            <Swiper
              spaceBetween={20}
              slidesPerView={1}
              onSlideChange={swiper => this.setState({ testimonialStepMobile: swiper.activeIndex })}
              onSwiper={(swiper) => this.swiper = swiper}
            >
              {this.state.testimonials.map(testimony => (
                <SwiperSlide style={{
                  marginTop: hsm(55)
                }}>
                  <div style={{
                    width: '100%',
                    flex: '0 0 auto',
                    display: 'flex',
                    height: 400,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    {this.renderTestimonialCards(testimony, false)}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className='b2b-landing-page-swiper-indicator-container'>
                <div className='b2b-landing-page-carousel-ArrowSVG-container' onClick={() => {
                  if (this.state.testimonialStepMobile === 0) {
                    this.swiper.slideTo(this.state.testimonials.length)
                  } else {
                    this.swiper.slidePrev()
                  }
                }}>
                  <ArrowSVG className={'b2b-landing-page-carousel-mobileArrowSVG'} />
                </div>
                {range(this.state.testimonials.length).map(i => (
                  <motion.div
                    className='b2b-landing-page-carousel-indicator'
                    style={{
                      ...((i === this.state.testimonials.length - 1)
                        ? { marginRight: 0 }
                        : {})
                    }}
                    onClick={() => {
                      this.swiper.slideTo(i)
                    }}
                    whileHover={{
                      opacity: 0.4,
                      background: '#00ADE6'
                    }}
                    initial={{
                      opacity: 0.7,
                      background: '#C4C6CF'
                    }}
                    animate={this.state.testimonialStepMobile === i ? ({
                      background: '#00ADE6',
                    }) : ({
                      background: '#C4C6CF'
                    })}
                  />
                ))}
                <div
                  style={{ marginLeft: 12, transform: 'scaleX(-1)' }}
                  className='b2b-landing-page-carousel-ArrowSVG-container'
                  onClick={() => {
                    if (this.state.testimonialStepMobile === this.state.testimonials.length - 1) {
                      this.swiper.slideTo(0)
                    } else {
                      this.swiper.slideNext()
                    }
                  }}
                >
                  <ArrowSVG className={'b2b-landing-page-carousel-mobileArrowSVG'} />
                </div>
              </div>
            </div>
            <div className={cx('b2b-landing-page-getStarted-button')}
              style={{ margin: '26px auto 16px auto' }}
              onClick={() => {
                this.props.history.push('/signup-school')
              }}
            >
              <span>Get Started</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  renderImmersivePedogogySection = () => {
    return (
      <div className={'b2b-landing-page-immersive-pedagogy'}>
        <div className={'b2b-landing-page-section-header b2b-landing-page-mobilePaddingBottom'}>
          <span className='b2b-landing-page-bottomOverlayLine'>Immersive</span> Pedagogy
        </div>
        <div style={{ width: '100vw', marginTop: '12px' }}>
          <Testimonials animationSpeed={3000} slides={this.state.immersivePedogogySlides} immersivePedogogy />
        </div>
        <div className={'b2b-landing-page-immersive-pedagogy-action-container'}>
          <div className={cx('b2b-landing-page-getStarted-button')} style={{ margin: 0 }} onClick={() => {
            this.props.history.push('/signup-school')
          }}>
            <span>Get Started</span>
          </div>
          <span className='b2b-landing-page-text-muted'> or </span>
          <div className={cx('b2b-landing-page-button-link')} onClick={() => {
            this.setState({
              tekieTourVideoVisible: true
            })
          }}>
            Take a tour <span className={cx('b2b-landing-page-hero-playIcon')} />
          </div>
        </div>
      </div>
    )
  }

  renderFeaturesComponent = () => {
    const { features } = this.state
    return features && features.map(featureList => (
      <div className={'b2b-landing-page-lms-features-row'}>
        {featureList.map(feature => (
          <div className={'b2b-landing-page-lms-feature'}>
            <div className={cx('b2b-landing-page-lms-feature-icon')} style={{
              background: `url('${feature.icon}')`
            }} />
            <div className={'b2b-landing-page-lms-feature-heading'}>{feature.heading}</div>
            <ul className={'b2b-landing-page-lms-feature-list'}>
              {feature.list.map(liItems => (
                <li className={'b2b-landing-page-lms-feature-list-item'}> {liItems} </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ))
  }

  renderLMSSection = () => {
    return (
      <div className={'b2b-landing-page-lms'}>
        <div className={'b2b-landing-page-section-header'}>
          <span className='b2b-landing-page-bottomOverlayLine'>
            Learning Management System
          </span>
        </div>
        <div className={'b2b-landing-page-section-subheader'}>
          A unified platform to enable end-to-end management.
        </div>
        <div className={'b2b-landing-page-lms-features-container'}>
          <ImageBackground
            src={require('../../assets/b2bLandingPage/TMSLeftObj1.png')}
            srcLegacy={require('../../assets/b2bLandingPage/TMSLeftObj1.png')}
            className='b2b-landing-page-lms-absolute-container b2b-landing-page-lms-absolute-leftTop'
          />
          <ImageBackground
            src={require('../../assets/b2bLandingPage/TMSLeftObj2.png')}
            srcLegacy={require('../../assets/b2bLandingPage/TMSLeftObj2.png')}
            className='b2b-landing-page-lms-absolute-container b2b-landing-page-lms-absolute-leftBottom'
          />
          <ImageBackground
            src={require('../../assets/b2bLandingPage/TMSRightObj1.png')}
            srcLegacy={require('../../assets/b2bLandingPage/TMSRightObj1.png')}
            className='b2b-landing-page-lms-absolute-container b2b-landing-page-lms-absolute-rightTop'
          />
          <ImageBackground
            src={require('../../assets/b2bLandingPage/TMSRightObj2.png')}
            srcLegacy={require('../../assets/b2bLandingPage/TMSRightObj2.png')}
            className='b2b-landing-page-lms-absolute-container b2b-landing-page-lms-absolute-rightBottom'
          />
          {this.renderFeaturesComponent()}
          <div className={cx('b2b-landing-page-getStarted-button')} onClick={() => {
            this.props.history.push('/signup-school')
          }}>
            <span>Get Started</span>
          </div>
        </div>
      </div>
    )
  }

  renderTekieMentorForceHighlights = ({ title, description }, customStyles = {}) => {
    return (
      <div className={'b2b-landing-page-tekiementorForce-highlight'} style={{ ...customStyles }}>
        <div className={'b2b-landing-page-tekiementorForce-highlight-title'}> {title} </div>
        <div className={'b2b-landing-page-tekiementorForce-highlight-description'}> {description} </div>
      </div>
    )
  }

  renderTekieMentorForceDesktopAnim = (tekieMentorForceHighlights) => (
    <div className={'b2b-landing-page-tekieMentorForce-DesktopOnly-container'}>
      <div className={'b2b-landing-page-tekieMentorForce-col'}>
        <div className={'b2b-landing-page-tekieMentorForce-topArrowToRight'}>
          <div className={'b2b-landing-page-tekieMentorForce-highlight-details'}>
            {tekieMentorForceHighlights[0].title}<span>{tekieMentorForceHighlights[0].description}</span>
          </div>
          <TopArrowSVGToRight />
        </div>
        <div className={'b2b-landing-page-tekieMentorForce-middleArrowToRight'}>
          <div className={'b2b-landing-page-tekieMentorForce-highlight-details'}>
            {tekieMentorForceHighlights[2].title}<span>{tekieMentorForceHighlights[2].description}</span>
          </div>
          <MiddleArrowSVGToRight />
        </div>
        <div className={'b2b-landing-page-tekieMentorForce-bottomArrowToRight'}>
          <div className={'b2b-landing-page-tekieMentorForce-highlight-details'}>
            {tekieMentorForceHighlights[1].title}<span>{tekieMentorForceHighlights[1].description}</span>
          </div>
          <div className={cx('b2b-landing-page-tekieMentorForce-bottomArrowSVG')} style={{
            background: `url('${require('../../assets/b2bLandingPage/bottomArrowTowardsRight.svg')}')`
          }} />
        </div>
      </div>
      <div className={'b2b-landing-page-tekieMentorForce-col b2b-landing-page-tekieMentorForce-Svg'}>
        <Lottie
          isClickToPauseDisabled
          options={tekieMentorOptions}
          style={{ position: 'relative', top: 20 }}
          isPaused={this.state.isTekieMentorAnimPaused}
        />
      </div>
      <div className={'b2b-landing-page-tekieMentorForce-col'}>
        <div className={'b2b-landing-page-tekieMentorForce-topArrowToLeft b2b-landing-page-col-reverse'}>
          <div className={'b2b-landing-page-tekieMentorForce-highlight-details'}>
            {tekieMentorForceHighlights[3].title}<span>{tekieMentorForceHighlights[3].description}</span>
          </div>
          <TopArrowSVGToLeft />
        </div>
        <div className={'b2b-landing-page-tekieMentorForce-bottomArrowToLeft b2b-landing-page-col-reverse'}>
          <div className={'b2b-landing-page-tekieMentorForce-highlight-details'}>
            {tekieMentorForceHighlights[4].title}<span>{tekieMentorForceHighlights[4].description}</span>
          </div>
          <BottomArrowSVGToLeft />
        </div>
      </div>
    </div>
  )

  renderTekieMentorForceSection = () => {
    const { isDesktop, tekieMentorForceHighlights } = this.state
    return (
      <div className={'b2b-landing-page-tekieMentorForce'} id='tekieMentorAnim'>
        <div className={'b2b-landing-page-section-header'}>
          <span className='b2b-landing-page-bottomOverlayLine'>
            Tekie Mentor Force
          </span>
        </div>
        <div className={'b2b-landing-page-section-subheader b2b-landing-page-subheader-mobileOnly'}>
          We take pride in the quality of our mentors and have designed a selection process to ensure the highest teaching standards. In fact, our average acceptance rate is <span className='b2b-landing-page-gradientText'>2%</span>. All mentors come with hands on coding experience and are trained to enable an enriching class experience.
        </div>
        {isDesktop ? this.renderTekieMentorForceDesktopAnim(tekieMentorForceHighlights) : (
          <>
            <div className={'b2b-landing-page-mentorForce-mentor-details-container'}>
              <div className={cx('b2b-landing-page-mentorForce-mentor-image-view')} style={{
                background: `url('${require('../../assets/b2bLandingPage/tekie-mentor.svg')}')`
              }} />
              <div className={'b2b-landing-page-tekiementorForce-row'}>
                {this.renderTekieMentorForceHighlights(tekieMentorForceHighlights[0], { textAlign: 'center' })}
              </div>
              <div className={'b2b-landing-page-tekiementorForce-row'}>
                {[1, 2].map(ArrIndex => (
                  this.renderTekieMentorForceHighlights(tekieMentorForceHighlights[ArrIndex])
                ))}
              </div>
              <div className={'b2b-landing-page-tekiementorForce-row'}>
                {[3, 4].map(ArrIndex => (
                  this.renderTekieMentorForceHighlights(tekieMentorForceHighlights[ArrIndex])
                ))}
              </div>
            </div>
            <div className={cx('b2b-landing-page-getStarted-button')} onClick={() => {
              this.props.history.push('/signup-school')
            }}>
              <span>Get Started</span>
            </div>
          </>
        )}
      </div>
    )
  }

  getCubeIconPath = (selectedCodersJourneyIndex, journeyId) => {
    if (selectedCodersJourneyIndex >= journeyId) {
      return require('../../assets/b2bLandingPage/cube.png')
    }
    return require('../../assets/b2bLandingPage/cubeMuted.png')
  }

  renderCodersJourneySection = () => {
    const { codersJourney, selectedCodersJourneyIndex } = this.state
    const selectedJourney = codersJourney[selectedCodersJourneyIndex]
    return (
      <div className={'b2b-landing-page-CodersJourney'}>
        <div className={'b2b-landing-page-section-header'}>
          Coder’s Journey for Classes 1 - 12
        </div>
        <motion.div
          onMouseOver={this.disableJourneyAutoPlay} onMouseOut={this.enableJourneyAutoPlay}
          className={'b2b-landing-page-journey-top-nav'}>
          <div className={'b2b-landing-page-journey-nav-container'}>
            {codersJourney.map(journey => (
              <motion.div
                animate={{
                  borderColor: selectedCodersJourneyIndex >= journey.id ? '#00ADE6' : '#ddd',
                  color: selectedCodersJourneyIndex >= journey.id ? '#00ADE6' : '#aaa',
                  transistion: {
                    borderRadius: { duration: .8 }
                  }
                }}
                key={journey.id}
                onClick={() => {
                  this.setState({
                    selectedCodersJourneyIndex: this.cycleIndex(journey.id)
                  })
                }}
                className={'b2b-landing-page-journey-nav-item'}>
                <div>
                  <span className={'b2b-landing-page-journey-nav-item-DesktopOnly'}>Grade </span>
                  <span>{journey.class}</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <ImageBackground
                    className={'b2b-landing-page-journey-nav-icon'}
                    src={this.getCubeIconPath(selectedCodersJourneyIndex, journey.id)}
                    srcLegacy={this.getCubeIconPath(selectedCodersJourneyIndex, journey.id)}
                  />
                  <ImageBackground
                    style={{
                      opacity: `${selectedCodersJourneyIndex === journey.id ? '1' : '0'}`,
                    }}
                    className='b2b-landing-page-journey-nav-icon b2b-landing-page-journey-nav-icon-outline'
                    src={require('../../assets/b2bLandingPage/cube-outline.png')}
                    srcLegacy={require('../../assets/b2bLandingPage/cube-outline.png')}
                  />
                </div>
              </motion.div>
            ))}
            <div id='b2b-landing-page-journey-progress-nav' className={'b2b-landing-page-journey-nav-progress'} />
            <div
              style={{
                width: `${this.getProgressOffsetWidth() * selectedCodersJourneyIndex}px`,
              }}
              className={'b2b-landing-page-journey-nav-progress b2b-landing-page-journey-progress-primaryBg'} />
          </div>
        </motion.div>
        <div className={'b2b-landing-page-journey-container'}>
          <div className={'b2b-landing-page-journey-toolbar'} style={{ backgroundColor: '#FFF' }}>
            <div /> <div /> <div />
          </div>
          {codersJourney.map((journey, index) => (
            <motion.div
              key={journey.id}
              variants={journeyAnimationVariants}
              initial={{
                opacity: selectedCodersJourneyIndex === index ? 0 : 1,
              }}
              animate={{
                opacity: selectedCodersJourneyIndex === index ? 1 : 0,
                transition: {
                  duration: .5,
                }
              }}
              style={{
                display: selectedCodersJourneyIndex === index ? 'flex' : 'none',
              }}
              className={'b2b-landing-page-journey-slide-container'}
            >
              <div className={'b2b-landing-page-journey-slide-details'}>
                <div className={'b2b-landing-page-journey-slide-programme'}>{selectedJourney.program}</div>
                <div className={'b2b-landing-page-journey-slide-header'}>{selectedJourney.title}</div>
                <div className={'b2b-landing-page-journey-slide-class'}>Class {selectedJourney.class}</div>
                {selectedJourney.description}
                <div className={'b2b-landing-page-journey-slide-tags'}>
                  {selectedJourney.tags.map(tag => (
                    <div
                      style={{ background: `${selectedJourney.tagsColor || '#D34B57'}` }}
                      className={'b2b-landing-page-journey-slide-tag'}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
                {/* <div className={cx('b2b-landing-page-getStarted-button')} style={{ margin: 0 }} onClick={() => {
                  this.props.history.push('/signup-school')
                }}>
                  <span>Get Started</span>
                </div> */}
              </div>
              <ImageBackground
                className={'b2b-landing-page-journey-slide-image'}
                srcLegacy={selectedJourney.image}
                src={selectedJourney.image}
              />
              <div
                style={{
                  boxShadow: `0px 0px 60px 20px ${selectedJourney.backdropColor || ''}`,
                  background: `${selectedJourney.backdropColor || ''}`
                }}
                className={'b2b-landing-page-journey-slide-image-backdrop'}
              />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  renderFooter = () => {
    return (
      <div className={'b2b-landing-page-footer-container'}>
        <div className='b2b-landing-page-flex-container'>
          <ImageBackground
            className={cx('b2b-landing-page-footer-tekieLogo', 'sr-200-35-600')}
            src={require('../../assets/tekieLogo_lossless.webp')}
            srcLegacy={require('../../assets/tekieLogo.png')}
            style={{ cursor: 'pointer' }}
          />
          <div className={'b2b-landing-page-socialMediaContainer'}>
            <div className={'b2b-landing-page-socialMediaWrapper'}>
              {/* eslint-disable jsx-a11y/anchor-has-content */}
              <a
                onClick={() => LinksClicksGA('Facebook Link')}
                className={cx('b2b-landing-page-socialMediaIcon', 'b2b-landing-page-smFacebook')}
                href="https://www.facebook.com/Tekie.in/"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              <a
                onClick={() => LinksClicksGA('Instagram Link')}
                className={cx('b2b-landing-page-socialMediaIcon', 'b2b-landing-page-smInstagram')}
                href="https://www.instagram.com/tekie.in/"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              <a
                onClick={() => LinksClicksGA('Linkedin Link')}
                className={cx('b2b-landing-page-socialMediaIcon', 'b2b-landing-page-smLinkedin')}
                href="https://www.linkedin.com/company/tekie/"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              <a
                onClick={() => LinksClicksGA('Youtube Link')}
                className={cx('b2b-landing-page-socialMediaIcon', 'b2b-landing-page-smYoutube')}
                href="https://www.youtube.com/channel/UCCr7GPlTdZRXFEfveeuKcbg"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
            </div>
          </div>
        </div>
        <div className='b2b-landing-page-flex-container'>
          <span className={'b2b-landing-page-footer-subText'}>Making Students Future Ready.</span>
          <div style={{ marginTop: '12px' }}>
            <div className={'b2b-landing-page-footerLinks'}>
              <div className={cx('b2b-landing-page-footerText', 'b2b-landing-page-footerLinkPaddingRight', 'b2b-landing-page-noneUnderline', 'b2b-landing-page-footerRightBorder')}>Copyright © 2020</div>
              <Link to="/terms" className={'b2b-landing-page-noneUnderline'}>
                <div className={cx('b2b-landing-page-footerText', 'b2b-landing-page-footerLink', 'b2b-landing-page-footerLinkPadding', 'b2b-landing-page-footerRightBorder')}>Terms & Conditions</div>
              </Link>
              <Link to="/privacy" className={'b2b-landing-page-noneUnderline'}>
                <div className={cx('b2b-landing-page-footerText', 'b2b-landing-page-footerLink', 'b2b-landing-page-footerLinkPaddingLeft')}>Privacy</div>
              </Link>
            </div>
            <div className={cx('b2b-landing-page-copyRightContainer')}>
              <div className={cx('b2b-landing-page-madeBy', 'b2b-landing-page-brandCopyRight')}>
                Kiwhode Learning Pvt Ltd. All Rights Reserved.
              </div>
              <div className={cx('b2b-landing-page-madeBy', 'b2b-landing-page-brandCopyRight')}>
                Corporate Office: M2/37 B, First Floor, DLF phase 2, Gurugram
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { isSignin, isDesktop } = this.state
    return (
      <div style={{ background: '#F1FAFE' }}>
        <Style>
          {`
            ::-webkit-scrollbar-thumb {
              background-color: rgba(52, 228, 234, 0.3);
              border-radius: 0px;
            }
          `}
        </Style>
        <ChatWidget />
        <Header
          setSignInStatus={() => {
            this.setState({
              isSignin: true
            })
          }}
        />
        <Hero
          signUp={this.signUp}
          isDesktop={isDesktop}
          history={this.props.history}
        />
        <div className={'b2b-landing-page-body'}>
          {this.renderTestimonialSection()}
          <Divider id="immersivePedogogySection" />
          {this.renderImmersivePedogogySection()}
          <Divider id="LMSSection" />
          {this.renderLMSSection()}
          <Divider id="tekieMentorForceSection" />
          {this.renderTekieMentorForceSection()}
          <Divider id="codersJourneySection" />
          {this.renderCodersJourneySection()}
        </div>
        <div className='b2b-landing-page-pre-footer-pitch-container'>
          <div className='b2b-landing-page-pre-footer-pitch-header'>
            Get your school prepared for the future.
          </div>
          <div className='b2b-landing-page-pre-footer-pitch-description'>
            Integrated coding solutions for schools.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className='b2b-landing-page-hero-input-container sr-300-5-600' style={{ marginTop: 19, width: 'fit-content' }}>
              <div className={cx('b2b-landing-page-hero-input', 'sr-250-15-600')}>
                <input placeholder='Enter your email address' value={this.state.mailId} onChange={(e) => {
                  this.setState({
                    mailId: e.target.value
                  })
                }}>
                </input>
                <span className={cx('b2b-landing-page-hero-input-icon')}></span>
              </div>
            </div>
            <div >
              <Link
                style={{ marginLeft: '12px' }} className={cx('b2b-landing-page-getStarted-button')}
                onClick={() => this.signUp(this.state.mailId)}
                to={{
                  pathname: `/signup-school`,
                  state: {
                    mailId: this.state.mailId,
                  },
                }}
              >
                <span>Get Started</span>
              </Link>
            </div>
          </div>
        </div>
        <Divider classNames='b2b-landing-page-footer-divider' />
        {this.renderFooter()}
        <motion.div
          initial={{
            opacity: isSignin ? 1 : 0,
            visibility: isSignin ? 'visible' : 'hidden'
          }}
          animate={{
            opacity: isSignin ? 1 : 0,
            visibility: isSignin ? 'visible' : 'hidden'
          }}
          style={{
            pointerEvents: isSignin ? 'auto' : 'none'
          }}
        >
          <SignupLoginModal
            modalComponent
            shouldRedirect={false}
            visible={isSignin}
            closeLoginModal={() => {
              this.setState({
                isSignin: false
              })
            }}
          />
        </motion.div>
        <YoutubeEmbed visible={this.state.tekieTourVideoVisible} id='FG0LXseAUTU' close={() => {
          this.setState({
            tekieTourVideoVisible: false
          })
        }} />
        <Prompt
          onRef={ref => this.prompt = ref}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
  userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
  studentCurrentStatus: state.data.getIn(['getStudentCurrentStatus', 'data', 'status']),
  loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
})

export default connect(mapStateToProps)(withRouter(B2BLandingPage))

