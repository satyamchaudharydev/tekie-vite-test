// @type can be one of 'arrayOfObjects' | 'object' | 'element'

const homepageSchema = {
  currentCourse: {
    type: "arrayOfObjects",
  },
  currentTopicComponent: {
    type: "element",
  },
  currentTopicComponentDetail: {
    type: "object",
  },
  totalChapters: {
    type: "element",
  },
  totalTopics: {
    type: "element",
  },
};



const schema = {
  chapter: {
    children: ["topic"],
    alias: ["chapters", "addToChapter"],
    type: "arrayOfObjects",
  },
  topic: {
    children: ["learningObjective"],
    alias: ["topics", "totalTopicsTemp", 'topic'],
    type: "arrayOfObjects",
  },
  coursePackages: {
    alias: ["coursePackages", "coursePackage"],
    type: "arrayOfObjects",
  },
  sessionFeedbackTags: {
    alias: ["sessionFeedbackTags"],
  },
  eBookCourse: {
    alias: ["eBookCourses"],
    type: "arrayOfObjects",
  },
  user: {
    alias: [
      "login",
      "users",
      "updateUser",
      "parentChildSignUp",
      "updateParentChildDetail",
    ],
    children: ["studentProfile"],
    type: "arrayOfObjects",
  },
 
  learningObjective: {
    type: "arrayOfObjects",
    children: ["message"],
    alias: ["learningObjectives"],
  },
  userVideo: {
    type: "arrayOfObjects",
    children: ["topic"],
    alias: ["userVideos", "updateUserVideo", "updateUserVideos"],
  },
  notice: {
    type: "arrayOfObjects",
    alias: ["addNotice", "notices", "notice"],
  },
  noticeAttachment: {
    type: "arrayOfObjects",
    alias: ["noticeAttachment"],
  },
  studentReview: {
    type: "arrayOfObjects",
    alias: ["studentReviewByMentor", "studentReview"],
  },
  userBlockBasedProjects: {
    type: "arrayOfObjects",
    alias: ["userBlockBasedProjects"],
  },
  userBlockBasedPractices: {
    type: "arrayOfObjects",
    alias: ["userBlockBasedPractices"],
  },
  userLearningObjective: {
    type: "arrayOfObjects",
    children: ["learningObjective"],
    alias: [
      "userLearningObjectives",
      "updateUserLearningObjective",
      "updateUserLearningObjectives",
    ],
  },
  message: {
    type: "arrayOfObjects",
    alias: ["messages"],
  },
  userProfile: {
    type: "arrayOfObjects",
    alias: ["userProfiles"],
    children: ["topic"],
  },
  userQuiz: {
    type: "arrayOfObjects",
    alias: ["userQuizs"],
    children: ["topic"],
  },
  userQuizDetails: {
    type: "arrayOfObjects",
    alias: ["userQuizReports", "userProfiles"],
  },
  userQuizReport: {
    type: "arrayOfObjects",
    alias: ["userQuizReports"],
  },
  userFirstAndLatestQuizReport: {
    type: "arrayOfObjects",
    alias: ["getQuizReport"],
  },
  userFirstAndLatestQuizReports: {
    type: "arrayOfObjects",
    alias: ["userFirstAndLatestQuizReports"],
  },
  userPracticeQuestionReport: {
    type: "arrayOfObjects",
    alias: ["userPracticeQuestionReports"],
  },
  rewatchMeta: {
    type: "Object",
  },
  learningVideosCountRewatch: {
    type: "element",
  },
  quizCountRewatch: {
    type: "element",
  },
  chatCountRewatch: {
    type: "element",
  },
  pqCountRewatch: {
    type: "element",
  },
  userTopicJourney: {
    type: "arrayOfObjects",
  },
  dumpQuiz: {
    type: "object",
  },
  dumpComicStrip: {
    type: "object",
  },
  dumpBlockBasedProject: {
    type: "object",
  },
  dumpBlockBasedPractise: {
    type: "object",
  },
  userBadge: {
    type: "arrayOfObjects",
  },
  resetPassword: {
    type: "Object",
  },
  userQuizAnswers: {
    type: "arrayOfObjects",
  },
  sendForgotPasswordLink: {
    type: "object",
  },
  unlockBadge: {
    type: "arrayOfObjects",
    alias: ["getUnlockedUserBadge"],
  },
  guestMode: {
    type: "object",
  },
  ...homepageSchema,
  menteeCourseSyllabus: {
    type: "arrayOfObjects",
  },
  availableSlot: {
    type: "arrayOfObjects",
    alias: ["availableSlots", "mentorAvailabilitySlots"],
  },
  addMenteeSession: {
    type: "arrayOfObjects",
    alias: ["addMenteeSessions"],
  },
  mentorMenteeSession: {
    type: "arrayOfObjects",
    alias: [
      "addMentorMenteeSession",
      "mentorMenteeSessions",
      "updateMentorMenteeSession",
    ],
  },
  mentorSession: {
    type: "arrayOfObjects",
    alias: ["mentorSessions", 'addMentorSession', "updateMentorSession"],
  },
  menteeSession: {
    type: "arrayOfObjects",
    alias: ["menteeSessions"],
  },
  studentProfile: {
    alias: ["updateStudentProfile", "addStudentProfile"],
    type: "arrayOfObjects",
  },
  schoolStudentProfiles: {
    alias: ["schoolStudentProfiles"],
    type: "arrayOfObjects",
  },
  totalStudentProfiles: {
    type: "arrayOfObjects",
    alias: ["totalStudentProfiles"],
  },
  schoolMentorProfiles: {
    alias: ["schoolMentorProfiles"],
    type: "arrayOfObjects",
  },
  totalMentorProfiles: {
    alias: ["totalMentorProfiles"],
    type: "arrayOfObjects",
  },
  userAssignment: {
    alias: ["userAssignments"],
    type: "arrayOfObjects",
  },
  paymentRequest: {
    type: "object",
    alias: ["getPaymentRequest"],
  },
  paymentResponse: {
    type: "object",
    alias: ["getPaymentResponse"],
  },
  product: {
    type: "arrayOfObjects",
    alias: ["products"],
  },
  discount: {
    type: "arrayOfObjects",
    alias: ["discounts"],
  },
  userInvite: {
    type: "arrayOfObjects",
    alias: ["userInvites"],
  },
  userCredit: {
    type: "arrayOfObjects",
    alias: ["userCredits"],
  },
  userCourseCompletions: {
    type: "arrayOfObjects",
    alias: ["userCourseCompletions"],
  },
  userCourse: {
    type: "arrayOfObjects",
    alias: ["getUserCourses"],
  },
  userCourseCertificate: {
    alias: ["userCourseCertificate"],
    type: "object",
  },
  eventSessions: {
    alias: ["eventSessions", "eventSession", "updateEventSession"],
    type: "arrayOfObjects",
  },
  eventCertificate: {
    alias: ["eventCertificate"],
    type: "object",
  },
  userCreditLog: {
    type: "arrayOfObjects",
    alias: ["userCreditLogs"],
  },
  userInvitesMeta: {
    type: "element",
  },
  userChildren: {
    type: "arrayOfObjects",
  },
  userParent: {
    type: "arrayOfObjects",
  },
  netPromoterScore: {
    alias: ["netPromoterScores", "addNetPromoterScore"],
    type: "arrayOfObjects",
  },
  salesOperation: {
    type: "arrayOfObjects",
    alias: ["salesOperations"],
  },
  savedCode: {
    type: "arrayOfObjects",
    alias: [
      "savedCode",
      "addSavedCode",
      "userSavedCode",
      "userSavedCodes",
      "addUserSavedCode",
      "updateSavedCode",
      "deleteSavedCode",
    ],
  },
  totalSavedCodes: {
    type: "arrayOfObjects",
    alias: [
      "savedCode",
      "addSavedCode",
      "userSavedCode",
      "userSavedCodes",
      "deleteSavedCode",
    ],
  },
  totalSavedCodesInReview: {
    type: "arrayOfObjects",
    alias: [
      "savedCode",
      "addSavedCode",
      "userSavedCode",
      "userSavedCodes",
      "deleteSavedCode",
    ],
  },
  totalSavedCodesPublished: {
    type: "arrayOfObjects",
    alias: [
      "savedCode",
      "userSavedCode",
    ],
  },
  approvedCodes: {
    type: "arrayOfObjects",
    alias: ["approvedCodes", "userApprovedCodes"],
  },
  totalApprovedCodes: {
    type: "arrayOfObjects",
  },
  trendingUserApprovedCode: {
    type: "arrayOfObjects",
    alias: ["approvedCodes", "userApprovedCodes"],
  },
  userApprovedCodeTags: {
    type: "arrayOfObjects",
    alias: ["userApprovedCodeTags"],
  },
  userApprovedCodeTagMappingsCount: {
    type: "Objects",
    alias: ["userApprovedCodeTagMappingsCount"],
  },
  approvedCodeReactionLogs: {
    type: "arrayOfObjects",
    alias: ["approvedCodeReactionLogs", "userApprovedCodeReactionLogs"],
  },
  updateVisitorReactionOnUserApprovedCode: {
    type: "object",
    alias: ["updateVisitorReactionOnUserApprovedCode"],
  },
  batchSession: {
    type: "arrayOfObjects",
    alias: ["batchSessions", 'addBatchSession'],
  },
  batchReports: {
    type: "object",
    alias: ["batchReports"],
  },
  updateBatch: {
    type: "object",
    alias: ["updateBatch"],
  },
  updateBatchSession: {
    type: 'object',
    alias: ['updateBatchSession']
  },
  updateAdhocSession: {
    type: 'object',
    alias: ['updateAdhocSession']
  },
  schoolSessions: {
    type: "arrayOfObjects",
    alias: ["schoolSessions"],
  },
  adhocSessions: {
    type: "arrayOfObjects",
    alias: ["adhocSessions"],
  },
  updateSchool: {
    type: "arrayOfObjects",
    alias: ["updateSchool"],
  },
  schoolClasses: {
    type: "arrayOfObjects",
    alias: ["schoolClasses"],
  },
  schoolBatches: {
    type: "arrayOfObjects",
    alias: ["schoolBatches"],
  },
  totalSchoolBatches: {
    type: "arrayOfObjects",
    alias: ["totalBatches"],
  },
  getCheatSheet: {
    type: "Objects",
  },
  userHomeworkStreaks: {
    type: "arrayOfObjects",
  },
  cheatSheetTopics: {
    alias: ["cheatSheetTopics"],
    type: "arrayOfObjects",
  },
  cheatSheetConcepts: {
    alias: ["cheatSheetConcepts", "updateUserCheatSheet", "addUserCheatSheet"],
    type: "arrayOfObjects",
  },
  cheatSheetsBySearch: {
    type: "arrayOfObjects",
  },
  favouriteCheats: {
    type: "arrayOfObjects",
  },
  courses: {
    alias: ["courses"],
    type: "arrayOfObjects",
  },
  course: {
    alias: ["course"],
    type: "object",
  },
  courseTopics: {
    alias: ["courseTopic"],
    type: "arrayOfObjects",
  },
  teacherAppClassrooms: {
    alias: ["teacherAppClassroom", "classrooms"],
    type: "arrayOfObjects",
  },
  calendarTimeRange: {
    alias: ['calendarTimeRange'],
    type: 'arrayOfObjects'
  },
  classroomCourses: {
    alias: ["classroomCourses", "classroomCourse"],
    type: "arrayOfObjects",
  },
  getStudentCurrentStatus: {
    type: "object",
  },
  schoolProfile: {
    alias: ["schoolProfile"],
    type: "object",
  },
  eventCategories: {
    alias: ["eventCategories"],
    type: "arrayOfObjects",
  },
  contentTags: {
    alias: ["contentTags"],
    type: "arrayOfObjects",
  },
  eventsDetails: {
    alias: ["events"],
    type: "arrayOfObjects",
  },
  events: {
    alias: ["events", "event", "updateEvent"],
    type: "arrayOfObjects",
  },
  eventCertificates: {
    alias: ["eventCertificates"],
    type: "arrayOfObjects",
  },
  eventSpeakers: {
    alias: ["eventSpeakers", "eventSpeaker", "getEventSpeaker"],
    type: "arrayOfObjects",
  },
  previousEventDetails: {
    alias: ["previousEventDetails"],
    type: "arrayOfObjects",
  },
  teacherBatches: {
    alias: ["teacherBatches", "teacherBatch", "addBatch", "updateBatch"],
    type: "arrayOfObjects",
  },
  teacherClassrooms: {
    alias: ["teacherClassrooms"],
    type: "arrayOfObjects",
  },
  schoolBatchCodes: {
    alias: ["schoolBatchCodes"],
    type: "arrayOfObjects",
  },
  classroomNextSessions: {
    alias: ["classroomNextSessions", "getNextOrPrevClassroomSessions"],
    type: "arrayOfObjects",
  },
  classroomPreviousSessions: {
    alias: ["classroomPreviousSessions"],
    type: "arrayOfObjects",
  },
  currentClassroomMeta: {
    alias: ['currentClassroomMeta'],
    type: 'object'
  },
  classroomSessions: {
    alias: [
      "classroomSession",
      "addClassroomSession",
      "updateClassroomSession",
      "deleteClassroomSession",
    ],
    type: "arrayOfObjects",
  },
  previousSessionTopicData: {
    alias: ['previousSessionTopicData'],
    type: 'arrayOfObjects'
  },
  classroomDetail: {
    alias: ["classroomDetail"],
    type: "object",
  },
  classroomDetails: {
    alias: ["classroomDetails"],
    type: "arrayOfObjects",
  },
  batchDetails: {
    alias: ['batchDetail'],
    type: "arrayOfObjects",
  },
  getPracticeQuestionReport: {
    alias: ['getPracticeQuestionReport'],
    type: "object",
  },
  getClassroomReport: {
    alias: ['getClassroomReport'],
    type: "object",
  },
  getClassroomReportForBlockBasedPractice: {
    alias: ['getClassroomReportForBlockBasedPractice'],
    type: "object",
  },
  blocklyReports: {
    alias: ['blocklyReport'],
    type: "object",
  },
  recordingBatches: {
    alias: ["recordingBatches"],
    type: "arrayOfObjects",
  },
  homeworkStudentsData: {
    alias: ["homeworkStudentsData"],
    type: "arrayOfObjects",
  },
  getHomeworkTitle: {
    alias: ["getHomeworkTitle"],
    type: "arrayOfObjects",
  },
  batchSessionData: {
    type: "object",
    alias: ["batchSessionData"],
  },
  addMentorProfile: {
    type: "object",
    alias: ["addMentorProfile"],
  },
  classroomStudentsData: {
    alias: ["classroomStudentsData"],
    type: "arrayOfObjects",
  },
  learningSlide: {
    type: 'arrayOfObjects',
    alias: ['learningSlide', 'learningSlides']
  },
  userActivityLearningSlideDump: {
    type: 'arrayOfObjects',
    alias: [
      'userActivityLearningSlideDump',
      'userActivityLearningSlideDumps',
      'addUserActivityLearningSlideDump'
    ]
  },
  classroomGrades: {
    alias: ["classroomGrades"],
    type: "arrayOfObjects",
  },
  studentsData: {
    alias: ["addStudentsData"],
    type: "arrayOfObjects",
  },
  updateStudentsData: {
    alias: ["updateStudentsData"],
    type: "arrayOfObjects",
  },
  homeworkReview: {
    alias: ["homeworkReview"],
    type: "arrayOfObjects",
  },
  fetchQuizQuestions1: {
    alias: ["fetchQuizQuestions1"],
    type: "arrayOfObjects",
  },
  homeworkReviewTopicDetail: {
    alias: ["homeworkReviewTopicDetail"],
    type: "arrayOfObjects",
  },
  codingQuestionData: {
    alias: ["codingQuestionData"],
    type: "arrayOfObjects",
  },
  fetchBlocklyQuestion: {
    alias: ["fetchBlocklyQuestion"],
    type: "arrayOfObjects",
  },
  fetchPqReportDetail: {
    alias: ["fetchPqReportDetail"],
    type: "array",
  },
  fetchQuizQuestionsPq: {
    alias: ["fetchQuizQuestionsPq"],
    type: "array",
  },
  fetchQuizQuestionsIndividualPq: {
    alias: ["fetchQuizQuestionsIndividualPq"],
    type: "array",
  },
  topicDetailPq: {
    alias: ["topicDetailPq"],
    type: "arrayofObjects",
  },
  fetchPqStudentReport: {
    alias: ["fetchPqStudentReport"],
    type: "arrayofObjects",
  },
  eventWinners: {
    alias: ['eventWinners', 'eventWinner', 'getEventWinner'],
    type: 'arrayOfObjects'
  },
  allStudentsQuizAnswers: {
    type: 'arrayOfObjects',
    alias: ['allStudentsQuizAnswers']
  },
  batchesMeta: {
    type: 'object',
    alias: ['batchesMeta']
  },
  fetchTopicComponentRule: {
    type: 'arrayOfObjects',
    alias: ['fetchTopicComponentRule']
  },
  fetchLiveAttendance: {
    type: 'arrayOfObjects',
    alias: ['fetchLiveAttendance']
  },
  schoolDetails: {
    type: "object",
    alias: ["getSchoolDetails"]
  },
  fetchHomeworkReviewCurrentTopicDetail: {
    type: 'arrayOfObjects',
    alias: ['homeworkReviewCurrentTopicDetail']
  },
  questionBanks: {
    type: 'arrayOfObjects'
  },
  assignmentQuestions: {
    type: 'arrayOfObjects'
  },
  blockBasedProjects: {
    type: 'arrayOfObjects'
  },
  menteeCourseHomework: {
    type: 'arrayOfObjects'
  },
  batches: {
    alias: ['batches'],
    type: 'arrayOfObjects'
  },
  batchCoursePackageDetail: {
    alias: ['batchCoursePackageDetail'],
    type: 'arrayOfObjects',
  },
  currentTopicDetail: {
    type: 'object',
  },
  userAssignments: {
    alias: ['addUserAssignment', 'userAssignments'],
    type: 'arrayOfObjects'
  },
  evaluationData: {
    type: 'object'
  },
  homeWorkMeta: {
    alias: ['homeWorkMeta'],
    type: 'object'
  },
  fetchBatchSessionOtp: {
    type: "object",
    alias: ["fetchBatchSessionOtp"]
  },
  markSessionAsIncomplete: {
    type: 'object',
    alias: ['markSessionAsIncomplete']
  },
  mentorChild: {
    type: 'object'
  },
  sessionComponentTrackers: {
    type: 'arrayOfObjects',
  },
  videos: {
    type: 'arrayOfObjects',
    alias: ['videos']
  },
  learnVideos: {
    type: 'arrayOfObjects',
    alias: ['learnVideos']
  },
  fetchRestApi: {
    type: 'object',
  }
  
}

export default schema;
