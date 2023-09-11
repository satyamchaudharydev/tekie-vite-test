
/* eslint-disable */
import React, { Component } from 'react'
import { withRouter, Link, Switch, Route } from 'react-router-dom'
import gql from 'graphql-tag'
import { get } from 'lodash'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import qs from 'query-string'
import { motion } from 'framer-motion'
import Style from 'style-it'
import { ImageBackground } from '../../image'
import Collapsible from './components/Collapsible'
import Hero from './components/Hero'
import Testimonials from './components/Testimonials'
import Feature from './components/Feature'
// import Episode from './components/Episode'
import Activities from './components/Activities'
import NavigationLifecycle from '../../components/NavigationLifecycle'
import Header from './components/Header'
import Prompt from './components/Prompt'
import Claimed from './components/Claimed'
import requestToGraphql from '../../utils/requestToGraphql'
// import YoutubeEmbed from './components/YoutubeEmbed'
import Carousel from './components/Carousel'
import { enrollNowGA, LinksClicksGA } from '../../utils/analytics/ga'
import Play from '../../assets/playIcon'
import isFeatureEnabled from '../../utils/isFeatureEnabled'
import getCountryCode from '../../utils/getCountryCode'

import './components/Legal.scss'
import './components/Episode.scss'

import './styles.scss'
import ChatWidget from '../../components/ChatWidget'
import { filterKey, isME } from '../../utils/data-utils'
import { connect } from 'react-redux'
import fetchStudentCurrentStatus from '../../queries/fetchStudentCurrentStatus'
import renderChats from '../../utils/getChatTags'
import { Base64 } from 'js-base64'
import faqs, { faqParser } from './faqs'

const breakPoint = 900

