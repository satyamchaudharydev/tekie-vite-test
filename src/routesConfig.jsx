import React, { lazy } from 'react'
import Loadable from 'react-loadable'
import withSuspense, { DefaultLoader } from './components/Loading/withSuspense'
import { checkIfDefaultCourse } from './utils/getCourseId'
import CodeShowcaseComponent from './pages/CodeShowcaseModule/CodeShowcase'
import IndividualCodeShowcaseComponent from './pages/CodeShowcaseModule/IndividualCodeShowcase/'
import CertificateShowcaseComponent from './pages/CertificateShowcase/CertificateShowcase'
import CheatSheetComponent from './pages/CheatSheet'
import CodingAssignmentOld from './pages/CodingAssignment'
import CodingAssignmentNew from './pages/UpdatedCodingAssignment'
import { get } from 'lodash'
import { routeType } from './constants'

export const RELOAD_ATTEMPTS_COUNT = 3;
function componentLoader(lazyComponent, attemptsLeft = RELOAD_ATTEMPTS_COUNT) {
  return new Promise((resolve, reject) => {
    lazyComponent()
      .then(resolve)
      .catch((error) => {
        // let us retry after 1500 ms
        setTimeout(() => {
          if (attemptsLeft === 1) {
            reject(error);
            return;
          }
          componentLoader(lazyComponent, attemptsLeft - 1).then(resolve, reject);
        }, 1500);
      });
  });
}

const CheatSheet = Loadable({
  loading: () => <DefaultLoader />,
  loader: () => import(/* webpackChunkName: "cheatSheet" */`./pages/CheatSheet/index.js`).then(object => object.default),
});

const CentralizedLogin = Loadable({
  loading: () => <DefaultLoader />,
  loader: () => import(/* webpackChunkName: "schoolLiveLogin" */`./pages/Signup/CentralizedLogin/CentralizedLogin.jsx`).then(object => object.default),
});
const CodeShowcase = Loadable({
  loading: () => <DefaultLoader />,
  loader: () => import(/* webpackChunkName: "studentCommunity" */`./pages/CodeShowcaseModule/CodeShowcase/index.js`).then(object => object.default),
});
const IndividualCodeShowcase = Loadable({
  loading: () => <DefaultLoader />,
  loader: () => import(/* webpackChunkName: "studentCommunity" */`./pages/CodeShowcaseModule/IndividualCodeShowcase/index.js`).then(object => object.default),
});
const CertificateShowcase = Loadable({
  loading: () => <DefaultLoader />,
  loader: () => import(/* webpackChunkName: "certificateShowcase" */`./pages/CertificateShowcase/index.js`).then(object => object.default),
});
const ClassroomHomePage = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "teacherApp" */'./pages/TeacherApp/pages/Classroom/Home'))))
  : () => <div />
const Classrooms = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "teacherApp" */'./pages/TeacherApp/pages/Classrooms'))))
  : () => <div />
const HomeworkReview = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionEmbedable" */'./pages/TeacherApp/pages/HomeworkReview'))))
  : () => <div />
const PqReport = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "pqReport" */'./pages/TeacherApp/pages/PqReport'))))
  : () => <div />
const PqReportTeacherTraining = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "pqReportTeacherTraining" */'./pages/PQReportTeacherTraining/index.js'))))
  : () => <div />

const HomePage = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "homepage" */'./pages/LearnPage'))))
  : () => <div />
const Editor = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "codeEditor" */'./pages/Editor/EditorPage.jsx'))))
  : () => <div />
const Homework = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "homeworkPage" */'./pages/Homework'))))
  : () => <div />
const Video = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsVideo" */'./pages/Video'))))
  : () => <div />
const VideoDiscussion = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsVideo" */'./pages/VideoDiscussion'))))
  : () => <div />
const Discussion = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsVideo" */'./pages/Discussion'))))
  : () => <div />
const ChatBot = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsChat" */'./pages/ChatBot'))))
  : () => <div />
const Chat = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsChat" */'./pages/Chat'))))
  : () => <div />
const Practice = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsPQ" */'./pages/Practice'))))
  : () => <div />
const PQReport = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsPQ" */'./pages/PQReport'))))
  : () => <div />
const Quiz = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsQuiz" */'./pages/Quiz'))))
  : () => <div />
const QuizReport = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsQuiz" */'./pages/QuizReport'))))
  : () => <div />
const SeeAnswers = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsSeeAnswers" */'./pages/SeeAnswers'))))
  : () => <div />
const AccountPage = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "settings" */'./pages/Account'))))
  : () => <div />
const JourneyReport = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "settings" */'./pages/JourneyReport'))))
  : () => <div />
const Achievements = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "settings" */'./pages/Achievements'))))
  : () => <div />
const ComingSoon = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "settings" */'./pages/ComingSoon'))))
  : () => <div />
const Checkout = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "checkout" */'./pages/Checkout'))))
  : () => <div />
const CodePlayground = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "codePlayground" */'./pages/CodePlayground'))))
  : () => <div />
const CodeShowcaseStats = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "studentCommunity" */'./pages/CodeShowcaseModule/Stats/'))))
  : () => <div />
const SchoolDashboard = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "schoolDashboard" */'./pages/SchoolDashboard'))))
  : () => <div />
const SchoolGrades = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "schoolDashboardGrades" */'./pages/SchoolDashboard/Grades'))))
  : () => <div />
