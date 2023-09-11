const getTeacherAppRoute = ({ isSchoolTrainer = false, isSchoolTeacher, isQuestionPaperGeneratorEnabled = false }) => {
    let TEACHER_APP = []
    if (isSchoolTeacher) {
        TEACHER_APP = [
            // { title: 'Dashboard', isActive: true, iconType: 'dashboard', route: '/sessions' },
            { title: 'Classrooms', isActive: true, iconType: 'classroom', route: '/teacher/classrooms',allowedRoles:['mentor','schoolAdmin','schoolTeacher'] },
            { title: 'Reports', isActive: true, iconType: 'reports', route: '/teacher/reports',allowedRoles:['mentor','schoolAdmin','schoolTeacher'] },
            // { title: 'Students', isActive: true, iconType: 'timeTable', route: '/students',allowedRoles:['schoolAdmin'] }
            // { title: 'Session Embed', isActive: true, iconType: 'classroom', route: '/teacher/session-embed', },
            // { title: 'Switch to student app', isActive: true, iconType: 'timeTable', route: '/sessions' },
            // { title: 'Students', isActive: false, iconType: 'student', route: '/sessions' },
            // { title: 'Course', isActive: false, iconType: 'course', route: '/sessions' },
            // { title: 'Reports', isActive: true, iconType: 'reports', route: '/sessions' },
            // { title: 'Settings', isActive: true, iconType: 'settings', route: '/sessions' },
            // { title: 'Contact Us', isActive: true, iconType: 'contact', route: '/sessions' }
        ]
    }
    if (isSchoolTeacher && isQuestionPaperGeneratorEnabled) {
        TEACHER_APP.push({
            title: 'Question Paper', isActive: true, iconType: 'questionPaper', route: '/teacher/question-paper', allowedRoles: ['mentor', 'schoolAdmin', 'schoolTeacher']
        })
    }
    return TEACHER_APP
}

const getTrainingDashboardRoute = ({ isSchoolTrainer, isTeacherAddedInBatch }) => {
    let TRAINING_APP = []
    if (isSchoolTrainer) {
        TRAINING_APP = [
            {
                title: 'Teacher Training',
                isActive: true,
                iconType: 'trainingClassrooms',
                route: '/teacher/training-classrooms',
                allowedRoles: ['mentor', 'schoolAdmin', 'schoolTeacher'],
                type: 'parent'
            },
        ]
    }
    if (isTeacherAddedInBatch) {
        TRAINING_APP = [
            {
                title: 'Training Resources',
                isActive: true,
                iconType: 'trainingClassrooms',
                allowedRoles: ['mentor', 'schoolAdmin', 'schoolTeacher'],
                name: 'Training Resources',
                childrens: [
                    {
                        title: 'Classwork',
                        isActive: true,
                        iconType: 'notebookIcon',
                        route: '/teacher/training-classrooms/classwork',
                        allowedRoles: ['mentor', 'schoolAdmin', 'schoolTeacher'],
                        name: 'Training Resources',
                    },
                    {
                        title: 'Assignments',
                        isActive: true,
                        iconType: 'notebookIcon',
                        route: '/teacher/training-classrooms/assessment',
                        allowedRoles: ['mentor', 'schoolAdmin', 'schoolTeacher'],
                        name: 'Training Resources',
                    },
                ]
            },
        ]
    }
    return TRAINING_APP
}

const STUDENT_APP = [{ title: 'Dashboard', isActive: true, iconType: 'classroom', route: '/sessions' },
{ title: 'Classroom', isActive: true, iconType: 'classroom', route: '/sessions' },
{ title: 'Homework', isActive: true, iconType: 'classroom', route: '/sessions' },
{ title: 'My Teacher', isActive: false, iconType: 'classroom', route: '/sessions' },]

export { getTeacherAppRoute, STUDENT_APP, getTrainingDashboardRoute }