const googleFAQ = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Who should take this course?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "<p>Well, anyone over the age of 10 who wants to start learning to program, get a flavor of what programming is all about, or to see if this excites you can start with this course.</p>"
    }
  }, {
    "@type": "Question",
    "name": "Do I need to be familiar with coding to take this course?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "<p>No, you can start without any previous knowledge.</p>"
    }
  }, {
    "@type": "Question",
    "name": "Is this course beginner friendly?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Don't worry! All our classes are beginner-friendly. We have sessions designed specifically for beginners. Right from your first class, we'll make sure we help you get started and feel totally comfortable."
    }
  }, {
    "@type": "Question",
    "name": "Why kids should learn to code?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Coding is the future, having the right coding skills early lays a solid professional foundation for them."
    }
  }, {
    "@type": "Question",
    "name": "How do you make coding fun for kids?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text":"We use gamification and storytelling for teaching complex codes to kids."}
    }]
}`

class LandingPage extends Component {
  state = {
    enrollmentForm: false,
    loginForm: false,
    OTPForm: false,
    claimed: false,
    phone: '',
    countryCode: '+91',
    loginLoading: false,
    claimedLogin: false,
    activeForm: 0,
    episodeOneVisible: false,
    trailerVisible: false,
    episode12Visible: false,
    tekieTourVideoVisible: false,
    namanSonparVideoVisible: false,
    isDesktop: typeof window === 'undefined' ? true : window.innerWidth > breakPoint,
    episode1Hover: false,
    episode12Hover: false,
    usPricingTextOver: false,
    isBanner: false,
    bannerHeight: 50,
    fetchedFaqs: [],
    slides: [
      {
        id: 0,
        text: 'Variable naming rules',
        backgroundImage: require('../../assets/slides/loops.png'),
        webpBackgroundImage: require('../../assets/slides/loops_lossless.webp'),
        isActive: false,
        ytId: 'aDz9EriNeyA',
        route: '/snippets/aDz9EriNeyA'
      },
      {
        id: 1,
        text: 'Interpreter basics',
        backgroundImage: require('../../assets/slides/interpreter.png'),
        webpBackgroundImage: require('../../assets/slides/interpreter_lossless.webp'),
        isActive: false,
        ytId: 'sShZ3Sm-GOk',
        route: '/snippets/sShZ3Sm-GOk'
      },
      {
        id: 2,
        text: 'What is a variable?',
        backgroundImage: require('../../assets/slides/variables.png'),
        webpBackgroundImage: require('../../assets/slides/variables_lossless.webp'),
        isActive: false,
        ytId: 'HSf7XQnlQuo',
        route: '/snippets/HSf7XQnlQuo'
      },
    ],
    testimonials: {
      in: [
        {
          id: 0,
          childName: 'Adeeth Seth',
          gradeInfo: 'Grade 7 | Shriram Millenium School | Noida',
          parentName: 'Manu seth',
          testimonial: (
            <span>
              {[
                <span style={{ fontWeight: 'bold' }}>Tekie is a magnificent platform for children to develop their skill-sets on basics of programming and to enable themselves to become an expert programmer </span>,
                "- which to my thought is every parent's dream to see their young ones catching up in this ever-changing and fast-paced IT world. We, as parents, are very satisfied with Tekie's curriculum and their team's artistic way of teaching Python Programming with their impeccably designed animated teaching module. Their team have developed a passion for coding in my son and have been supporting him swiftly to sharpen his skills in Python Programming. He is really enjoying while learning with Tekie. My sincere thanks to Tekie and best wishes to them in their pursuit of teaching kids to code. God Bless!",
              ]}
            </span>
          ),
          height: 471,
          studentProfile: require('../../assets/testimonials/adeeth seth.jpeg'),
          parentProfile: require('../../assets/testimonials/manu seth.jpeg'),
          studentProfileWebp: require('../../assets/testimonials/adeeth seth.webp'),
          parentProfileWebp: require('../../assets/testimonials/manu seth.webp')
        },
        {
          id: 1,
          childName: 'Prayash Pratim Baruah',
          gradeInfo: 'Grade 10 | Faculty Higher Secondary School | Guwahati',
          parentName: 'MALOSHI CHOUDHURY ',
          testimonial: (
            <span>
              {[
                <span style={{ color: '#57e1ed' }}>Student</span>,
                ' ~ "I find my sessions very interesting as my mentors invest efforts in my thorough understanding of the topics. ',
                <span style={{ fontWeight: 'bold' }}>The course is designed strategically, so the first few sessions are on building up the base that makes it easier to grasp complex concepts later.</span>,
                ' The homework/coding assignments help me revise topics, and I can revisit all my past coding classes. I always eagerly look forward to my next coding session. I really enjoy learning with Tekie!"',
                <br />,
                <br />,
                <span style={{ color: '#57e1ed' }}>Parent</span>,
                ' ~ " ',
                <span style={{ fontWeight: 'bold' }}>If learning to code teaches one to think, I probably took the right decision by facilitating my son to take up this  coding course with Tekie.</span>,
                ' Kudos to team Tekie for teaching coding to kids."',
              ]}
            </span>
          ),
          height: 527,
          studentProfile: require('../../assets/testimonials/prayash.jpeg'),
          parentProfile: require('../../assets/testimonials/prayash mom.jpg'),
          studentProfileWebp: require('../../assets/testimonials/prayash.webp'),
          parentProfileWebp: require('../../assets/testimonials/prayash mom.webp'),
        },
        {
          id: 2,
          childName: 'Medha',
          gradeInfo: 'Grade 6 | Homeschooled | Delhi',
          parentName: 'Sudipto MONDAL',
          testimonial: (
            <span>
              {[
                'The best learning happens when you are not learning, you are playing and enjoying. For Medha, learning has been a pleasant glide, thanks to a warm and interpersonal method of teaching; ',
                <span style={{ fontWeight: 'bold' }}>it's like she is learning from a friend who knows her! She loves the puzzles and other methods used- both experimental and classic. </span>,
                "We would highly recommend you to start your kid's journey into the exciting world of coding with Tekie. Medha is looking forward to her next coding classes!!!",
              ]}
            </span>
          ),
          height: 427,
          studentProfile: require('../../assets/testimonials/medha.jpeg'),
          parentProfile: require('../../assets/testimonials/sudipto.jpg'),
          studentProfileWebp: require('../../assets/testimonials/medha.webp'),
          parentProfileWebp: require('../../assets/testimonials/sudipto.webp'),
        },
        {
          id: 3,
          childName: 'Naman Sonpar',
          gradeInfo: 'Grade 7 | Shriram Millenium School | Noida',
          parentName: 'Rajesh Sonpar',
          testimonial: (
            <span>
              {[
                "Naman is much eager and enthusiastic to know and learn coding and is loving the oxygen in his room while learning and applying his programming skills around Python Programming.",
                <span style={{ fontWeight: 'bold' }}> They have a marvelously designed concept for children to learn coding as they use the art of storytelling with their uniquely launched animated sitcom series to teach coding for kids.</span>,
                " It's a superb platform for kids to master their coding skills.",
                <span style={{ fontWeight: 'bold' }}> Kudos to the team on this brilliant journey to make Naman learn coding and be well equipped with skills that will prepare him to be future-ready. </span>,
                "Our best wishes to team Tekie in this endeavor of teaching kids to code."
              ]}
            </span>
          ),
          height: 477,
          studentProfile: require('../../assets/testimonials/naman sonpar.jpeg'),
          parentProfile: require('../../assets/testimonials/rajesh sonpar.jpeg'),
          studentProfileWebp: require('../../assets/testimonials/naman sonpar.webp'),
          parentProfileWebp: require('../../assets/testimonials/rajesh sonpar.webp'),
        },
        {
          id: 4,
          childName: 'Karan Nanda',
          gradeInfo: 'Grade 7 | Shriram Millenium School | Delhi',
          parentName: 'Kriti Nanda',
          testimonial: (
            <span>
              {[
                "My son Karan simply loved the trial coding class and naturally, he was super excited to join the coding course.",
                <span style={{ fontWeight: 'bold' }}> As a parent, I'm so glad that my son will learn something new with so much enthusiasm.</span>,
                " I wish the team all the best and may they succeed more than they have thought. Blessings.",
              ]}
            </span>
          ),
          height: 352,
          studentProfile: require('../../assets/testimonials/karan.jpeg'),
          parentProfile: require('../../assets/testimonials/kriti.jpeg'),
          studentProfileWebp: require('../../assets/testimonials/karan.webp'),
          parentProfileWebp: require('../../assets/testimonials/kriti.webp'),
        },
      ],
      us: [
        {
          id: 0,
          childName: 'Arjun',
          gradeInfo: 'Grade 6 | New York | West Wood Upper Elementry School',
          parentName: 'Prakash Misra',
          testimonial: (
            <span>
              {[
                'This is our son’s first experience learning about programming.  He has had a great experience so far.',
                <span style={{ fontWeight: 'bold' }}> The online training content - videos and chat dialogues - are well crafted to engage and entertain young people, while teaching key concepts.</span>,
                ' The sequence of topics also have worked really well for our son, giving him a foundation and building on it.  We have already recommended Tekie to friends.  Kudos to the Tekie team!',
              ]}
            </span>
          ),
          height: 427,
          studentProfile: require('../../assets/testimonials/arjun.jpeg'),
          parentProfile: require('../../assets/testimonials/prakshMishra.jpeg'),
          studentProfileWebp: require('../../assets/testimonials/arjun.webp'),
          parentProfileWebp: require('../../assets/testimonials/prakshMishra.webp'),
        },
        {
          id: 1,
          childName: 'Aditi',
          gradeInfo: 'Grade 6 | North Carolina',
          parentName: 'Jagadish',
          testimonial: (
            <span>
              {[
                <span style={{ color: '#57e1ed' }}>Student</span>,
                ' ~ "I have been in Tekie for 3 weeks now and have already learned so much! My mentor has been very patient with me and explained all of the information no matter how many times I didn\'t get it. I also have fun learning"',
                <br />,
                <br />,
                <span style={{ color: '#57e1ed' }}>Parent</span>,
                ' ~ "We searched for something for my daughter to be engaged during covid times as she was not getting challenged and was bored at home. ',
                <span style={{ fontWeight: 'bold' }}>I found Tekie and felt it was the right platform for her to learn programming. She is already  interested in coding and animation. </span>,
                'Tekie wasn\'t in the US market for long but the program incharge was nice enough to go over in detail. Overall it has been a very smooth start, affordable and she loves it. "',
              ]}
            </span>
          ),
          height: 427,
        },
        {
          id: 2,
          childName: 'Medha',
          gradeInfo: 'Grade 6 | Homeschooled | Delhi',
          parentName: 'Sudipto MONDAL',
          testimonial: (
            <span>
              {[
                'The best learning happens when you are not learning, you are playing and enjoying. For Medha, learning has been a pleasant glide, thanks to a warm and interpersonal method of teaching; ',
                <span style={{ fontWeight: 'bold' }}>it's like she is learning from a friend who knows her! She loves the puzzles and other methods used- both experimental and classic. </span>,
                "We would highly recommend you to start your kid's journey into the exciting world of coding with Tekie. Medha is looking forward to her next coding classes!!!",
              ]}
            </span>
          ),
          height: 427,
          studentProfile: require('../../assets/testimonials/medha.jpeg'),
          parentProfile: require('../../assets/testimonials/sudipto.jpg'),
          studentProfileWebp: require('../../assets/testimonials/medha.webp'),
          parentProfileWebp: require('../../assets/testimonials/sudipto.webp'),
        },
      ]
    }
  }

  async componentDidMount() {
    if (window.native && window.native.isElectron) {
      this.props.history.push('/login')
    } else {
      // window.location.reload();
    }
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
    if (this.props.location.state && this.props.location.state.login) {
      this.openLogin()
      this.props.history.replace({
        pathname: this.props.location.pathname,
        state: {}
      });
    }
    this.setUTMParametersToLocalStorage()
    const shouldBanner = getCountryCode() === 'us'
    if (shouldBanner) {
      this.setState({ banner: true, bannerHeight: 50 }, () => {
        // this.scrollReveal()
      })
    }
    await this.fetchFreshChat()
    if (window && window.fcWidget) {
      window.fcWidget.show()
    }
    // this.scrollReveal()
  }

  fetchFreshChat = async () => {
    if (this.props.isLoggedIn) {
      await fetchStudentCurrentStatus(this.props.userId)
    }
    await fetch(`${import.meta.env.REACT_APP_FRESH_DESK_ENDPOINT}/api/v2/solutions/folders/82000450310/articles`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Base64.encode(`${import.meta.env.REACT_APP_FRESH_DESK_KEY}:X`)
      }
    }).then(res => {
      if (res.status === 200) {
        if (res) {
          res.json().then(result => {
            this.setState({ fetchedFaqs: result })
          })
        } else {
          this.setState({ fetchedFaqs: faqs })
        }
      }
    }).catch(err => {
      this.setState({ fetchedFaqs: faqs })
    })
  }


  componentDidUpdate = async () => {
    const { isLoggedIn, studentCurrentStatus, loggedInUser } = this.props
    if (window && window.fcWidget) {
      window.fcWidget.on("widget:opened", () => {
        renderChats({
          isLoggedIn,
          studentCurrentStatus,
          loggedInUser
        })
      })
    }
  }

  componentWillUnmount = () => {
    if (window && window.fcWidget) {
      const { isLoggedIn } = this.props
      if (isLoggedIn) {
        window.fcWidget.setFaqTags({
          tags: ['unregistered'],
          filterType: 'article'
        })
      }
      window.fcWidget.hide()
    }
  }
  getScrollConfig = () => {
    const delays = [0, 100, 200, 250, 300, 350, 400, 450, 500, 600, 700, 750, 800, 850, 900, 950, 1000]
    const distances = [0, 5, 10, 15, 20, 35, 50]
    const durations = [600]
    const scrollConfig = []
    for (const delay of delays) {
      for (const distance of distances) {
        for (const duration of durations) {
          scrollConfig.push([delay, distance, duration])
        }
      }
    }
    return scrollConfig
  }

  scrollReveal() {
    // import('scrollreveal').then(ScrollRevealModule => {
    //   let ScrollReveal = ScrollRevealModule.default
    //   const scrollConfig = this.getScrollConfig()
    //   for (const scroll of scrollConfig) {
    //     ScrollReveal().reveal(`.sr-${scroll[0]}-${scroll[1]}-${scroll[2]}`, {
    //       delay: scroll[0], distance: `${scroll[1]}%`, origin: 'bottom', easing: 'ease-out', duration: scroll[2], mobile: false
    //     })
    //   }
    // })
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

  login = async (phone, countryCode) => {
    try {
      this.setState({ loginLoading: true, phone: phone, countryCode })
      const res = await requestToGraphql(gql`
        mutation {
          loginViaOtp(input: {
            phone: {
              countryCode: "${countryCode}"
              number: "${phone.trim()}"
            }
          }) {
            result
          }
        }`)
      if (res) {
        const result = get(res, 'data.loginViaOtp.result')
        if (result) {
          this.openOTP()
        }
      }
      this.setState({ loginLoading: false })
    } catch (e) {
      if (e.errors && e.errors[0]) {
        if (this.prompt) {
          this.prompt.open(e.errors[0].message, true)
          this.setState({ loginLoading: false })
        }
      }
    }
  }

  closeEnrollmentForm = () => {
    this.props.history.push('/')
  }

  openEnrollmentForm = () => {
    const referralCode = typeof sessionStorage === 'undefined' ? '' : sessionStorage.getItem('referralCode')
    const schoolName = typeof sessionStorage === 'undefined' ? '' : sessionStorage.getItem('schoolName')
    if (referralCode) {
      this.props.history.push('/signup?referralCode=' + referralCode)
    } else if (schoolName) {
      this.props.history.push('/signup?schoolName=' + schoolName)
    } else {
      this.props.history.push('/signup')
    }
  }

  closeClaimed = () => {
    this.setState({ claimed: false, claimedLogin: false })
  }

  openClaimed = () => {
    this.setState({
      enrollmentForm: false,
      loginForm: false,
      OTPForm: false,
      claimed: true
    })
  }

  openClaimedLogin = () => {
    this.setState({
      enrollmentForm: false,
      loginForm: false,
      OTPForm: false,
      claimed: false,
      claimedLogin: true
    })
  }

  topics = (topicsName) => (
    <>
      {topicsName.map(topic => (
        <div className={'landing-page-textContainer'}>
          <div className={'landing-page-bullet'} />
          <div className={'landing-page-featureText'}>{topic}</div>
        </div>
      ))}
    </>
  )

  faqAnswer = (answer) => {
    answer = answer.replaceAll(' dir="ltr"', '')
    answer = answer.replace('<p></p>', '')
    answer = answer.replaceAll('<p><br></p>', '')
    return (
      <div className={'landing-page-textContainer'}>
        <div className={'landing-page-featureText'}>
          {faqParser(answer)}
        </div>
      </div>
    )
  }

  openOTP = () => {
    const params = qs.parse(window.location.search)
    if (Object.keys(params).length > 0) {
      this.props.history.push('/confirm-otp?' + qs.stringify(params))
    } else {
      this.props.history.push('/confirm-otp')
    }
  }

  closeOTP = () => {
    this.props.history.push('/')
  }

  openLogin = () => {
    this.props.history.push('/login')
  }

  closeLogin = () => {
    this.props.history.push('/')
  }

  renderUsDiscountIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 80.527 80.529">
      <g id="discount_ribbon" dataName="discount ribbon" transform="matrix(0.978, -0.208, 0.208, 0.978, -703.041, 144.836)">
        <path id="Path_20752" dataName="Path 20752" d="M65.205,37.8a8.07,8.07,0,0,0,1.7-4.35,8.077,8.077,0,0,0-1.7-4.353,6.563,6.563,0,0,1-.952-1.772,6.8,6.8,0,0,1,.2-2.1,7.847,7.847,0,0,0-.088-4.583A7.906,7.906,0,0,0,61.151,17.3,6.732,6.732,0,0,1,59.565,16a6.768,6.768,0,0,1-.607-1.987A7.886,7.886,0,0,0,57.11,9.8a7.886,7.886,0,0,0-4.221-1.848A6.789,6.789,0,0,1,50.9,7.343a6.745,6.745,0,0,1-1.3-1.587A7.9,7.9,0,0,0,46.263,2.54a5.4,5.4,0,0,0-2.107-.392,13.382,13.382,0,0,0-2.476.3,10.273,10.273,0,0,1-1.725.232,2.035,2.035,0,0,1-.371-.03A6.712,6.712,0,0,1,37.811,1.7,8.076,8.076,0,0,0,33.459,0a8.076,8.076,0,0,0-4.352,1.7,6.693,6.693,0,0,1-1.773.952,2.047,2.047,0,0,1-.372.03,10.328,10.328,0,0,1-1.725-.232,13.4,13.4,0,0,0-2.476-.3,5.4,5.4,0,0,0-2.106.392,7.911,7.911,0,0,0-3.343,3.215,6.766,6.766,0,0,1-1.3,1.587,6.744,6.744,0,0,1-1.986.606A7.882,7.882,0,0,0,9.808,9.8a7.884,7.884,0,0,0-1.848,4.221A6.739,6.739,0,0,1,7.352,16a6.685,6.685,0,0,1-1.586,1.3A7.907,7.907,0,0,0,2.55,20.645a7.839,7.839,0,0,0-.09,4.583,6.817,6.817,0,0,1,.2,2.1A6.616,6.616,0,0,1,1.71,29.1,8.068,8.068,0,0,0,.01,33.45a8.071,8.071,0,0,0,1.7,4.35,6.625,6.625,0,0,1,.952,1.775,6.81,6.81,0,0,1-.2,2.1,7.844,7.844,0,0,0,.089,4.582,7.909,7.909,0,0,0,3.216,3.342,6.706,6.706,0,0,1,1.586,1.3,6.763,6.763,0,0,1,.607,1.985A7.882,7.882,0,0,0,9.807,57.1a7.893,7.893,0,0,0,4.222,1.848,6.725,6.725,0,0,1,1.984.605,6.7,6.7,0,0,1,1.3,1.588,7.9,7.9,0,0,0,3.339,3.216,5.419,5.419,0,0,0,2.107.39,13.382,13.382,0,0,0,2.476-.3,10.312,10.312,0,0,1,1.726-.233,1.861,1.861,0,0,1,.372.032,6.624,6.624,0,0,1,1.773.951,8.067,8.067,0,0,0,4.352,1.7,8.067,8.067,0,0,0,4.352-1.7,6.6,6.6,0,0,1,1.774-.951,1.85,1.85,0,0,1,.371-.032,10.341,10.341,0,0,1,1.725.233,13.3,13.3,0,0,0,2.476.3,5.415,5.415,0,0,0,2.107-.39A7.908,7.908,0,0,0,49.6,61.143a6.73,6.73,0,0,1,1.3-1.588,6.748,6.748,0,0,1,1.985-.605,7.89,7.89,0,0,0,4.223-1.85,7.877,7.877,0,0,0,1.846-4.222,6.773,6.773,0,0,1,.607-1.985,6.694,6.694,0,0,1,1.587-1.3,7.9,7.9,0,0,0,3.215-3.339,7.847,7.847,0,0,0,.089-4.583,6.819,6.819,0,0,1-.2-2.1A6.646,6.646,0,0,1,65.205,37.8Z" transform="translate(715.346 18.807)" fill="#00353a" stroke="#57e1ed" stroke-width="1" />
        <text id="_10_off_" dataName="25% off!" transform="translate(748.938 48.566)" fill="#57e1ed" fontSize="16" fontFamily="Lato-Semibold, Lato" fontWeight="600" letterSpacing="0.04em"><tspan x="-19.484" y="0">{isME() ? '$100' : '25%'}</tspan><tspan x="-15.803" y="22">off!</tspan></text>
      </g>
    </svg>
  )



  renderUSPricing = () => {
    return (
      <>
        <div className={'landing-page-container'}>
          <div className={cx('landing-page-divider', 'landing-page-dividerTopBottom')}></div>
        </div>
        <div className={cx('landing-page-title', 'landing-page-textCenter', 'landing-page-uniqueEpisodes', 'landing-page-demoPackTitle', 'sr-100-10-600')}>Pricing</div>
        <div className={cx('landing-page-demoPackContainer', 'landing-page-displayOnlySmall')}>
          <div className={cx('landing-page-pricingCheckboxText', 'sr-200-15-600')} style={{ textAlign: 'center' }}>
            {isME() ? (
              <>Classes can be canceled/paused anytime with no additional fees.</>
            ) : (
              <>Sign up now and get an early-bird discount of 25%. Cancel or pause anytime with no additional fees.</>
            )}
          </div>
          <div className={'landing-page-usPricingContainer'}>
            <div className={'landing-page-usDiscountIcon'}>
              {/* {this.renderUsDiscountIcon()} */}
            </div>
            <div className={cx('landing-page-usPricingWrapper', 'sr-200-10-600')}>
              <div className={'landing-page-pricingRow'}>
                <div className={'landing-page-usPricingIconContainer'}>
                  <div className={'landing-page-usPricingIconWrapper'}>
                    <div className={'landing-page-usPricingIcon'}></div>
                  </div>
                </div>
                <div className={cx('landing-page-usPricingheading', 'sr-300-15-600')}>Live 1:1 Classes</div>
              </div>
              <div className={'landing-page-priceRow'}>
                {isME() ? (
                  <>
                    <div className={'landing-page-usPriceOldText'}><span style={{ opacity: 0.5 }}>$ 699</span></div>
                  </>
                ) : (
                  <>
                    <div className={'landing-page-usPriceOldText'}><span style={{ opacity: 0.5, textDecoration: 'line-through' }}>$ 800</span> <span className={'landing-page-usPriceNewText'}>&nbsp; $ 600</span></div>
                  </>
                )}
              </div>
              <div className={'landing-page-usPricingText'}>for 39 classes</div>
              <div className={'landing-page-hrPricing'}></div>
              <div className={'landing-page-pricingCheckpoint'}>
                <div className={'landing-page-pricingCheckpointRow'}>
                  <div className={'landing-page-pricingCheckbox'}>
                    <svg width="100%" height="100%" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path opacity="0.8" d="M29.8771 3.28144L11.2766 21.882C11.1127 22.0458 10.8475 22.0458 10.684 21.882L0.122591 11.3202C-0.0408637 11.1571 -0.0408637 10.8919 0.122591 10.728L2.68887 8.16174C2.85271 7.99828 3.11799 7.99828 3.28144 8.16174L10.9807 15.8606L26.7186 0.122591C26.8829 -0.0408637 27.1474 -0.0408637 27.3112 0.122591L29.8771 2.68887C30.041 2.85233 30.041 3.11722 29.8771 3.28144Z" fill="#34E4EA" />
                    </svg>
                  </div>
                  <div className={'landing-page-usPricingText'} style={{ fontStyle: 'normal' }}>A dedicated mentor to guide the student throughout</div>
                </div>
                <div className={'landing-page-pricingCheckpointRow'}>
                  <div className={'landing-page-pricingCheckbox'}>
                    <svg width="100%" height="100%" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path opacity="0.8" d="M29.8771 3.28144L11.2766 21.882C11.1127 22.0458 10.8475 22.0458 10.684 21.882L0.122591 11.3202C-0.0408637 11.1571 -0.0408637 10.8919 0.122591 10.728L2.68887 8.16174C2.85271 7.99828 3.11799 7.99828 3.28144 8.16174L10.9807 15.8606L26.7186 0.122591C26.8829 -0.0408637 27.1474 -0.0408637 27.3112 0.122591L29.8771 2.68887C30.041 2.85233 30.041 3.11722 29.8771 3.28144Z" fill="#34E4EA" />
                    </svg>
                  </div>
                  <div className={'landing-page-usPricingText'} style={{ fontStyle: 'normal' }}>Lifetime access to all learning resources</div>
                </div>
                <div className={'landing-page-pricingCheckpointRow'}>
                  <div className={'landing-page-pricingCheckbox'}>
                    <svg width="100%" height="100%" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path opacity="0.8" d="M29.8771 3.28144L11.2766 21.882C11.1127 22.0458 10.8475 22.0458 10.684 21.882L0.122591 11.3202C-0.0408637 11.1571 -0.0408637 10.8919 0.122591 10.728L2.68887 8.16174C2.85271 7.99828 3.11799 7.99828 3.28144 8.16174L10.9807 15.8606L26.7186 0.122591C26.8829 -0.0408637 27.1474 -0.0408637 27.3112 0.122591L29.8771 2.68887C30.041 2.85233 30.041 3.11722 29.8771 3.28144Z" fill="#34E4EA" />
                    </svg>
                  </div>
                  <div className={'landing-page-usPricingText'} style={{ fontStyle: 'normal' }}>Coding Syllabus that follows student’s pace & style</div>
                </div>
                <div className={'landing-page-pricingCheckpointRow'}>

                  <div className={'landing-page-pricingCheckbox'}>
                    <svg width="100%" height="100%" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path opacity="0.8" d="M29.8771 3.28144L11.2766 21.882C11.1127 22.0458 10.8475 22.0458 10.684 21.882L0.122591 11.3202C-0.0408637 11.1571 -0.0408637 10.8919 0.122591 10.728L2.68887 8.16174C2.85271 7.99828 3.11799 7.99828 3.28144 8.16174L10.9807 15.8606L26.7186 0.122591C26.8829 -0.0408637 27.1474 -0.0408637 27.3112 0.122591L29.8771 2.68887C30.041 2.85233 30.041 3.11722 29.8771 3.28144Z" fill="#34E4EA" />
                    </svg>
                  </div>
                  <div className={'landing-page-usPricingText'} style={{ fontStyle: 'normal' }}>Active Student Community to aid peer to peer learning</div>
                </div>
              </div>
              {/* <div className={'landing-page-hrPricing'}></div> 
              <div className={cx('landing-page-siblingDiscountText', 'sr-850-15-600')}><span style={{ color: '#34E4EA', fontWeight: '600' }}>Early Bird Offer valid till August 31</span></div> */}
              {/* <div
                className={'landing-page-usPricingBookClass'}
                onClick={() => {
                  this.props.history.push('/signup')
                }}
                onMouseOver={() => { this.setState({ usPricingTextOver: true })}}
                onMouseOut={() => { this.setState({ usPricingTextOver: false })}}
              >book a free class</div> */}
              {/* <div className={'landing-page-siblingDiscountText'}><span style={{ color: '#34E4EA' }}>Sibling Discount:</span> 10% off for 2nd sibling</div> */}
            </div>
            <motion.div className={cx('landing-page-usPricingEffect1', 'sr-300-15-600')} initial={{ width: '95%', top: '2.5%', left: '2.5%' }} animate={this.state.usPricingTextOver ? { width: '95%', top: '1.5%', left: '2.5%' } : { width: '95%', top: '2.5%', left: '2.5%' }}></motion.div>
            <motion.div className={cx('landing-page-usPricingEffect2', 'sr-400-20-600')} initial={{ width: '90%', top: '5%', left: '5%' }} animate={this.state.usPricingTextOver ? { width: '90%', top: '3%', left: '5%' } : { width: '90%', top: '5%', left: '5%' }}></motion.div>
          </div>
        </div>
        <div className={cx('landing-page-demoPackContainer', 'landing-page-displayOnlyBig', 'landing-page-flexRowPricing')}>
          <div className={'landing-page-usPricingTextContainer'}>
            <div className={cx('landing-page-pricingCheckboxText', 'sr-200-15-600')}>
              {isME() ? (
                <>Classes can be canceled/paused anytime with no additional fees.</>
              ) : (
                <>Sign up now and get an early-bird discount of 25%. Cancel or pause anytime with no additional fees.</>
              )}
            </div>
            <div className={'landing-page-pricingCheckpoint'}>
              <div className={cx('landing-page-pricingCheckpointRow', 'sr-200-20-600')}>
                <div className={'landing-page-pricingCheckbox'}>
                  <svg width="100%" height="100%" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.8" d="M29.8771 3.28144L11.2766 21.882C11.1127 22.0458 10.8475 22.0458 10.684 21.882L0.122591 11.3202C-0.0408637 11.1571 -0.0408637 10.8919 0.122591 10.728L2.68887 8.16174C2.85271 7.99828 3.11799 7.99828 3.28144 8.16174L10.9807 15.8606L26.7186 0.122591C26.8829 -0.0408637 27.1474 -0.0408637 27.3112 0.122591L29.8771 2.68887C30.041 2.85233 30.041 3.11722 29.8771 3.28144Z" fill="#34E4EA" />
                  </svg>
                </div>
                <div className={'landing-page-usPricingText'} style={{ fontStyle: 'normal' }}>A dedicated mentor to guide the student throughout</div>
              </div>
              <div className={cx('landing-page-pricingCheckpointRow', 'sr-250-15-600')}>
                <div className={'landing-page-pricingCheckbox'}>
                  <svg width="100%" height="100%" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.8" d="M29.8771 3.28144L11.2766 21.882C11.1127 22.0458 10.8475 22.0458 10.684 21.882L0.122591 11.3202C-0.0408637 11.1571 -0.0408637 10.8919 0.122591 10.728L2.68887 8.16174C2.85271 7.99828 3.11799 7.99828 3.28144 8.16174L10.9807 15.8606L26.7186 0.122591C26.8829 -0.0408637 27.1474 -0.0408637 27.3112 0.122591L29.8771 2.68887C30.041 2.85233 30.041 3.11722 29.8771 3.28144Z" fill="#34E4EA" />
                  </svg>
                </div>
                <div className={'landing-page-usPricingText'} style={{ fontStyle: 'normal' }}>Lifetime access to all learning resources</div>
              </div>
              <div className={cx('landing-page-pricingCheckpointRow', 'sr-300-15-600')}>
                <div className={'landing-page-pricingCheckbox'}>
                  <svg width="100%" height="100%" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.8" d="M29.8771 3.28144L11.2766 21.882C11.1127 22.0458 10.8475 22.0458 10.684 21.882L0.122591 11.3202C-0.0408637 11.1571 -0.0408637 10.8919 0.122591 10.728L2.68887 8.16174C2.85271 7.99828 3.11799 7.99828 3.28144 8.16174L10.9807 15.8606L26.7186 0.122591C26.8829 -0.0408637 27.1474 -0.0408637 27.3112 0.122591L29.8771 2.68887C30.041 2.85233 30.041 3.11722 29.8771 3.28144Z" fill="#34E4EA" />
                  </svg>
                </div>
                <div className={'landing-page-usPricingText'} style={{ fontStyle: 'normal' }}>Coding Syllabus that follows student’s pace & style</div>
              </div>
              <div className={cx('landing-page-pricingCheckpointRow', 'sr-350-15-600')}>
                <div className={'landing-page-pricingCheckbox'}>
                  <svg width="100%" height="100%" viewBox="0 0 30 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.8" d="M29.8771 3.28144L11.2766 21.882C11.1127 22.0458 10.8475 22.0458 10.684 21.882L0.122591 11.3202C-0.0408637 11.1571 -0.0408637 10.8919 0.122591 10.728L2.68887 8.16174C2.85271 7.99828 3.11799 7.99828 3.28144 8.16174L10.9807 15.8606L26.7186 0.122591C26.8829 -0.0408637 27.1474 -0.0408637 27.3112 0.122591L29.8771 2.68887C30.041 2.85233 30.041 3.11722 29.8771 3.28144Z" fill="#34E4EA" />
                  </svg>
                </div>
                <div className={'landing-page-usPricingText'} style={{ fontStyle: 'normal' }}>Active Student Community to aid peer to peer learning</div>
              </div>
            </div>
          </div>
          <div className={'landing-page-usPricingContainer'}>
            <div className={cx('landing-page-usDiscountIcon', 'sr-1000-0-600')}>
              {/* {this.renderUsDiscountIcon()} */}
            </div>
            <div className={cx('landing-page-usPricingWrapper', 'sr-400-5-600')}>
              <div className={cx('landing-page-pricingRow', 'sr-700-10-600')}>
                <div className={'landing-page-usPricingIconContainer'}>
                  <div className={'landing-page-usPricingIconWrapper'}>
                    <div className={'landing-page-usPricingIcon'}></div>
                  </div>
                </div>
              </div>
              <div className={'landing-page-usPricingheading'}>Live 1:1 Classes</div>
              <div className={cx('landing-page-usPricingText', 'sr-800-10-600')}>39 CLASSES</div>
              <div className={cx('landing-page-priceRow', 'sr-750-15-600')}>
                {isME()
                  ? <div className={'landing-page-usPriceOldText'}><span style={{ opacity: 0.5 }}>$ 699</span></div>
                  : <div className={'landing-page-usPriceOldText'}><span style={{ opacity: 0.5, textDecoration: 'line-through' }}>$ 800</span> <span className={'landing-page-usPriceNewText'}>&nbsp; $ 600</span></div>
                }
              </div>
              {/* <div className={'landing-page-hrPricing'}></div>  */}
              <div className={cx('landing-page-usPricingText', 'sr-800-10-600')}>{'$18 per class'}</div>
              {/* <div className={cx('landing-page-siblingDiscountText', 'sr-850-15-600')}><span style={{ color: '#34E4EA', fontWeight: '600' }}>Early Bird Offer valid till August 31</span></div> */}
            </div>
            <motion.div className={cx('landing-page-usPricingEffect1', 'sr-500-10-600')} initial={{ width: '95%', top: '2.5%', left: '2.5%' }} animate={this.state.usPricingTextOver ? { width: '95%', top: '1.5%', left: '2.5%' } : { width: '95%', top: '2.5%', left: '2.5%' }}></motion.div>
            <motion.div className={cx('landing-page-usPricingEffect2', 'sr-600-15-600')} initial={{ width: '90%', top: '5%', left: '5%' }} animate={this.state.usPricingTextOver ? { width: '90%', top: '3%', left: '5%' } : { width: '90%', top: '5%', left: '5%' }}></motion.div>
          </div>
        </div>
      </>
    )
  }

  renderEpisode = (src, srcLegacy, link, title, revealTitle, revealDescription, setHoverState, hoverState, margin = true) => {
    return (
      <div
        className={cx('landing-page-episode-cardEpisodes', margin && 'landing-page-marginRightOnlyBigMoreAboutCourse', !margin && 'landing-page-marginEpisodeCard', 'sr-300-10-600')}
        style={{ position: 'relative' }}
        onMouseOver={() => {
          if (typeof window === 'undefined' ? true : (window.innerWidth > 899)) {
            this.setState({ [setHoverState]: true })
          }
        }}
        onMouseOut={() => {
          if (typeof window === 'undefined' ? true : window.innerWidth > 899) {
            this.setState({ [setHoverState]: false })
          }
        }}
      >
        <motion.div animate={this.state[hoverState] ? { opacity: 0 } : { opacity: 1 }} style={{ width: '100%' }}>
          <ImageBackground
            alt={title}
            onClick={() => this.props.history.push(link)}
            className={cx('landing-page-episode-cardEpisodes')}
            src={src}
            srcLegacy={srcLegacy}
          >
            <div style={{ width: '100%', height: '100%' }}>
              <div className={cx('landing-page-episode-cardEpisodes', 'landing-page-episode-body')} style={{ backgroundColor: 'transparent' }}>
                <div>
                  <motion.div
                    className={cx('landing-page-episode-episode', 'landing-page-fullEpisodeVideoTitle', 'landing-page-episodeVideoTitleFirstM')} style={{ textTransform: 'uppercase' }}
                    animate={this.state[setHoverState] ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  >
                    {title}
                  </motion.div>
                </div>
              </div>
            </div>
            <div className={'landing-page-moreAboutPlayButtonWrapper'}>
              <div className={'landing-page-moreAboutThisCoursePlayButton'} style={{ pointerEvents: 'none' }}>
                <Play />
              </div>
            </div>
          </ImageBackground>
        </motion.div>
        {typeof window === 'undefined' ? true : window.innerWidth > 899 && (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <motion.div
              className={cx('landing-page-episode-episode', 'landing-page-episode-episodeReveal')}
              style={{ textTransform: 'uppercase' }}
              animate={this.state[hoverState] ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={this.state[hoverState] ? {
                delay: 0.2
              } : { delay: 0 }}
            >
              {revealTitle}
            </motion.div>
            <motion.div
              className={'landing-page-descriptionTextReveal'}
              animate={this.state[hoverState] ? { opacity: 0.7, x: 0 } : { opacity: 0, x: -30 }}
              transition={this.state[hoverState] ? {
                delay: 0.2
              } : { delay: 0 }}
            >
              {revealDescription}
            </motion.div>
          </div>
        )}
      </div>
    )
  }

  renderEpisodes = () => {
    return (
      <>
        <div className={cx('landing-page-title', 'landing-page-textCenter', 'landing-page-whyChooseUs', 'sr-100-10-600')}>Get a glimpse of our series</div>
        <div className={cx('landing-page-container', 'landing-page-moreAboutThisCourseContainer', 'landing-page-noPaddingForMobile')}>
          <div className={'landing-page-containerOnlyForBig'}>
            <div className={'landing-page-rowFlex'} style={{ justifyContent: 'center' }}>
              <>
                {this.renderEpisode(
                  require('../../assets/ep1Thumb_lossless.webp'),
                  require('../../assets/ep1Thumb.png'),
                  '/intro-to-programming',
                  'Episode 1 - Intro to Programming',
                  'Episode 12 - If Else Statements',
                  'Theo and his friends on Oak help out the well-known detective \'Jake Fletcher\' in one of his bizarre cases. This episode covers the basics of If-else statements in programming through a noir-style detective game.',
                  'episode12Hover',
                  'episode1Hover'
                )}
                {this.renderEpisode(
                  require('../../assets/ep12Thumb_lossless.webp'),
                  require('../../assets/ep12Thumb.png'),
                  '/if-else-statements',
                  'Episode 12 - If Else Statements',
                  'Episode 1 - Intro to Programming',
                  'Meet Theo, a curious teen, who goes on an adventure involving various sci-fi coding activities. This is the first of our many episodes that cover the basics of programming. It starts off with the story, so skip to 8:32 if you want to dive into the teaching right away!',
                  'episode1Hover',
                  'episode12Hover',
                  false
                )}
              </>
            </div>
          </div>
        </div>
        <div className={'landing-page-container'}>
          <div className={cx('landing-page-divider', 'landing-page-dividerTopBottom')}></div>
        </div>
      </>
    )
  }


  render() {
    const { isDesktop, fetchedFaqs } = this.state
    const shouldCompareCourses = isFeatureEnabled('compareCourses')
    const shouldUSPricing = isFeatureEnabled('usPricing')
    const shouldFeaturedIn = isFeatureEnabled('featuredIn')

    return <></>
    return (
      <div style={{ overflowX: 'hidden' }}>
        <Style>
          {`
            ::-webkit-scrollbar-thumb {
              background-color: rgba(52, 228, 234, 0.3);
              border-radius: 0px;
            }
          `}
        </Style>
        <Helmet>
          <link rel="canonical" href="https://www.tekie.in" />
          <title>Tekie - Live coding classes for kids with the world's first educational series.</title>
          <meta name="description" content="Tekie is the world’s first educational series for coding that provides one of the best live online coding classes for kids."></meta>
          <meta name="keywords" content="tekie,tekie coding,tekie in,tekie app,tekie coding classes,tekie review,tekie classes,tekie india,tekie online coding,tekie online class,tekie online demo,python for kids,coding for kids,best python course for kids,python coding for kids, online coding platform for python, python online course for kids,best coding classes for kids,live online coding classes for kids, best coding classes for kids, best programming courses for kids,online coding programs for kids,programming classes for kids" />
          <script type="application/ld+json">
            {googleFAQ}
          </script>
        </Helmet>
        <Hero openEnrollmentForm={this.openEnrollmentForm} history={this.props.history} />
        <div style={{
          width: '100%',
          backgroundColor: '#00171F'
        }}>
          <div className={cx('landing-page-container', 'landing-page-paddingTopBig')}>
            <div className={'landing-page-rowForBig'}>
              <div style={{ flex: 1 }} className='about-tekie-scroll'>
                <h2 className={cx('landing-page-title', 'sr-300-50-600')}>About Tekie</h2>
                <div className={cx('landing-page-text', 'sr-250-15-600')}>
                  We bring the art of storytelling to make learning
                  a movie-like experience. Starting with first of
                  its kind animated sitcom series to teach basics
                  of programming, live 1:1 to students of age 10+.{' '}
                  {/* <div className={cx('landing-page-marginOnlySmall', 'landing-page-blockOnlySmall')}></div> */}
                  {/* <br className={'landing-page-blockOnlySmall'} /> */}
                  We are on a mission to train innovators and
                  entrepreneurs of next-generation on the right
                  t skills they need for the future.
                </div>
              </div>
              <div className={cx('landing-page-tekieAnimated', 'sr-500-5-600')}>
                <div className={cx('landing-page-tekieShowCaseLogo', 'landing-page-displayOnlyBig')}></div>
                {/* <video style={{
                  width: '100%',
                  height: '100%',
                }} playsinline muted autoPlay loop>
                    <source src={require('../../assets/tekielogo.mp4')} type="video/mp4"  />
                </video> */}
              </div>
            </div>
            <div className={cx('landing-page-divider', 'landing-page-dividerTop')}></div>
            <h2 className={cx('landing-page-takingEnrollment', 'sr-250-35-600')}>
              {/* Enroll Now to the<br className={'landing-page-displayOnlySmall'} /> Best Coding Classes for Kids */}
              {getCountryCode() === 'us' ? (
                <span style={{ position: 'relative' }}>
                  <>
                    Grab Our Early Bird<br className={'landing-page-displayOnlySmall'} /> Discount
                    <div className={'landing-page-earlyBirdDiscountIcon'}>
                      {this.renderUsDiscountIcon()}
                    </div>
                  </>
                </span>
              ) : (
                <span>Kickstart your child's<br className={'landing-page-displayOnlySmall'} /> coding journey</span>
              )}
            </h2>
            <div className={cx('landing-page-title2', 'sr-250-15-600')}>
              Intro to Coding
            </div>
            <div className={cx('landing-page-enrollContainerOnlyBig', 'sr-250-15-600')}>
              <div style={{
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div className={'landing-page-button'} onClick={() => {
                  this.openEnrollmentForm()
                  enrollNowGA("Just After About Tekie")
                }}>
                  <span>Enroll Now</span>
                </div>
              </div>
            </div>
            <div className={cx('landing-page-divider', 'landing-page-dividerBottom')}></div>
            <div className={'landing-page-rowForBig'}>
              <div style={{ flex: 1 }}>
                <h2 className={cx('landing-page-title', 'sr-200-5-600')}>About <br className={'landing-page-blockOnlySmall'} /> Intro To Coding</h2>
                <div className={cx('landing-page-text', 'landing-page-marginBottom36', 'sr-300-15-600')}>
                  Most students over age 10 face a real challenge when they start coding or move from block-based to real text-based coding. This course is designed to help you master the basics. With our high-quality episodes, we guide you through examples married with real and abstract sci-fi activities and break all the programming concepts.</div>
              </div>
              <div style={{ flex: 1 }}></div>
            </div>




            <div
              className={cx(
                'landing-page-enrollmentContainer',
                'landing-page-courseFeatures'
              )}
              style={{ position: 'static', padding: 0, boxShadow: 'none' }}
            >
              <div className={cx('landing-page-enrollmentBody', 'landing-page-pricingBody')} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className={'landing-page-pricingWrapper'}>
                    <>
                      <Feature
                        title="40 Sessions"
                        text="Videos and lesson workbooks made by the best teachers, period."
                        icon={require('../../assets/playBlue.svg')}
                        iconClass={'landing-page-playIcon'}
                      />
                      <Feature
                        title="Live Classes"
                        text="Our instructors thoroughly discuss and show you how to analyze algorithms."
                        icon={require('../../assets/camera.svg')}
                        iconClass={'landing-page-cameraIcon'}
                      />
                      <Feature
                        title="Projects"
                        text="Over 900 coding exercises to practice with hands-on projects."
                        icon={require('../../assets/pencil.svg')}
                        iconClass={'landing-page-pencilIcon'}
                      />
                      <Feature
                        title="DIY Activities"
                        text="Do-it-yourself coding assignments after every live session."
                        icon={require('../../assets/diy.svg')}
                        iconClass={'landing-page-diyIcon'}
                      />
                      <Feature
                        title="Companion App"
                        icon={require('../../assets/learningApp.svg')}
                        text="Experience our gamified learning journeys."
                        iconClass={'landing-page-learningApp'}
                      />
                      <Feature
                        title="Lifetime Access"
                        text="All the future content we continue to add is always yours."
                        icon={require('../../assets/right.svg')}
                        iconClass={'landing-page-rightIcon'}
                      />
                      <Feature
                        title="Anytime, Anywhere"
                        text="Learn on your own terms, at your own pace."
                        icon={require('../../assets/devices.svg')}
                        iconClass={'landing-page-devicesIcon'}
                      />
                      <Feature
                        title="100% Refund"
                        text="Claim a 100% refund for all unused classes at any time during the course."
                        icon={require('../../assets/security.svg')}
                        iconClass={'landing-page-securityIcon'}
                      />
                    </>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={'landing-page-container'}>
            <div className={cx('landing-page-divider', 'landing-page-dividerBottom', 'landing-page-dividerWhyChooseUs')}></div>
          </div>
          <div className={cx('landing-page-title', 'landing-page-textCenter', 'landing-page-whyChooseUs', 'sr-200-10-600')}>Why choose us?</div>
          <div className={cx('landing-page-container', 'landing-page-moreAboutThisCourseContainer')}>
            <div className={'landing-page-containerOnlyForBig'}>
              <div className={'landing-page-rowFlex'}>
                <ImageBackground
                  onClick={() => this.props.history.push('/tekie-tour')}
                  alt='What is Tekie?'
                  className={cx('landing-page-episode-card', 'landing-page-marginRightOnlyBigMoreAboutCourse', 'landing-page-moreAboutThisCard', 'sr-200-5-600')}
                  src={require('../../assets/whatIsTekieThumb_lossless.webp')}
                  srcLegacy={require('../../assets/whatIsTekieThumb.png')}
                >
                  <div style={{ width: '100%', height: '100%' }}>
                    <div className={cx('landing-page-episode-card', 'landing-page-episode-body', 'landing-page-moreAboutThisCard')} style={{ backgroundColor: 'transparent' }}>
                      <div>
                        <div className={cx('landing-page-episode-episode', 'landing-page-episodeVideoTitle', 'landing-page-episodeVideoTitleFirstM', 'sr-300-10-600')} style={{ textTransform: 'uppercase' }}>
                          Take a tour of Tekie's session
                        </div>
                        <div className={cx('landing-page-episode-description', 'landing-page-moreAboutThisDescription', 'sr-400-15-600')}>
                          Dive in and see what goes on in a session
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={cx('landing-page-moreAboutPlayButtonWrapper', 'sr-500-0-600')}>
                    <div className={'landing-page-moreAboutThisCoursePlayButton'}>
                      <Play />
                    </div>
                  </div>
                </ImageBackground>

                <ImageBackground
                  onClick={() => this.props.history.push('/tekie-story-naman-sonpar')}
                  className={cx('landing-page-episode-card', 'landing-page-moreAboutThisCardNoneMarginBottom', 'landing-page-moreAboutThisCard', 'sr-500-5-600')}
                  src={require('../../assets/namanSonparThumb_lossless.webp')}
                  alt='Tekie Story: Naman Sonpar'
                  srcLegacy={require('../../assets/namanSonparThumb.png')}
                >
                  <div style={{ width: '100%', height: '100%' }}>
                    <div className={cx('landing-page-episode-card', 'landing-page-episode-body', 'landing-page-moreAboutThisCard')}>
                      <div>
                        <div className={cx('landing-page-episode-episode', 'landing-page-episodeVideoTitle', 'sr-600-15-600')} style={{ textTransform: 'uppercase' }}>
                          Tale of our student
                        </div>
                        <div className={cx('landing-page-episode-description', 'landing-page-moreAboutThisDescription', 'sr-700-15-600')}>
                          See how students find Tekie radically different from other coding platforms
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={cx('landing-page-moreAboutPlayButtonWrapper', 'sr-800-0-600')}>
                    <div className={'landing-page-moreAboutThisCoursePlayButton'}>
                      <Play />
                    </div>
                  </div>
                </ImageBackground>
              </div>
            </div>
          </div>

          <div className={'landing-page-container'}>
            <div className={cx('landing-page-divider', 'landing-page-dividerTopBottom')}></div>
          </div>
          <div className={cx('landing-page-title', 'landing-page-textCenter', 'landing-page-uniqueEpisodes', 'landing-page-ourResultsH1', 'sr-200-10-600')}>Our Result</div>
          <div className={cx('landing-page-container', 'landing-page-ourResultsContainer')}>
            <div className={'landing-page-container', 'landing-page-ourResultsContainer'}>
              <div className={'landing-page-ourResultsRow'}>
                <div className={'landing-page-ourResultsBody'}>
                  <div className={cx('landing-page-ourResultsTitle', 'sr-300-15-600')}>Meet Sanatan Chaudhary</div>
                  <div className={cx('landing-page-ourResultsDescription', 'sr-400-20-600')}>
                    Sanatan is our in-house coding prodigy who ranked as a <a target='_blank' href='https://codein.withgoogle.com/archive/2017/' style={{ fontWeight: 'bold', color: 'white' }}>Top 2 finalist (Sugar Labs)</a>
                    {' '}in Google’s Code-In competition (now defunct).
                    He set out on the coding journey at a young age and carved a unique career path.
                    Tekie has been an instrumental part of his journey.
                    Sanatan is a testament to Tekie's belief in process-focused learning— that with the right learning environment
                    you can even find yourself tackling challenges at tech giants like Google!
                  </div>
                </div>
                <ImageBackground
                  alt='Sanatan Kumar: Top 2 Finalist in GCI'
                  className={cx('landing-page-ourResultsThumb', 'sr-500-10-600')}
                  src={require('../../assets/sanatanCodeInThumb_lossless.webp')}
                  srcLegacy={require('../../assets/sanatanCodeInThumb.png')}
                  onClick={() => { typeof window !== 'undefined' && window.open('https://codein.withgoogle.com/archive/2017/') }}
                ></ImageBackground>
              </div>
            </div>
          </div>
          {!shouldUSPricing && (
            <>

              <div className={'landing-page-container'}>
                <div className={cx('landing-page-divider', 'landing-page-dividerTopBottom')}></div>
              </div>

              <div className={'landing-page-pricingInfoWrapper'}>
                <h2 className={cx('landing-page-title', 'landing-page-textCenter', 'landing-page-gradeExploreTitle', 'sr-200-5-600')} style={{ position: 'relative' }}>
                  {/* <div className={'landing-page-discountTag'}></div> */}
                </h2>
                <div className={'landing-page-pricingInfoContainer'}>
                  <div className={'landing-page-pricingMobileWrapper'}>
                    <div className={cx('landing-page-pricingBulletContainer', 'sr-300-10-600')}>
                      <div className={'landing-page-pricingBullet'}></div>
                      <div className={'landing-page-pricingCheckboxText'}>Clarify all your doubts on the go!</div>
                    </div>
                    <div className={cx('landing-page-pricingBulletContainer', 'sr-400-10-600')}>
                      <div className={'landing-page-pricingBullet'}></div>
                      <div className={'landing-page-pricingCheckboxText'}>Book & Reschedule Anytime!</div>
                    </div>
                    <div className={cx('landing-page-pricingBulletContainer', 'sr-500-10-600')} style={{ marginRight: 0 }}>
                      <div className={'landing-page-pricingBullet'}></div>
                      <div className={'landing-page-pricingCheckboxText'}>Easily re-visit all your past sessions!</div>
                    </div>
                  </div>
                </div>

                <div className={'landing-page-pricingContainer'}>
                  <div className={cx('landing-page-pricingOptionContainer', 'sr-300-10-600')}>
                    <div className={'landing-page-pricing11Icon'}></div>
                    <div className={'landing-page-pricingOptionTitle'}>40 Classes</div>
                    <div className={'landing-page-pricingOptionPriceText'}>
                      {isME() ? '$ 600' : '₹ 30,000'}
                    </div>
                    <div className={'landing-page-pricingPerClass'}>{isME() ? '$15' : '₹750'} per class</div>
                  </div>
                  <div className={'landing-page-line'}></div>

                  <div className={cx('landing-page-pricingOptionContainer', 'sr-300-10-600')}>
                    <div className={'landing-page-pricing11Icon'}></div>
                    <div className={'landing-page-pricingOptionTitle'}>80 Classes</div>
                    <div className={'landing-page-pricingOptionPriceText'}>
                      {isME() ? '$ 1,160' : '₹ 58,000'}
                    </div>
                    <div className={'landing-page-pricingPerClass'}>{isME() ? '$14.5' : '₹725'} per class</div>
                  </div>
                  <div className={'landing-page-line'}></div>

                  <div className={cx('landing-page-pricingOptionContainer', 'sr-300-10-600')}>
                    <div className={'landing-page-pricing11Icon'}></div>
                    <div className={'landing-page-pricingOptionTitle'}>160 Classes</div>
                    <div className={'landing-page-pricingOptionPriceText'}>
                      {isME() ? '$ 2,240' : '₹ 1,10,400'}
                    </div>
                    <div className={'landing-page-pricingPerClass'}>{isME() ? '$14' : '₹690'} per class</div>
                  </div>

                  {/* <div className={'landing-page-line'}></div> */}

                  {/* <div className={cx('landing-page-pricingOptionContainer', 'sr-300-10-600')}>
                      <div className={'landing-page-pricing12Icon'}></div>
                      <div className={'landing-page-pricingOptionTitle'}>Live 1:2 Classes</div>
                      <div className={'landing-page-pricingOptionPriceText'}>
                        <span className={'landing-page-oldPriceText'}>₹ 23,000</span> ₹ 21,275
                      </div>
                      <div className={'landing-page-pricingPerClass'}>₹546 per class</div>
                    </div> */}

                  {/* <div className={'landing-page-line'}></div> */}

                  {/* <div className={cx('landing-page-pricingOptionContainer', 'sr-300-10-600')}>
                    <div className={'landing-page-pricing13Icon'}></div>
                    <div className={'landing-page-pricingOptionTitle'}>Live 1:3 Classes</div>
                    <div className={'landing-page-pricingOptionPriceText'}>
                      ₹ 20,000
                    </div>
                    <div className={'landing-page-pricingPerClass'}>₹500 per class</div>
                  </div> */}
                </div>

                <div className={cx('landing-page-freeSessionButton', 'sr-350-10-600')} onClick={() => {
                  enrollNowGA("Book a free class under pricing")
                  this.openEnrollmentForm()
                }} style={{
                  alignItems: 'center'
                }}>
                  <span>Book a free class</span>
                </div>
              </div>
            </>
          )}

          {shouldUSPricing && this.renderUSPricing()}

          {(shouldCompareCourses &&
            <><div className={'landing-page-container'}>
              <div className={cx('landing-page-divider', 'landing-page-dividerTopBottom')}></div>
            </div>

              <h2 className={cx('landing-page-title', 'landing-page-textCenter', 'landing-page-whatsCoveredTitle', 'sr-100-10-600')}>Compare Courses</h2>
              <div className={'landing-page-container', 'landing-page-noPaddingForMobile'}>
                <div className={cx('landing-page-container', 'landing-page-noPaddingForMobile')}>
                  <div className={cx('landing-page-container', 'landing-page-noPaddingForMobile')}>
                    <div className={cx('landing-page-container', 'landing-page-noPaddingForMobile')}>
                      <div className={'landing-page-compareCoursesContainer'}>
                        <div className={'landing-page-compareCoursesBody'}>
                          <div className={'landing-page-compareCoursesRow'}>
                            <div className={'landing-page-compareCourseHeadLeft'}>
                              <div className={cx('landing-page-compareTitle', 'sr-200-10-600')} style={{ textAlign: 'center' }}>Traditional courses <br /> on other Platforms</div>
                            </div>
                            <div className={'landing-page-compareCourseHeadRight'}>
                              <div className={cx('landing-page-compareTitle', 'sr-300-10-600')}>Tekie: Intro to Coding</div>
                            </div>
                          </div>
                          <div className={'landing-page-compareCoursesRow'}>
                            {/* <div className={cx('landing-page-compareCourseBodyLeft', 'sr-100-5-600')}>
                          <div className={cx('landing-page-compareTitleBody', 'sr-300-10-600')}>{getCountryCode() === 'in' ? <><span>Lowest cost </span><br/><span>offering per class</span></> : 'Cost Per Course'}</div>
                          <div className={cx('landing-page-compareTextBodyLeft', 'sr-300-15-600')}>{getCountryCode() === 'in' ? '₹700/- on average for each class' : '$2500 on average for 30 live classes'}</div>
                        </div> */}
                            {/* <div className={cx('landing-page-compareCourseBodyRight', 'sr-100-5-600')}>
                          <div className={cx('landing-page-compareTitleBody', 'landing-page-displayOnlySmall', 'sr-300-10-600')}>{getCountryCode() === 'in' ? <><span>Lowest cost </span><br/><span>offering per class</span></> : 'Cost Per Course'}</div>
                          <div className={cx('landing-page-compareTextRightText', 'sr-300-15-600')}>{getCountryCode() === 'in'
                            ? 'As low as ₹500/- per class'
                            : isME()
                              ? '$599'
                              : '$600'
                          }</div>
                        </div> */}
                          </div>
                          <div className={'landing-page-compareCoursesRow'}>
                            <div className={cx('landing-page-compareCourseBodyLeft', 'sr-100-5-600')}>
                              <div className={cx('landing-page-compareTitleBody', 'sr-300-10-600')}>Format</div>
                              <div className={cx('landing-page-compareTextBodyLeft', 'sr-300-15-600')}>Scratch, MIT App Inventor, or block based Coding</div>
                            </div>
                            <div className={cx('landing-page-compareCourseBodyRight', 'sr-100-5-600')}>
                              <div className={cx('landing-page-compareTitleBody', 'landing-page-displayOnlySmall', 'sr-300-10-600')}>Format</div>
                              <div className={cx('landing-page-compareTextRightText', 'sr-300-15-600')}>Text based coding, Python programming, Immersive, Interactive Digital Experience</div>
                            </div>
                          </div>
                          <div className={'landing-page-compareCoursesRow'}>
                            <div className={cx('landing-page-compareCourseBodyLeft', 'sr-100-5-600')}>
                              <div className={cx('landing-page-compareTitleBody', 'sr-300-10-600')}>Instructor</div>
                              <div className={cx('landing-page-compareTextBodyLeft', 'sr-300-15-600')}>Not familiar with coding, follow pre-written scripts</div>
                            </div>
                            <div className={cx('landing-page-compareCourseBodyRight', 'sr-100-5-600')}>
                              <div className={cx('landing-page-compareTitleBody', 'landing-page-displayOnlySmall', 'sr-300-10-600')}>Instructor</div>
                              <div className={cx('landing-page-compareTextRightText', 'sr-300-15-600')}>Young CS graduates who know how to code</div>
                            </div>
                          </div>
                          <div className={'landing-page-compareCoursesRow'}>
                            <div className={cx('landing-page-compareCourseBodyLeft', 'sr-100-5-600')}>
                              <div className={cx('landing-page-compareTitleBody', 'sr-300-10-600')}>Outcome</div>
                              <div className={cx('landing-page-compareTextBodyLeft', 'sr-300-15-600')}>Course Completion Certificate, or gimmicks like pre built application</div>
                            </div>
                            <div className={cx('landing-page-compareCourseBodyRight', 'sr-100-5-600')}>
                              <div className={cx('landing-page-compareTitleBody', 'landing-page-displayOnlySmall', 'sr-300-10-600')}>Outcome</div>
                              <div className={cx('landing-page-compareTextRightText', 'sr-300-15-600')}>Launch projects with production ready code in a real apprenticeship setting</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div></>)}

          <div className={'landing-page-container'}>
            <div className={cx('landing-page-divider', 'landing-page-dividerTopBottom')}></div>
          </div>
          <h2 className={cx('landing-page-title', 'landing-page-textCenter', 'landing-page-whatsCoveredTitle', 'sr-100-10-600')}>What's Covered</h2>
          {isDesktop ? (
            <div className={'landing-page-activitiesRowBig'}>
              <Activities
                scrollClass='sr-200-10-600'
                title="Variables & Strings"
                activities={[
                  'Intro to Programming',
                  'Assigning Variables',
                  'Data Types & Operators',
                  'String Functions',
                  'Input & Embedding',
                ]}
              />
              <Activities
                scrollClass='sr-250-10-600'
                title="Decisions"
                activities={[
                  'Conditions',
                  'If Else Program',
                  'Nested If Else',
                  'Elif Program',
                ]}
              />
              <Activities
                scrollClass='sr-300-10-600'
                title="Loops"
                activities={[
                  'Intro to Loops',
                  'For Loop',
                  'While Loop',
                  'For vs While Loop',
                  'Nested Loop',
                  'Break & Continue',
                ]}
              />
            </div>
          ) : (
            <>
              <Collapsible
                scrollClass='sr-200-10-600'
                title="Variables & Strings"
                body={this.topics([
                  'Intro to Programming',
                  'Assigning Variables',
                  'Data Types & Operators',
                  'String Functions',
                  'Input & Embedding',
                ])}
              />
              <Collapsible
                scrollClass='sr-250-10-600'
                title="Decisions"
                body={this.topics([
                  'Conditions',
                  'If Else Program',
                  'Nested If Else',
                  'Elif Program',
                ])}
              />
              <Collapsible
                scrollClass='sr-300-10-600'
                title="Loops"
                body={this.topics([
                  'Intro to Loops',
                  'For Loop',
                  'While Loop',
                  'For vs While Loop',
                  'Nested Loop',
                  'Break & Continue',
                ])}
              />
            </>
          )}
          <div className={'landing-page-container'}>
            <div className={cx('landing-page-divider', 'landing-page-dividerTopBottom')}></div>
          </div>
          {shouldFeaturedIn && (
            <>
              <div className={cx('landing-page-title', 'landing-page-textCenter', 'sr-200-10-600')}>featured in</div>
              <div className={'landing-page-center'}>
                <div className={'landing-page-featuredStrip'}>
                  <a className='sr-300-10-600' href="https://inc42.com/startups/tekie-bets-on-animation-to-take-on-whitehat-jr-co-in-edtechs-coding-for-kids-race/" target='_blank'>
                    <ImageBackground
                      alt='Inc42 Logo'
                      className={'landing-page-inc42'}
                      src={require('../../assets/inc42_lossless.webp')}
                      srcLegacy={require('../../assets/inc42.png')}
                    />
                  </a>
                  <a className='sr-400-10-600' href="https://yourstory.com/2020/11/edtech-startup-whitehat-jr-rival-animation-coding" target='_blank'>
                    <ImageBackground
                      alt='YourStory Logo'
                      className={'landing-page-yourStory'}
                      src={require('../../assets/yourStory_lossless.webp')}
                      srcLegacy={require('../../assets/yourStory.png')}
                    />
                  </a>
                </div>
              </div>
              <div className={'landing-page-container'}>
                <div className={cx('landing-page-divider', 'landing-page-dividerTopBottom')}></div>
              </div>
            </>
          )}
          <div className={cx('landing-page-containerBigPadding', 'landing-page-faqTitle')}>
            <h2 className={cx('landing-page-title', 'sr-100-5-600')}>Frequently  <br className={'landing-page-blockOnlySmall'} /> asked questions</h2>
          </div>
          {/* <Collapsible*/}
          {/*    title="What is online coding for kids?"*/}
          {/*    body={this.faqAnswer('Its a unique and new learning platform where kids can learn to code from the comfort and safety of their homes. ')}*/}
          {/*/>*/}
          {/*<Collapsible*/}
          {/*    title="How do you make coding fun for kids?"*/}
          {/*    body={this.faqAnswer('We use gamification and storytelling for teaching complex codes to kids.')}*/}
          {/*/>*/}
          {/*<Collapsible*/}
          {/*    title="How long does it take to learn coding for kids? "*/}
          {/* body={this.faqAnswer('It\'s an ongoing process. Please get in touch with us to know more.')} */}
          {/* /> */}
          {/* <Collapsible */}
          {/* title="Why kids should learn to code?" */}
          {/* body={this.faqAnswer('Coding is the future, having the right coding skills early lays a solid professional foundation for them. ')} */}
          {/* /> */}
          {/* <Collapsible */}
          {/* title="How does coding help kids?" */}
          {/* body={this.faqAnswer('It helps them to understand the IT fundamentals early. Thus laying a solid foundation for the future.')} */}
          {/* /> */}
          {
            fetchedFaqs.map(({ title, description, id }) => (
              <Collapsible
                key={id}
                title={title}
                body={this.faqAnswer(description)}
              />
            ))
          }
          {/* <Collapsible
                title="Who should take this course?"
                body={this.faqAnswer('Well, anyone over age 10 who wants to start learning to program, get a flavor of what programming is all about, or to see if this excites you can start with this course.')}
            />
            <Collapsible
              title="Why did we choose Python over other languages?"
              body={this.faqAnswer([
                "Python is a fairly simple language to read, so you'll be able to understand it and adapt it to any other language like Javascript, C, PHP, Java.",
                " Also, it's the most used programming language for Artificial Intelligence and Machine Learning, and a popular interviewing language widely used at Google, YouTube, Facebook, Instagram, Netflix, Uber, Dropbox, and many top tech companies."
              ])}
            />
            <Collapsible
              title="Do I need to be familiar with coding to take this course?"
              body={this.faqAnswer(
                "No, you can start without any previous knowledge."
              )}
            />
            <Collapsible
              title="What do I need to be able to take this course?"
              body={this.faqAnswer(
                "You will need wifi, a laptop or desktop computer with a webcam, microphone, and google chrome installed."
              )}
            />
            <Collapsible
              title="Is this course completely online?"
              body={this.faqAnswer(
                "Yes, you can go anywhere in the world(with wifi), and you'll be able to take this course."
              )}
            />
            <Collapsible
              title="How are the classes designed and scheduled?"
              body={this.faqAnswer(
                "Your classes are designed by highly qualified teachers, keeping in mind that the session is interesting, fun, and pushes students just the right amount. Also, our learning model focuses on developing algorithmic thinking, problem-solving skills & creativity."
              )}
            />
            <Collapsible
              title="Duration of our sessions?"
              body={this.faqAnswer(
                "Each live session is designed to be 50 to 60 mins long with videos, lesson workbooks, practice questions, coding exercises, and discussions with mentors. After the session is complete, students are assigned Do-It-Yourself(DIY) coding activities, which is designed to be 60 mins long."
              )}
            />
            <Collapsible
              title="Is this course beginner friendly?"
              body={this.faqAnswer(
                "Don’t worry! All our classes are beginner-friendly. We have sessions designed specifically for beginners. Right from your first class, we’ll make sure we help you get started and feel totally comfortable."
              )}
            />
            <Collapsible
              title="How often should I take these sessions?"
              body={this.faqAnswer(
                "Well, six sessions a month is the magic number. We always recommend getting some comfort, especially if you’re just starting. Each session has two portions, a mentor-led 1:1 live class, and an after-class DIY session; combined they are 120 to 150 minutes of learning per week. But you need to do four sessions per month at a minimum to get something out of all that hard work. Once you get comfortable, you can also take more than six classes a month."
              )}
            />
            <Collapsible
              title="Can I take a free trial session before I decide to buy this course?"
              body={this.faqAnswer(
                ["Absolutely! You get one trial session at no cost. To book your free sessions ",<span className={'landing-page-inlineLink'} onClick={this.openEnrollmentForm}>click here.</span>]
              )}
            />
          <Collapsible
              title="How to track kids coding progress?"
              body={this.faqAnswer('We have reporting systems for that. Please book a demo session with us.')}
          />
          <Collapsible
            title="Why do I have to book a class?"
            body={this.faqAnswer(
              "To attend a session, you will first need to book a slot for yourself since we have limited slots for each session. We limit the number of slots per session so that our instructors can give you individual attention and that the effectiveness of your learning isn’t compromised."
            )}
          />
          <Collapsible
            title="I have never coded before. From where should I begin?"
            body={this.faqAnswer(
              "If this is your first time coding, we recommend you start with our foundation series. The guided sessions with our highly trained mentors make it a cakewalk so you can easily sit and learn. By the end of this series, you will go deeper into the world of coding. Just follow along and complete a session every week to get the most out of your membership."
            )}
          />
          <Collapsible
            title="I have programmed at an intermediate level before. Should I take this course?"
            body={this.faqAnswer(
              "You can always choose to skip the foundation series. However, there is a treasure of knowledge around algorithmic thinking that we offer in the foundation series. So, we recommend that you try them out even if you have coded before."
            )}
          />
          <Collapsible
            title="Can I go back and re-do the sessions that I have already completed?"
            body={this.faqAnswer(
              "Of course! The more, the merrier. Any session that you complete reflects on your learning dashboard. So, if you would like to revisit any session, you can do them directly from there."
            )}
          /> */}
          <div className={cx('landing-page-moreQuestion', 'landing-page-textCenter')}>
            MORE QUESTIONS?<br />
            Let us know at <a className={'landing-page-legal-link'} href="mailto:hello@tekie.in" onClick={() => {
              LinksClicksGA('hello@tekie.in')
            }}>hello@tekie.in</a> or<br />
            call us at <a className={'landing-page-legal-link'} href="tel:+918047483419">+91-8047483419</a>
          </div>
        </div>
        <div className={'landing-page-enrollmentParallax'}>
          <h2 className={cx('landing-page-blueTitle')}>
            {/* Enroll Now to the<br className={'landing-page-displayOnlySmall'} /> Best Coding Classes for Kids */}
            {getCountryCode() === 'us' ? (
              <span style={{ position: 'relative' }}>
                <>
                  Grab Our Early Bird<br className={'landing-page-displayOnlySmall'} /> Discount
                  <div className={'landing-page-earlyBirdDiscountIcon'}>
                    {this.renderUsDiscountIcon()}
                  </div>
                </>
              </span>
            ) : (
              <span>Kickstart your child's<br className={'landing-page-displayOnlySmall'} /> coding journey</span>
            )}
          </h2>
          <div className={cx('landing-page-title2', 'landing-page-marginTop28',)}>
            Intro to Coding
          </div>
          <div className={cx('landing-page-button')} onClick={() => {
            enrollNowGA("Last Button")
            this.openEnrollmentForm()
          }}>
            <span>Enroll Now</span>
          </div>
        </div>
        <div style={{
          width: '100%',
          backgroundColor: '#00171F',
          paddingTop: 1,
        }}>
          <div className={'landing-page-container'}>
            <div className={cx('landing-page-madeBy')}>
              MADE BY ENTREPRENEURS
              FOR THE NEXT GENERATION
              ENTREPRENEURS.
            </div>
          </div>
          <div className={'landing-page-socialMediaContainer'}>
            <div className={'landing-page-socialMediaWrapper'}>
              <a onClick={() => LinksClicksGA('Facebook Link')} className={cx('landing-page-socialMediaIcon', 'landing-page-smFacebook')} href="https://www.facebook.com/Tekie.in/" target="_blank"></a>
              <a onClick={() => LinksClicksGA('Instagram Link')} className={cx('landing-page-socialMediaIcon', 'landing-page-smInstagram')} href="https://www.instagram.com/tekie.in/" target="_blank"></a>
              <a onClick={() => LinksClicksGA('Youtube Link')} className={cx('landing-page-socialMediaIcon', 'landing-page-smYoutube')} href="https://www.youtube.com/channel/UCCr7GPlTdZRXFEfveeuKcbg" target="_blank"></a>
              <a onClick={() => LinksClicksGA('Linkedin Link')} className={cx('landing-page-socialMediaIcon', 'landing-page-smLinkedin')} href="https://www.linkedin.com/company/tekie/" target="_blank"></a>
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
            <ImageBackground
              alt='Tekie Logo'
              className={'landing-page-tekieLogo'}
              src={require('../../assets/tekieLogo_lossless.webp')}
              srcLegacy={require('../../assets/tekieLogo.png')}
            />
          </div>
          <div className={cx('landing-page-container', 'landing-page-copyRightContainer')}>
            <div className={cx('landing-page-madeBy', 'landing-page-brandCopyRight')}>
              © 2020, Kiwhode Learning Pvt Ltd. All Rights Reserved.
            </div>
          </div>
        </div>
        <ChatWidget />
        <Header
          openLogin={this.openLogin}
          openClaimedLogin={this.openClaimedLogin}
          openEnrollmentForm={() => {
            this.openEnrollmentForm()
            enrollNowGA("Header Book Session Button")
          }}
          logoClickable={this.state.episodeOneVisible ? true : false}
          banner={this.state.banner}
          bannerHeight={this.state.bannerHeight}
        />
        <Switch>
          {/* <Route path='/login' render={() => (
            <LoginForm
              openEnrollmentForm={this.openEnrollmentForm}
              onClose={this.closeLogin}
              openOTP={this.openOTP}
              isLoading={this.state.loginLoading}
              login={this.login}
              onPhone={phone => { this.setState({ phone }) }}
              onCountryCode={countryCode => { this.setState({ countryCode }) }}
              phone={this.state.phone}
              countryCode={this.state.countryCode}
              updateCountryCode={(e) => { this.setState({ countryCode: e.target.value }) }}
              parentHistory={this.props.history}
            />
          )} />
          <Route path='/confirm-otp' render={() => (
            !this.state.phone.length ? (
              <Redirect to="/login" />
            )
            : (
              <OTPForm
                openEnrollmentForm={this.openEnrollmentForm}
                onClose={this.closeOTP}
                openLogin={this.openLogin}
                phone={this.state.phone}
                prompt={this.prompt}
                parentHistory={this.props.history}
                countryCode={this.state.countryCode}
              />
            )
          )} /> */}
          <Route path='/intro-to-programming' render={() => (
            <NavigationLifecycle
              onEnter={() => { this.setState({ episodeOneVisible: true }) }}
              onExit={() => { this.setState({ episodeOneVisible: false }) }}
            />
          )
          } />
          <Route path='/if-else-statements' render={() => (
            <NavigationLifecycle
              onEnter={() => { this.setState({ episode12Visible: true }) }}
              onExit={() => { this.setState({ episode12Visible: false }) }}
            />
          )
          } />
          <Route path='/trailer' render={() => (
            <NavigationLifecycle
              onEnter={() => { this.setState({ trailerVisible: true }) }}
              onExit={() => { this.setState({ trailerVisible: false }) }}
            />
          )
          } />
          <Route path='/tekie-tour' render={() => (
            <NavigationLifecycle
              onEnter={() => { this.setState({ tekieTourVideoVisible: true }) }}
              onExit={() => { this.setState({ tekieTourVideoVisible: false }) }}
            />
          )
          } />
          <Route path='/tekie-story-naman-sonpar' render={() => (
            <NavigationLifecycle
              onEnter={() => { this.setState({ namanSonparVideoVisible: true }) }}
              onExit={() => { this.setState({ namanSonparVideoVisible: false }) }}
            />
          )
          } />
          {this.state.slides.map(slide => (
            <Route path={slide.route} render={() => (
              <NavigationLifecycle
                onEnter={() => {
                  this.setState({
                    slides: this.state.slides
                      .map(s => s.id === slide.id
                        ? { ...s, isActive: true }
                        : s
                      )
                  })
                }}
                onExit={() => {
                  this.setState({
                    slides: this.state.slides
                      .map(s => s.id === slide.id
                        ? { ...s, isActive: false }
                        : s
                      )
                  })
                }}
              />
            )
            }
            />))}
        </Switch>
        {/* <YoutubeEmbed visible={this.state.episodeOneVisible} id='mhgymw0f4D4' close={() => {
          this.props.history.push('/')
        }} />
        <YoutubeEmbed visible={this.state.episode12Visible} id='-kgS7ag7W20' close={() => {
          this.props.history.push('/')
        }} />
        <YoutubeEmbed visible={this.state.trailerVisible} id='bliaWebwP08' close={() => {
          this.props.history.push('/')
        }} />
        {this.state.slides.map((slide) => (
          <YoutubeEmbed visible={slide.isActive} id={slide.ytId} close={() => {
            this.props.history.push('/')
          }} />
        ))}
        <YoutubeEmbed visible={this.state.tekieTourVideoVisible} id='FG0LXseAUTU' close={() => {
          this.props.history.push('/')
        }} />
        <YoutubeEmbed visible={this.state.namanSonparVideoVisible} id='ToJ7gTZZjT4' close={() => {
          this.props.history.push('/')
        }} /> */}
        {this.state.claimed && (
          <Claimed close={this.closeClaimed} />
        )}
        {this.state.claimedLogin && (
          <Claimed close={this.closeClaimed} title="Can't login on small devices" />
        )}
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

export default connect(mapStateToProps)(withRouter(LandingPage))