const SchoolStudents = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "schoolDashboardStudents" */'./pages/SchoolDashboard/Students'))))
  : () => <div />
const SchoolStudentProfile = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "schoolDashboardStudents" */'./pages/SchoolDashboard/StudentProfile'))))
  : () => <div />
const SchoolMentorProfile = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "schoolDashboardMentors" */'./pages/SchoolDashboard/MentorProfile'))))
  : () => <div />
const SchoolProfile = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "schoolDashboard" */'./pages/SchoolDashboard/SchoolProfile'))))
  : () => <div />
const SchoolMentors = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "schoolDashboardMentors" */'./pages/SchoolDashboard/Mentors'))))
  : () => <div />
const UpdatedVideo = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsUpdatedVideo" */'./pages/UpdatedSessions/Video/'))))
  : () => <div />
const ComicStrip = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsUpdatedComicStrip" */'./pages/UpdatedSessions/ComicStrip/'))))
  : () => <div />
const UpdatedProject = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsUpdatedProject" */'./pages/UpdatedSessions/Project/'))))
  : () => <div />
const UpdatedPractice = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsUpdatedPractice" */'./pages/UpdatedSessions/Practice/'))))
  : () => <div />
const UpdatedPracticeQuiz = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsUpdatedPQ" */'./pages/UpdatedSessions/PracticeQuiz'))))
  : () => <div />
const UpdatedQuiz = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsUpdatedQuiz" */`./pages/UpdatedSessions/Quiz`))))
  : () => <div />
const UpdatedQuizReport = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsUpdatedQuiz" */`./pages/UpdatedSessions/QuizReport`))))
  : () => <div />
const UpdatedLearningSlides = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionsLearningSlides" */`./pages/UpdatedSessions/LearningSlides`))))
  : () => <div />
const Sessions = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessions" */`./pages/Sessions`))))
  : () => <div />
const DetailedReport = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "detailedReport" */`./pages/TeacherApp/pages/DetailedReport`))))
  : () => <div />
const RedirectPage = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "redirectPage" */`./pages/EventLandingPage/pages/RedirectPage/RedirectPage`))))
  : () => <div />
const SessionEmbed = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionEmbed" */`./pages/TeacherApp/pages/SessionEmbed`))))
  : () => <div />
const ClassroomDetails = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "classrooms" */`./pages/TeacherApp/pages/Classroom/ClassroomDetails`))))
  : () => <div />
const StudentLevelReport = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "classroomReport" */`./pages/TeacherApp/pages/StudentLevelReport`))))
  : () => <div />
const IndividualStudentLevelReport = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "classroomReport" */`./pages/TeacherApp/pages/IndividualStudentReport`))))
  : () => <div />
const ClassroomCourseListing = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "classrooms" */`./pages/TeacherApp/pages/ClassroomCourseListing`))))
  : () => <div />
const Book = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "sessionEbook" */`./pages/Book`))))
  : () => <div />

const CodeGarage = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "codeGarage" */`./pages/CodeGarage`))))
  : () => <div />

const QRCodePreview = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "codeGarage" */`./pages/QRCodePreview`))))
  : () => <div />

const TrainingResourcesClasswork = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "teacherTraining" */`./pages/TeacherApp/pages/TrainingResourcesClasswork`))))
  : () => <div />

const TrainingResourcesAssessment = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "teacherTraining" */`./pages/TeacherApp/pages/TrainingResourcesAssessment`))))
  : () => <div />

const QuestionPaperGenerator = typeof window !== 'undefined'
  ? withSuspense(lazy(() => componentLoader(() => import(/* webpackChunkName: "questionPaperGenerator" */`./pages/TeacherApp/pages/QuestionPaperGenerator`))))
  : () => <div />

const getActiveTeacherAppRoute = (page) => {
  if (typeof window !== 'undefined') {
    switch (page) {
      case 'session-embed':
        const windowQueryParams = get(window, "location.search", "");
        if (windowQueryParams && windowQueryParams.includes('backToPage=Timetable')) return 'time-table';
        if (windowQueryParams && windowQueryParams.includes('backToPage=Report')) return 'reports';
        return 'classrooms'
      default:
        return null;
    }
  }
  return null;
};

const getComponentBasedOnCourse = (LegacyComponent, UpdatedComponent = null) => {
  return UpdatedComponent
}

const ChatPage = getComponentBasedOnCourse(Chat, ChatBot);
const VideoPage = getComponentBasedOnCourse(Video, UpdatedVideo);
const QuizReportPage = getComponentBasedOnCourse(QuizReport, UpdatedQuizReport);
const CodingAssignment = getComponentBasedOnCourse(CodingAssignmentOld, CodingAssignmentNew);
const QuizPage = getComponentBasedOnCourse(Quiz, UpdatedQuiz)

