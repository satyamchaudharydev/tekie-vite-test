const mixPanelRoutesToElementMap = {
    login: {
        pageIdentifier: 'mixpanel-login-identifier',
        pageTitle: 'Login'
    },
    sessions: {
        pageIdentifier: 'sessions-page-mixpanel-identifier',
        pageTitle: 'Sessions'
    },
    video: {
        pageIdentifier: 'video-page-mixpanel-identifier',
        pageTitle: 'Video'
    },
    chat: {
        pageIdentifier: 'chat-page-mixpanel-identifier',
        pageTitle: 'Chat'
    },
    'comic-strip': {
        pageIdentifier: 'comic-strip-page-mixpanel-identifier',
        pageTitle: 'Comic Strip'
    },
    'learning-slides': {
        pageIdentifier: 'learning-slides-page-mixpanel-identifier',
        pageTitle: 'Learning Slides'
    },
    'practice-quiz': {
        pageIdentifier: 'practice-quiz-page-mixpanel-identifier',
        pageTitle: 'Practice Quiz'
    },
    'practice-report': {
        pageIdentifier: 'practice-report-page-mixpanel-identifier',
        pageTitle: 'Practice Report'
    },
    project: {
        pageIdentifier: 'project-page-mixpanel-identifier',
        pageTitle: 'Project'
    },
    practice: {
        pageIdentifier: 'practice-page-mixpanel-identifier',
        pageTitle: 'Practice'
    },
    codingAssignment: {
        pageIdentifier: 'codingAssignment-page-mixpanel-identifier',
        pageTitle: 'Coding Assignment'
    },
    coding: {
        pageIdentifier: 'codingAssignment-page-mixpanel-identifier',
        pageTitle: 'Coding Assignment'
    },
    homework: {
        pageIdentifier: 'homework-page-mixpanel-identifier',
        pageTitle: 'Homework'
    },
    quiz: {
        pageIdentifier: 'quiz-page-mixpanel-identifier',
        pageTitle: 'Quiz'
    },
    'homework-quiz': {
        pageIdentifier: 'quiz-page-mixpanel-identifier',
        pageTitle: 'Quiz'
    },
    'quiz-report': {
        pageIdentifier: 'quiz-report-page-mixpanel-identifier',
        pageTitle: 'Quiz Report'
    },
    'quiz-report-first': {
        pageIdentifier: 'quiz-report-page-mixpanel-identifier',
        pageTitle: 'First Quiz Report'
    },
    'quiz-report-latest': {
        pageIdentifier: 'quiz-report-page-mixpanel-identifier',
        pageTitle: 'Latest Quiz Report'
    },
    'homework-practice': {
        pageIdentifier: 'homework-practice-page-mixpanel-identifier',
        pageTitle: 'Homework Practice'
    },
    'homework-codingAssignment': {
        pageIdentifier: 'homework-codingAssignment-page-mixpanel-identifier',
        pageTitle: 'Homework Assignment'
    },
    'code-playground': {
        pageIdentifier: 'code-playgroud-page-mixpanel-identifier',
        pageTitle: 'Code Playground'
    },
    'student-community': {
        pageIdentifier: 'student-community-page-mixpanel-identifier',
        pageTitle: 'Student Community'
    },
    cheatsheet: {
        pageIdentifier: 'cheatsheet-page-mixpanel-identifier',
        pageTitle: 'Cheatsheet'
    },
    // Teacher app pages config
    reports: {
        pageIdentifier: 'reports-page-mixpanel-identifier',
        pageTitle: 'Classroom Reports'
    },
    classrooms: {
        pageIdentifier: 'classrooms-page-mixpanel-identifier',
        pageTitle: 'Classrooms'
    },
    'reports/classroom': {
        pageIdentifier: 'classroom-reports-page-mixpanel-identifier',
        pageTitle: 'Individual Classroom Report'
    },
    'session-embed': {
        pageIdentifier: 'session-embed-page-mixpanel-identifier',
        pageTitle: 'Session Embed'
    },
    'pq-report': {
        pageIdentifier: 'pq-report-page-mixpanel-identifier',
        pageTitle: 'Practice Report'
    },
    'homework--review': {
        pageIdentifier: 'homework-review-page-mixpanel-identifier',
        pageTitle: 'Homework Review'
    },
    'reports/classroom/student-level': {
        pageIdentifier: 'student-level-page-mixpanel-identifier',
        pageTitle: 'Student Level Report'
    },
    'reports/classroom/question-level': {
        pageIdentifier: 'question-level-page-mixpanel-identifier',
        pageTitle: 'Question Level Report'
    },
    'reports/classroom/student-level/individual-student': {
        pageIdentifier: 'individual-student-level-page-mixpanel-identifier',
        pageTitle: 'Individual Student Level Report'
    },
    'individual-classrooms': {
        pageIdentifier: 'individual-classrooms-page-mixpanel-identifier',
        pageTitle: 'Classroom Details'
    }
}

export const mixPanelEvents = {
    PAGE_VIEWED: 'page_viewed',
    OTP_LOGIN: 'otp_login',
    START_SESSION: 'start_session',
    REVISIT_SESSION: 'revisit_session'
}

export const appNames = {
    STUDENT_APP: 'Student App',
    TEACHER_APP: 'Teacher App',
    DESKTOP_APP: 'Desktop App'
}

export const mixPanelFields = {
    pageLoadTime: 'Page Load Time (Sec)',
    pageTitle: 'Page Title',
    netSpeed: 'Net Speed (Mbps)',
    appName: 'App Name',
    studentId: 'Student Id',
    studentName: 'Student Name',
    grade: 'Grade',
    section: 'Section',
    rollNo: 'Roll No',
    schoolName: 'School Name',
    coursePackage: 'Course Package',
    businessType: 'Business type',
    teacherId: 'Teacher Id',
    teacherName: 'Teacher Name'
}

export default mixPanelRoutesToElementMap;
