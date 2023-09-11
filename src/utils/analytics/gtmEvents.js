import { gtmEventsTrigger,gtmModule,gtmPlatform,gtmVariables,eventParamsVariables } from "./gtmConstants"

const { eventName,variableName, trigger, eventParams, userParams } = gtmVariables;
const { platform, module } = eventParamsVariables;

export const gtmEvents = {
	teacherPageView: {
		event: gtmEventsTrigger.pageView["triggerName"],
		[eventName.variableName]: "Teacher Login Visit",
		[eventParams.variableName]: {
			[module]: gtmModule.login,
            [trigger.variableName]: "User visits teacher.tekie.in",
		}
	},
	teacherLoginSuccess: {
		event: gtmEventsTrigger.loginSuccess["triggerName"],
		[eventName.variableName]: "Successful Teacher Login",
		[eventParams.variableName]: {
			[module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Login button",
		},
	},
	teacherLoginFailed: {
		event: gtmEventsTrigger.loginFailed["triggerName"],
		[eventName.variableName]: "Failed Teacher Login",
		[eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Login button",
		},
	},
    teacherResetLinkSent: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Reset Link Sent Successfully",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on the Send Link CTA",
        },
    },
    teacherResetSuccess: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Password Change Successful",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User sets new password and clicks on Submit",
        },
    },
    teacherResetFailed: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Password Change Failed",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User sets new password and clicks on Submit",
        },
    },
	forgotPasswordClicked: {
		event: gtmEventsTrigger.btnClicked["triggerName"],
		[eventName.variableName]: "Forgot Password Clicked",
		[eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Forgot Password button",
		},
	},
	resetButtonClicked: {
		event: gtmEventsTrigger.btnClicked["triggerName"],
		[eventName.variableName]: "Reset Button Clicked",
		[eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on the Reset CTA",
		},
	},
	passwordChangeSuccess: {
		event: gtmEventsTrigger.passwordChangeSuccess["triggerName"],
		[eventName.variableName]: "Password Change Success",
		[eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User sets new password and clicks on Submit",
		},
	},
	passwordChangeFailed: {
		event: gtmEventsTrigger.passwordChangeFailed["triggerName"],
		[eventName.variableName]: "Password Change Unsuccessful",
		[eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User sets new password and clicks on Submit",
		},
	},
	studentPageView: {
		[eventName.variableName]: "Student Login Visit",
		event: gtmEventsTrigger.pageView["triggerName"],
		[eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User visits student.tekie.in",
		},
	},
	otpValidationSuccess: {
		event: gtmEventsTrigger.otpValidationSuccess["triggerName"],
		[eventName.variableName]: "Successful OTP Validation",
		[eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User enters OTP and Continue CTA is clicked",
		},
	},
    otpValidationFailed: {
        event: gtmEventsTrigger.otpValidationFailed["triggerName"],
        [eventName.variableName]: "Unsuccessful OTP Validation",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User enters OTP and Continue CTA is clicked",
        },
    },
    addBuddyClick: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Clicked Add a Buddy",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Add Buddy CTA",
        },
    },
    addBuddySuccess: {
        event: gtmEventsTrigger.addBuddySuccess["triggerName"],
        [eventName.variableName]: "Buddy added successfully",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User selects buddy user from the list",
        },
    },
    otpLoginSuccess: {
        event: gtmEventsTrigger.loginSuccess["triggerName"],
        [eventName.variableName]: "Successful Student OTP Login",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Login button",
        },
    },
    otpLoginFailed: {
        event: gtmEventsTrigger.loginFailed["triggerName"],
        [eventName.variableName]: "Unsuccessful Student OTP Login",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Login button",
        },
    },
    emailLoginBtnClick: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Student email login visit",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Login with email instead",
        },
    },
    emailLoginSuccess: {
        event: gtmEventsTrigger.loginSuccess["triggerName"],
        [eventName.variableName]: "Successful Student Email Login",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User enters credentials and clicks on Continue",
        },
    },
    emailLoginFailed: {
        event: gtmEventsTrigger.loginFailed["triggerName"],
        [eventName.variableName]: "Unsuccessful Student Email Login",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User enters credentials and clicks on Continue",
        },
    },
    websiteLoginPageView: {
        event: gtmEventsTrigger.pageView["triggerName"],
        [eventName.variableName]: "Centralised Login Visit",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User visits tekie.in/login",
        },
    },
    websiteLoginTeacherVisit: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Centralised Login Teacher Visit",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User visits tekie.in/login and clicks on teacher tab",
        },
    },
    websiteTeacherLoginSuccess: {
        event: gtmEventsTrigger.loginSuccess["triggerName"],
        [eventName.variableName]: "Successful Centralised Teacher Login",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Login button",
        },
    },
    websiteTeacherLoginFailed: {
        event: gtmEventsTrigger.loginFailed["triggerName"],
        [eventName.variableName]: "Unsuccessful Centralised Teacher Login",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Login button",
        },
    },
    websiteForgotPasswordClick: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Forgot Password Clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on Forgot Password CTA",
        },
    },
    websiteResetLinkSent: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Reset Link Sent Successfully",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User clicks on the Send Link CTA",
        },
    },
    websiteResetSuccess: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Password Change Successful",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User sets new password and clicks on Submit",
        },
    },
    websiteResetFailed: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Password Change Failed",
        [eventParams.variableName]: {
            [module]: gtmModule.login,
            [trigger.variableName]: "User sets new password and clicks on Submit",
        },
    },
    studentActivityToggleOn : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Live Feed Toggle Student Activity",
        [eventParams.variableName]: {
            [module]: gtmModule.inSession,
            [trigger.variableName]: "Live Feed Toggle Student Activity On",
        },
    },
    studentActivityToggleOff : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Live Feed Toggle Student Activity",
        [eventParams.variableName]: {
            [module]: gtmModule.inSession,
            [trigger.variableName]: "Live Feed Toggle Student Activity Off",
        },
    },
    teacherClassroomPageVisit : {
        event: gtmEventsTrigger.pageView["triggerName"],
        [eventName.variableName]: "Classroom selection page visit",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User visits on teacher.tekie.in/classroom",
        },
    },
    classroomCtaClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Classroom CTA clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on classroom CTA on classroom listing page",
        },
    },
    reportsCtaClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Reports CTA clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on reports CTA on classroom listing page",
        },
    },
    logoutButtonClicked: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Logout Button clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on Logout CTA on sidebar",
        },
    },
    logoutConfirmationNo: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Logout Confirmation No",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on No CTA on Logout confirmation Modal",
        },
    },
    teacherLogoutSuccessful: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Teacher Logout Successful",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on Yes CTA on Logout confirmation Modal and Logs out",
        },
    },
    trainingResourcesCtaClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Training Resources CTA clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on training resources CTA on classroom listing page",
        },
    },
    trainingClassroomCtaClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Training Classwork CTA clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on training classroom CTA on classroom listing page",
        },
    },
    trainingAssignmentCtaClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Training Assignment CTA clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on training assignment CTA on classroom listing page",
        },
    },
    trainingCtaClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Training CTA clicked ",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on go to class CTA on training resources page",
        },
    },
    classroomSessionsPageVisit : {
        event: gtmEventsTrigger.pageView["triggerName"],
        [eventName.variableName]: "Classroom Sessions Page Visit ",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User visited on classroom course listing page",
        },
    },
    classroomSwitchedViaDropdown : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Classroom switched via dropdown ",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on grade drop down button",
        },
    },
    reportsViewedViaClassroomSessionsPage : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Reports viewed via classroom sessions page ",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on view report button",
        },
    },
    resumeSessionClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Live session clicked on card",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on resume session on card",
        },
    },
    sessionModalVisit : {
        event: gtmEventsTrigger.pageView["triggerName"],
        [eventName.variableName]: "Session modal visit ",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User visited the open session modal",
        },
    },
    retakeClassClickedOnCompleteSessionModal : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Retake class clicked on Complete Session Modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on retake class CTA inside session modal",
        },
    },
    revisitClassContentClickedOnCompleteSessionModal : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Revisit class content clicked on Complete Session Modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on revisit class content CTA inside session modal",
        },
    },
    startEvaluationClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Start evaluation clicked ",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on start evaluation CTA inside session modal",
        },
    },
    resumeClassClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Resume class clicked ",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on resume class CTA inside session modal",
        },
    },
    endClassClickedOnLiveSessionModal : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "End class clicked on Live Session Modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on end class CTA inside session modal",
        },
    },
    viewContentClicked : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "View content clicked ",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on view content CTA inside session modal",
        },
    },
    viewContentClassClickedOnAllotedSessionModal : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "View content class clicked on Alloted Session Modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on view content class CTA inside session modal",
        },
    },
    startClassClickedOnAllotedSessionModal : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Start class clicked on Alloted Session modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on start class CTA inside session modal",
        },
    },
    resumeSessionClickedInsideModal : {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Resume session clicked inside session modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on resume session CTA on sessions page",
        },
    },
    startSessionClicked: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Alloted session card selected",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on start session CTA on the sessions page",
        },
    },
    completedSessionClicked: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Completed session card selected",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on completed session cta on sessions page",
        },
    },
    futureSessionCardClicked: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Future session card selected",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on upcoming session cta on sessions page",
        },
    },
    courseFilterCtaClicked: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Course filter CTA clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked course filter tab",
        },
    },
    teacherManualOnSessionsPageClicked: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Teacher manual CTA clicked inside session flow",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on teacher manual on sessions listing page",
        },
    },
    teacherManualSessionsModalClicked: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Teacher manual CTA clicked inside view content flow",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on teacher manual CTA on sessions modal",
        },
    },
    teacherManualSessionEmbedClicked: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Teacher manual sessions embed clicked",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on teacher manual CTA on sessions embed page",
        },
    },
    inSessionPageVisit: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "In Session page visit",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User visited the In Session page",
        },
    },
    continueCTAClickedOnClassOTPModal: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Continue cta clicked on class otp modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on continue cta on otp modal",
        },
    },
    otpCTAClickedOnInSessionPage: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "OTP cta clicked on In Session page",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on OTP cta on In Session page",
        },
    },
    attendanceCTAClickedOnInSessionPage: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Attendance CTA clicked on In Session page",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on attendance cta on In Session page",
        },
    },
    presentCTAClickedInsideAttendanceModal: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Present CTA clicked inside attendance modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on present cta inside attendance modal",
        },
    },
    absentCTAClickedInsideAttendanceModal: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Absent CTA clicked inside attendance modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on absent cta inside attendance modal",
        },
    },
    backIconCTAClickedOnInSessionPage: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Back icon cta clicked on in session page",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on back icon cta on In Session page",
        },
    },
    endClassCTAClickedOnInSessionPage: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "End class CTA clicked on In Session page",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked end class cta on In Session page",
        },
    },
    markAsCompleteCTAClickedInsideEndClassModal: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Mark As Complete CTA clicked inside End Class modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on mark as incomplete cta inside end class modal",
        },
    },
    modalEndClassCTAClickedInsideEndClassModal: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Modal end class cta clicked inside end class modal",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on end class cta inside end class modal",
        },
    },
    nextCTAClickedInsideInSessionFooter: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "Next CTA clicked inside In Session footer",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on next cta inside In Session page on footer",
        },
    },
    endSessionClickedInsideInSessionFooter: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        [eventName.variableName]: "End Session clicked inside In Session footer",
        [eventParams.variableName]: {
            [module]: gtmModule.sessions,
            [trigger.variableName]: "User clicked on end session cta on In Session page on footer",
        },
    },
    videoCTAClickedInSessionSidebar: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        eventName: "Video CTA clicked in-session sidebar",
        eventParams: {
            [module]: gtmModule.inSessionSidebar,
            [trigger.variableName]: "User clicked on Video CTA in the in-session sidebar",
        },
    },
    learningSlidesCTAClickedInSessionSidebar: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        eventName: "Learning slides CTA clicked in-session sidebar",
        eventParams: {
            [module]: gtmModule.inSessionSidebar,
            [trigger.variableName]: "User clicked on Learning slides CTA in the in-session sidebar",
        },
    },
    practiceQuizReportCTAClickedInSessionSidebar: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        eventName: "Practice Quiz report CTA clicked in-session sidebar",
        eventParams: {
            [module]: gtmModule.inSessionSidebar,
            [trigger.variableName]: "User clicked on Practice Quiz report CTA in the in-session sidebar",
        },
    },
    showCorrectAnswerToggleClickedForPracticeQuiz: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        eventName: "Show correct answer toggle clicked for Practice Quiz",
        eventParams: {
            [module]: gtmModule.practiceQuiz,
            [trigger.variableName]: "User clicked on show correct answer toggle for Practice Quiz",
        },
    },
    codingAssignmentCTAClickedInSessionSidebar: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        eventName: "Coding Assignment CTA clicked in-session sidebar",
        eventParams: {
            [module]: gtmModule.inSessionSidebar,
            [trigger.variableName]: "User clicked on Coding Assignment CTA in the in-session sidebar",
        },
    }, 
    showCorrectAnswerToggleClickedForCodingAssignment: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        eventName: "Show correct answer toggle clicked for coding assignment",
        eventParams: {
            [module]: gtmModule.codingAssignment,
            [trigger.variableName]: "User clicked on show correct answer toggle for coding assignment",
        },
    },
    homeworkDiscussionCTAClickedInSessionSidebar: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        eventName: "Homework Discussion CTA clicked in-session sidebar",
        eventParams: {
            [module]: gtmModule.inSessionSidebar,
            [trigger.variableName]: "User clicked on Homework Discussion CTA in the in-session sidebar",
        },
    },
    blockAssignmentCTAClickedInSessionSidebar: {
        event: gtmEventsTrigger.btnClicked["triggerName"],
        eventName: "Block Assignment CTA clicked in-session sidebar",
        eventParams: {
            [module]: gtmModule.inSessionSidebar,
            [trigger.variableName]: "User clicked on Block Assignment CTA in the in-session sidebar",
        },
    },    
}