export const getRoutesList = (props, shouldGetServerRoutes = false) => {
  const { PUBLIC, PRIVATE } = routeType
  // 🚨🚨🚨 NOTE: DON'T INCLUDE ANY CONST VARIABLES IMPORTED FROM THE ANOTHER FILE...
  let routeComponentsList = [

    {
      Component: CentralizedLogin,
      exact: true,
      path: '/',
      name: 'Login',
      config: {
        noNav: true,
        routeType: PUBLIC,
        allowOnSubDomain: 'block',
      },
      serverConfig: {
        css: 'signup-or-login',
        ssr: false
      }
    },
    {
      Component: CentralizedLogin,
      exact: true,
      path: '/student',
      name: 'Login',
      config: {
        noNav: true,
        routeType: PUBLIC,
        allowOnSubDomain: 'block',
      },
      serverConfig: {
        css: 'signup-or-login',
        ssr: false
      }
    },
    {
      Component: CentralizedLogin,
      exact: true,
      path: '/teacher',
      name: 'Login',
      config: {
        noNav: true,
        routeType: PUBLIC,
        allowOnSubDomain: 'block',
      },
      serverConfig: {
        css: 'signup-or-login',
        ssr: false
      }
    },

    {
      Component: Book,
      exact: true,
      path: '/book/:bookId',
      name: 'Book',
      config: {
        studentApp: true,
        sessionsOnly: true,
        outSideNav: true,
        withUpdatedSideNav: true,
        noOverflow: true,
        className: 'book-page',
      },
    },

    {
      // Component: SignupLogin,
      Component: CentralizedLogin,
      exact: true,
      path: '/login',
      name: 'Login',
      config: {
        noNav: true,
        routeType: PUBLIC,
        allowOnSubDomain: 'block',
      },
      serverConfig: {
        css: 'signup-or-login',
        ssr: false
      }
    },
    {
      Component: Sessions,
      exact: true,
      path: '/course',
      name: 'Course',
      config: {
        hideNavLoggedOut: true,
        routeType: PUBLIC,
      },
    },



    {
      Component: CodeShowcase,
      exact: true,
      path: '/student-community',
      name: 'Student Community',
      config: {
        className: 'code-showcase',
        fromSSR: get(props, 'fromSSR'),
        hideNavLoggedOut: true,
        bodyContainerFull: true,
        topRootNav: true,
        privateRoute: false,
        routeType: PRIVATE,
      },
      serverConfig: {
        ssr: true,
        css: ['code-showcase', 'side-navbar-'],
        prefetch: true,
        component: CodeShowcaseComponent,
      }
    },
    {
      Component: CodeShowcase,
      exact: true,
      path: '/student-community/new',
      name: 'Student Community',
      config: {
        className: 'code-showcase',
        fromSSR: get(props, 'fromSSR'),
        hideNavLoggedOut: true,
        bodyContainerFull: true,
        topRootNav: true,
        privateRoute: false,
        routeType: PRIVATE,
      },
      serverConfig: {
        ssr: true,
        css: ['code-showcase', 'side-navbar-'],
        prefetch: true,
        component: CodeShowcaseComponent,
      }
    },
    {
      Component: CodeShowcase,
      exact: true,
      path: '/student-community/best',
      name: 'Student Community',
      config: {
        className: 'code-showcase',
        fromSSR: get(props, 'fromSSR'),
        hideNavLoggedOut: true,
        bodyContainerFull: true,
        topRootNav: true,
        privateRoute: false,
        routeType: PRIVATE,
      },
      serverConfig: {
        ssr: true,
        css: ['code-showcase', 'side-navbar-'],
        prefetch: true,
        component: CodeShowcaseComponent,
      }
    },
    {
      Component: CodeShowcase,
      exact: true,
      path: '/student-community/trending',
      name: 'Student Community',
      config: {
        className: 'code-showcase',
        fromSSR: get(props, 'fromSSR'),
        hideNavLoggedOut: true,
        bodyContainerFull: true,
        topRootNav: true,
        privateRoute: false,
        routeType: PRIVATE,
      },
      serverConfig: {
        ssr: true,
        css: ['code-showcase', 'side-navbar-'],
        prefetch: true,
        component: CodeShowcaseComponent,
      }
    },
    {
      Component: IndividualCodeShowcase,
      exact: true,
      path: '/student-community/:id',
      name: 'Student Community',
      config: {
        className: 'ind-code-showcase',
        fromSSR: get(props, 'fromSSR'),
        hideNavLoggedOut: true,
        topRootNav: true,
        privateRoute: false,
        routeType: PRIVATE,
      },
      serverConfig: {
        ssr: true,
        css: ['ind-code-showcase', 'side-navbar-'],
        prefetch: true,
        component: IndividualCodeShowcaseComponent,
      }
    },
    {
      Component: CertificateShowcase,
      exact: true,
      path: '/course-completion/:code',
      name: 'Course Completion Certificate',
      config: {
        noNav: true,
        className: 'cert-showcase',
        fromSSR: get(props, 'fromSSR'),
        routeType: PUBLIC,
      },
      serverConfig: {
        ssr: true,
        css: ['cert-showcase', 'side-navbar-'],
        prefetch: true,
        component: CertificateShowcaseComponent
      }
    },

    {
      Component: CodeShowcaseStats,
      exact: true,
      path: '/selected-code/stats',
      name: 'Published Code',
      config: {
        studentApp: true,
        topRootNav: true,
        routeType: PRIVATE,
      },
    },
    {
      Component: Sessions,
      exact: true,
      path: '/sessions',
      name: 'sessions',
      config: {
        studentApp: true,
        appSideNav: true,
        navItem: true,
        sessionsOnly: true,
        outSideNav: true,
        showInHamMenu: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      },
    },
    {
      Component: Sessions,
      exact: true,
      path: '/sessions/book',
      name: 'Sessions',
      config: {
        studentApp: true,
        appSideNav: true,
        sessionsOnly: true,
        routeType: PRIVATE,
      },
    },
    {
      Component: HomePage,
      exact: true,
      path: '/learn',
      name: 'Learn',
      config: {
        studentApp: true,
        outSideNav: true,
        withUpdatedSideNav: true,
        topRootNav: true,
        routeType: PRIVATE,
      }

    },
    {
      Component: Editor,
      exact: true,
      path: '/code-playground',
      name: 'code playground',
      config: {
        studentApp: true,
        // navItem: true,
        fullPage: true,
        outSideNav: true,
        withUpdatedSideNav: true,
        privateRoute: false,
        routeType: PRIVATE,
      },
    },
    {
      Component: Editor,
      exact: true,
      path: '/code-playground/:id',
      name: 'code playground',
      config: {
        studentApp: true,
        outSideNav: true,
        fullPage: true,
        withUpdatedSideNav: true,
        parent: 'code playground',
        routeType: PRIVATE,
      },
    },
    {
      Component: Editor,
      exact: true,
      path: '/playground',
      name: 'code playground',
      config: {
        studentApp: true,
        parent: 'code-playground',
        routeType: PRIVATE,
        managementApp: true,
        leftPadding: false,
      },
    },
    {
      Component: Editor,
      exact: true,
      path: '/playground/:id',
      name: 'code playground',
      config: {
        studentApp: true,
        parent: 'code-playground',
        routeType: PRIVATE,
        managementApp: true,
        leftPadding: false,
      },
    },
    {
      Component: Homework,
      exact: true,
      path: '/homework',
      name: 'Homework',
      config: {
        studentApp: true,
        sessionsOnly: true,
        outSideNav: true,
        withUpdatedSideNav: true,
        background: '#FAFAFA',
        routeType: PRIVATE,
      },
    },
    {
      Component: Video,
      exact: true,
      path: '/video/:topicId',
      name: 'Video',
      config: {
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      },
    },
    {
      Component: Video,
      exact: true,
      path: '/video/:topicId/:learningObjectiveId',
      name: 'Video',
      config: {
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      },
    },
    {
      Component: VideoDiscussion,
      exact: true,
      path: '/sessions/video/:topicId/discussion',
      name: 'Video Discussion',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      },
    },
    {
      Component: VideoDiscussion,
      exact: true,
      path: '/sessions/video/:topicId/discussion',
      name: 'Video Discussion',
      config: {
        managementApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      },
    },
    {
      Component: Discussion,
      exact: true,
      path: '/sessions/:topicId/discussion',
      name: 'Video Discussion',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      },
    },
    {
      Component: ChatPage,
      exact: true,
      path: '/chat/:topicId/:loId',
      name: 'Chat',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        keyPath: 'loId',
        routeType: PRIVATE,
      },
    },
    {
      Component: Practice,
      exact: true,
      path: '/practice/:topicId/:loId',
      name: 'Practice',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      },
    },
    {
      Component: PQReport,
      exact: true,
      path: '/pq-report',
      name: 'PQ Report',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      }
    },
    {
      Component: PQReport,
      exact: true,
      path: '/practice-report/:topicId/:loId',
      name: 'PQ Report',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedQuiz,
      exact: true,
      path: '/quiz/:topicId',
      name: 'Quiz',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReport,
      exact: true,
      path: '/quiz-report-first/:topicId',
      name: 'Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        param: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReport,
      exact: true,
      path: '/quiz-report-latest/:topicId',
      name: 'Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      }
    },
    {
      Component: SeeAnswers,
      exact: true,
      path: '/see-answers-first/:topicId',
      name: 'Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      }
    },
    {
      Component: SeeAnswers,
      exact: true,
      path: '/see-answers-latest/:topicId',
      name: 'Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      }
    },
    {
      Component: Video,
      exact: true,
      path: '/sessions/video/:topicId',
      name: 'Video',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: Video,
      exact: true,
      path: '/sessions/video/:topicId',
      name: 'Video',
      config: {
        managementApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: VideoPage,
      exact: true,
      path: '/sessions/video/:courseId/:topicId',
      name: 'Video',
      config: {
        studentApp: true,
        withUpdatedSideNav: true,
        noMobileHeader: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: VideoPage,
      exact: true,
      path: '/sessions/video/:courseId/:topicId',
      name: 'Video',
      config: {
        managementApp: true,
        withUpdatedSideNav: true,
        noMobileHeader: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReportPage,
      exact: true,
      path: '/quiz-report-first/:courseId/:topicId',
      name: 'First Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'homework',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReportPage,
      exact: true,
      path: '/quiz-report-first/:courseId/:topicId',
      name: 'First Quiz Report',
      config: {
        managementApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'homework',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReportPage,
      exact: true,
      path: '/quiz-report-latest/:courseId/:topicId',
      name: 'Latest Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'homework',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReportPage,
      exact: true,
      path: '/quiz-report-latest/:courseId/:topicId',
      name: 'Latest Quiz Report',
      config: {
        managementApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'homework',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReportPage,
      exact: true,
      path: '/sessions/quiz-report-first/:courseId/:topicId',
      name: 'First Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReportPage,
      exact: true,
      path: '/sessions/quiz-report-first/:courseId/:topicId',
      name: 'First Quiz Report',
      config: {
        managementApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReportPage,
      exact: true,
      path: '/sessions/quiz-report-latest/:courseId/:topicId',
      name: 'Latest Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReportPage,
      exact: true,
      path: '/sessions/quiz-report-latest/:courseId/:topicId',
      name: 'Latest Quiz Report',
      config: {
        managementApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: ChatPage,
      exact: true,
      path: '/sessions/chat/:topicId/:loId',
      name: 'Chat',
      config: {
        studentApp: true,
        keyPath: 'loId',
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: ChatPage,
      exact: true,
      path: '/sessions/chat/:courseId/:topicId/:loId',
      name: 'Chat',
      config: {
        studentApp: true,
        keyPath: 'loId',
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: ChatPage,
      exact: true,
      path: '/revisit/sessions/chat/:courseId/:topicId/:loId',
      name: 'Chat',
      config: {
        studentApp: true,
        keyPath: 'loId',
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        revisitRoute: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: PQReport,
      exact: true,
      path: '/sessions/practice-report/:courseId/:topicId/:loId',
      name: 'PQ Report',
      config: {
        studentApp: true,
        withUpdatedSideNav: true,
        noMobileHeader: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: PQReport,
      exact: true,
      path: '/sessions/practice-report/:courseId/:topicId/:loId',
      name: 'PQ Report',
      config: {
        managementApp: true,
        withUpdatedSideNav: true,
        noMobileHeader: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: PQReport,
      exact: true,
      path: '/sessions/practice-report/:topicId/:loId',
      name: 'PQ Report',
      config: {
        studentApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: PQReport,
      exact: true,
      path: '/sessions/practice-report/:topicId/:loId',
      name: 'PQ Report',
      config: {
        managementApp: true,
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        noMobileHeader: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: Practice,
      exact: true,
      path: '/sessions/practice/:topicId/:loId',
      name: 'Practice',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: Practice,
      exact: true,
      path: '/sessions/practice/:topicId/:loId',
      name: 'Practice',
      config: {
        managementApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReport,
      exact: true,
      path: '/sessions/quiz-report-latest/:topicId',
      name: 'Latest Quiz Report',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizReport,
      exact: true,
      path: '/sessions/quiz-report-latest/:topicId',
      name: 'Latest Quiz Report',
      config: {
        managementApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: SeeAnswers,
      exact: true,
      path: '/sessions/see-answers-latest/:topicId',
      name: 'Latest See Answer',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: ComicStrip,
      exact: true,
      path: '/sessions/comic-strip/:courseId/:topicId/:loId',
      name: 'Comic Strip',
      config: {
        studentApp: true,
        noMobileHeader: true,
        className: 'Comic Strips',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: ComicStrip,
      exact: true,
      path: '/revisit/sessions/comic-strip/:courseId/:topicId/:loId',
      name: 'Comic Strip',
      config: {
        studentApp: true,
        noMobileHeader: true,
        className: 'Comic Strips',
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedProject,
      exact: true,
      path: '/sessions/project/:courseId/:topicId/:projectId',
      name: 'Project',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPractice,
      exact: true,
      path: '/sessions/practice/:courseId/:topicId/:projectId',
      name: 'Practice',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPractice,
      exact: true,
      path: '/sessions/practice/:courseId/:topicId/:projectId',
      name: 'Practice',
      config: {
        managementApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPractice,
      exact: true,
      path: '/homework/:courseId/:topicId/:projectId/practice',
      name: 'Homework Practice',
      config: {
        studentApp: true,
        parent: 'homework',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPractice,
      exact: true,
      path: '/homework/:courseId/:topicId/:projectId/practice',
      name: 'Homework Practice',
      config: {
        managementApp: true,
        parent: 'homework',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPracticeQuiz,
      exact: true,
      path: '/sessions/practice-quiz/:courseId/:topicId/:loId',
      name: 'Practice Question',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPracticeQuiz,
      exact: true,
      path: '/sessions/practice-quiz/:courseId/:topicId/:loId',
      name: 'Practice Question',
      config: {
        managementApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedProject,
      exact: true,
      path: '/revisit/sessions/project/:courseId/:topicId/:projectId',
      name: 'Project',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedProject,
      exact: true,
      path: '/revisit/sessions/project/:courseId/:topicId/:projectId',
      name: 'Project',
      config: {
        managementApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPractice,
      exact: true,
      path: '/revisit/sessions/practice/:courseId/:topicId/:projectId',
      name: 'Practice',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPractice,
      exact: true,
      path: '/revisit/sessions/practice/:courseId/:topicId/:projectId',
      name: 'Practice',
      config: {
        managementApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPracticeQuiz,
      exact: true,
      path: '/revisit/sessions/practice-quiz/:courseId/:topicId/:loId',
      name: 'Practice Question',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPracticeQuiz,
      exact: true,
      path: '/revisit/sessions/practice-quiz/:courseId/:topicId/:loId',
      name: 'Practice Question',
      config: {
        managementApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: PQReport,
      exact: true,
      path: '/revisit/sessions/practice-report/:courseId/:topicId/:loId',
      name: 'PQ Report',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: PQReport,
      exact: true,
      path: '/revisit/sessions/practice-report/:courseId/:topicId/:loId',
      name: 'PQ Report',
      config: {
        managementApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignment,
      exact: true,
      path: '/homework-assignment/:topicId',
      name: 'Homework Assignment',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'learn',
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignment,
      exact: true,
      path: '/homework/:topicId/codingAssignment',
      name: 'Homework Coding Assignment',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'homework',
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignmentNew,
      exact: true,
      path: '/homework/:courseId/:topicId/codingAssignment',
      name: 'Homework Coding Assignment',
      config: {
        studentApp: true,
        parent: 'homework',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedQuiz,
      exact: true,
      path: '/homework/:topicId/quiz',
      name: 'Quiz',
      config: {
        studentApp: true,
        sideNavItem: true,
        parent: 'homework',
        routeType: PRIVATE,
      }
    },
    {
      Component: QuizPage,
      exact: true,
      path: '/homework/:courseId/:topicId/quiz',
      name: 'Quiz',
      config: {
        studentApp: true,
        sideNavItem: checkIfDefaultCourse(),
        parent: 'homework',
        withUpdatedSideNav: !checkIfDefaultCourse(),
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedQuiz,
      exact: true,
      path: '/sessions/:courseId/:topicId/quiz',
      name: 'Quiz',
      config: {
        studentApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignmentNew,
      exact: true,
      path: '/sessions/:courseId/:topicId/codingAssignment',
      name: 'Coding Assignment',
      config: {
        studentApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedPractice,
      exact: true,
      path: '/sessions/:courseId/:topicId/:projectId/practice',
      name: 'Practice',
      config: {
        studentApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignment,
      exact: true,
      path: '/sessions/coding/:topicId',
      name: 'Sessions',
      config: {
        studentApp: true,
        parent: 'sessions',
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignment,
      exact: true,
      path: '/revisit/sessions/coding/:topicId',
      name: 'Coding Assignment',
      config: {
        studentApp: true,
        parent: 'sessions',
        sideNavItem: checkIfDefaultCourse(),
        revisitRoute: true,
        withUpdatedSideNav: !checkIfDefaultCourse(),
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignmentNew,
      exact: true,
      path: '/sessions/coding/:courseId/:topicId',
      name: 'Coding Assignment',
      config: {
        studentApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        sideNavItem: checkIfDefaultCourse(),
        withUpdatedSideNav: !checkIfDefaultCourse(),
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignmentNew,
      exact: true,
      path: '/revisit/sessions/coding/:courseId/:topicId',
      name: 'Coding Assignment',
      config: {
        studentApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        sideNavItem: checkIfDefaultCourse(),
        revisitRoute: true,
        withUpdatedSideNav: !checkIfDefaultCourse(),
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedLearningSlides,
      exact: true,
      path: '/sessions/learning-slides/:courseId/:topicId/:loId',
      name: 'Learning Slides',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedLearningSlides,
      exact: true,
      path: '/sessions/learning-slides/:courseId/:topicId/:loId',
      name: 'Learning Slides',
      config: {
        managementApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedLearningSlides,
      exact: true,
      path: '/revisit/sessions/learning-slides/:courseId/:topicId/:loId',
      name: 'Learning Slides',
      config: {
        studentApp: true,
        noMobileHeader: true,
        revisitRoute: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignment,
      exact: true,
      path: '/sessions/codingAssignment/:topicId',
      name: 'Coding Assignment',
      config: {
        studentApp: true,
        parent: 'sessions',
        sideNavItem: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignment,
      exact: true,
      path: '/codingAssignment/:topicId',
      name: 'Coding Assignment',
      config: {
        studentApp: true,
        parent: 'learn',
        sideNavItem: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: Video,
      exact: true,
      path: '/revisit/sessions/video/:topicId',
      name: 'Video',
      config: {
        studentApp: true,
        parent: 'sessions',
        sideNavItem: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: VideoPage,
      exact: true,
      path: '/revisit/sessions/video/:courseId/:topicId',
      name: 'Video',
      config: {
        studentApp: true,
        noMobileHeader: true,
        revisitRoute: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: Chat,
      exact: true,
      path: '/revisit/sessions/chat/:topicId/:loId',
      name: 'Chat',
      config: {
        studentApp: true,
        keyPath: 'loId',
        parent: 'sessions',
        sideNavItem: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: Practice,
      exact: true,
      path: '/revisit/sessions/practice/:topicId/:loId',
      name: 'Practice',
      config: {
        studentApp: true,
        parent: 'sessions',
        sideNavItem: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: PQReport,
      exact: true,
      path: '/revisit/sessions/practice-report/:topicId/:loId',
      name: 'PQ Report',
      config: {
        studentApp: true,
        parent: 'sessions',
        sideNavItem: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignment,
      exact: true,
      path: '/revisit/homework/:topicId/codingAssignment',
      name: 'Homework Assignment',
      config: {
        studentApp: true,
        withUpdatedSideNav: true,
        revisitRoute: true,
        parent: 'sessions',
        routeType: PRIVATE,
      }
    },
    {
      Component: CodingAssignment,
      exact: true,
      path: '/revisit/homework/:courseId/:topicId/codingAssignment',
      name: 'Homework Assignment',
      config: {
        studentApp: true,
        parent: 'sessions',
        withUpdatedSideNav: true,
        revisitRoute: true,
        noMobileHeader: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedQuiz,
      exact: true,
      path: '/revisit/homework/:topicId/quiz',
      name: 'Quiz',
      config: {
        studentApp: true,
        parent: 'sessions',
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: UpdatedQuiz,
      exact: true,
      path: '/revisit/homework/:courseId/:topicId/quiz',
      name: 'Quiz',
      config: {
        studentApp: true,
        parent: 'sessions',
        withUpdatedSideNav: true,
        revisitRoute: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: AccountPage,
      exact: true,
      path: '/settings/account',
      name: 'Account Page',
      config: {
        studentApp: true,
        parent: 'settings',
        sideNavItem: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: JourneyReport,
      exact: true,
      path: '/settings/journeyreport',
      name: 'Journey Report',
      config: {
        studentApp: true,
        parent: 'settings',
        sideNavItem: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: Achievements,
      exact: true,
      path: '/settings/achievements/:type',
      name: 'Achievements',
      config: {
        studentApp: true,
        parent: 'settings',
        sideNavItem: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: ComingSoon,
      exact: true,
      path: '/settings/support',
      name: 'Support Page',
      config: {
        studentApp: true,
        parent: 'settings',
        sideNavItem: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: VideoPage,
      exact: true,
      path: '/sessions/video/:courseId/:topicId/:videoId',
      name: 'Video',
      config: {
        studentApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: VideoPage,
      exact: true,
      path: '/sessions/video/:courseId/:topicId/:videoId',
      name: 'Video',
      config: {
        managementApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: VideoPage,
      exact: true,
      path: '/revisit/sessions/video/:courseId/:topicId/:videoId',
      name: 'Video',
      config: {
        studentApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        revisitRoute: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: VideoPage,
      exact: true,
      path: '/revisit/sessions/video/:courseId/:topicId/:videoId',
      name: 'Video',
      config: {
        managementApp: true,
        noMobileHeader: true,
        parent: 'sessions',
        revisitRoute: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: VideoPage,
      exact: true,
      path: '/sessions/video/:topicId/:learningObjectiveId',
      name: 'Video',
      config: {
        studentApp: true,
        parent: 'sessions',
        sideNavItem: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: Checkout,
      exact: true,
      path: '/checkout',
      name: 'Checkout',
      config: {
        studentApp: true,
        noNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: CodePlayground,
      exact: true,
      path: '/codePlayground',
      name: 'Saved Codes',
      config: {
        studentApp: true,
        topRootNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: CheatSheet,
      exact: true,
      path: '/cheatsheet',
      name: 'Resources',
      config: {
        studentApp: true,
        outSideNav: true,
        withUpdatedSideNav: true,
        privateRoute: false,
        routeType: PRIVATE,
      },
      serverConfig: {
        ssr: true,
        css: ['main_navbar_', 'cheatsheet-', 'side-navbar-'],
        prefetch: true,
        component: CheatSheetComponent
      }
    },
    {
      Component: CheatSheet,
      exact: true,
      path: '/cheatsheet/:topicId',
      name: 'CheatSheet',
      config: {
        studentApp: true,
        outSideNav: true,
        withUpdatedSideNav: true,
        privateRoute: false,
        routeType: PRIVATE
      },
      serverConfig: {
        ssr: true,
        css: ['main_navbar_', 'cheatsheet-', 'side-navbar-'],
        prefetch: true,
        component: CheatSheetComponent
      }
    },
    {
      Component: CheatSheet,
      exact: true,
      path: '/cheatsheet/:topicId/:cheatsheetId',
      name: 'CheatSheet',
      config: {
        studentApp: true,
        outSideNav: true,
        withUpdatedSideNav: true,
        privateRoute: false,
        routeType: PRIVATE,
      },
      serverConfig: {
        ssr: true,
        css: ['main_navbar_', 'cheatsheet-', 'side-navbar-'],
        prefetch: true,
        component: CheatSheetComponent
      }
    },
    {
      Component: CodeGarage,
      exact: true,
      path: '/code-garage',
      name: 'Code Garage',
      config: {
        studentApp: true,
        outSideNav: true,
        withUpdatedSideNav: true,
        topRootNav: true,
        parent: 'code-playground',
        routeType: PRIVATE,
      }
    },
    {
      Component: CodeGarage,
      exact: true,
      path: '/code',
      name: 'Code Garage',
      config: {
        studentApp: true,
        parent: 'code-playground',
        routeType: PRIVATE,
        managementApp: true,
        leftPadding: false,
      }
    },
    {
      Component: SchoolProfile,
      exact: true,
      path: '/dashboard/:schoolSlug/profile',
      name: 'Mentor Profile',
      config: {
        studentApp: true,
        noNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: SchoolMentorProfile,
      exact: true,
      path: '/dashboard/:schoolSlug/mentors/:mentorId',
      name: 'Mentor Profile',
      config: {
        studentApp: true,
        noNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: SchoolMentors,
      exact: true,
      path: '/dashboard/:schoolSlug/mentors',
      name: 'School Mentor',
      config: {
        studentApp: true,
        noNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: SchoolStudentProfile,
      exact: true,
      path: '/dashboard/:schoolSlug/students/:studentId',
      name: 'Student Profile',
      config: {
        studentApp: true,
        noNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: SchoolStudents,
      exact: true,
      path: '/dashboard/:schoolSlug/students',
      name: 'School Students',
      config: {
        studentApp: true,
        noNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: SchoolGrades,
      exact: true,
      path: '/dashboard/:schoolSlug/grades',
      name: 'School Grades',
      config: {
        studentApp: true,
        noNav: true,
        routeType: PRIVATE,
      }
    },
    {
      Component: SchoolDashboard,
      exact: true,
      path: '/dashboard/:schoolSlug',
      name: 'School Dashboard',
      config: {
        studentApp: true,
        noNav: true,
        routeType: PRIVATE,
      }
    },

    {
      Component: ClassroomHomePage,
      exact: true,
      path: '/reports',
      name: 'Reports Page',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'reports',
      }
    },
    {
      Component: Classrooms,
      exact: true,
      path: '/classrooms',
      name: 'Classrooms Page',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'classrooms',
      }
    },
    {
      Component: ClassroomDetails,
      exact: true,
      path: '/reports/classroom/:batchId',
      name: 'Classroom Report',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'reports',
      }
    },
    {
      Component: SessionEmbed,
      exact: true,
      path: '/session-embed',
      name: 'Session Embed',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: getActiveTeacherAppRoute('session-embed'),
      }
    },
    {
      Component: RedirectPage,
      exact: true,
      path: '/redirect/:redirectId',
      name: 'Redirect Page',
      config: {
        hideNavLoggedOut: true,
        routeType: PUBLIC,
      }
    },
    {
      Component: HomeworkReview,
      exact: true,
      path: '/homework-review',
      name: 'Homework Review',
      config: {
        studentApp: true,
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'homework-review',
      }
    },
    {
      Component: PqReport,
      exact: true,
      path: '/pq-report',
      name: 'PQ Report',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'pq-report',
      }
    },
    {
      Component: PqReportTeacherTraining,
      exact: true,
      path: '/teacher-report/:userId/:topicId',
      name: 'PQ Report for Teacher Training',
      config: {
        noNav: true,
        noOverflow: true,
        routeType: PUBLIC,
      }
    },
    {
      Component: HomeworkReview,
      exact: true,
      path: '/sessions/homework-review/:courseId/:topicId',
      name: 'Homework Review',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
        activeRoute: 'homework-review',
      }
    },
    {
      Component: PqReport,
      exact: true,
      path: '/sessions/pq-report/:courseId/:topicId/:loId',
      name: 'PQ Report',
      config: {
        studentApp: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
        activeRoute: 'homework-review',
      }
    },
    {
      Component: PqReport,
      exact: true,
      path: '/revisit/sessions/pq-report/:courseId/:topicId/:loId',
      name: 'PQ Report',
      config: {
        revisitRoute: true,
        noMobileHeader: true,
        withUpdatedSideNav: true,
        routeType: PRIVATE,
        activeRoute: 'homework-review',
      }
    },
    {
      Component: StudentLevelReport,
      exact: true,
      path: '/reports/classroom/:sessionId/student-level',
      name: 'Student Level Report',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'reports',
      },
    },
    {
      Component: DetailedReport,
      exact: true,
      path: '/reports/classroom/:sessionId/question-level',
      name: 'Question Level Report',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'reports',
      },
    },
    {
      Component: IndividualStudentLevelReport,
      exact: true,
      path: '/reports/classroom/:sessionId/student-level/:userId',
      name: 'Individual Student Report',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'reports',
      },
    },
    {
      Component: ClassroomCourseListing,
      exact: true,
      path: '/classrooms/:batchId',
      name: 'Classroom Details Page',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'classrooms',
      },
    },
    {
      Component: RedirectPage,
      exact: true,
      path: '/s/:redirectId',
      name: 'Dummy Page',
      config: {
        noOverflow: true,
        fullHeight: true,
        noNav: true,
        routeType: PUBLIC,
      },
    },
    {
      Component: QRCodePreview,
      exact: true,
      path: '/qr/comming-soon',
      name: 'Comming Soon',
      config: {
        noNav: true,
        routeType: PUBLIC,
      },
    },
    {
      Component: Classrooms,
      exact: true,
      path: '/training-classrooms',
      name: 'Teacher Training',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'training-classrooms',
      },
    },
    {
      Component: ClassroomCourseListing,
      exact: true,
      path: '/training-classrooms/:batchId',
      name: 'Teacher Training',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'training-classrooms',
      },
    },
    {
      Component: TrainingResourcesClasswork,
      exact: true,
      path: '/training-resources/classwork',
      name: 'Training Resources',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'training-classrooms',
      },
    },
    {
      Component: TrainingResourcesClasswork,
      exact: true,
      path: '/training-resources/classwork/:batchId',
      name: 'Training Resources',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'training-classrooms',
      },
    },
    {
      Component: TrainingResourcesAssessment,
      exact: true,
      path: '/training-resources/assessment',
      name: 'Training Resources',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'training-classrooms',
      },
    },
    {
      Component: TrainingResourcesAssessment,
      exact: true,
      path: '/training-resources/assessment/:batchId',
      name: 'Training Resources',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'training-classrooms',
      },
    },
    {
      Component: QuestionPaperGenerator,
      exact: true,
      path: '/question-paper',
      name: 'Question Paper',
      config: {
        noNav: true,
        managementApp: true,
        routeType: PRIVATE,
        activeRoute: 'question-paper',
      },
    },
  ]
  return routeComponentsList
}
