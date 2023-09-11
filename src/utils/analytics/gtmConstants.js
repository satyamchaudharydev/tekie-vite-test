const gtmPlatform = {
    teacherApp: "Teacher App",
    studentApp: "Student App",
    website: "Website",
    other: "Other",
}

const gtmModule = {
    login: "Login",
	inSession: "InSession",
	sessions: "Sessions",
	sidebar: "Sidebar",
	learningResources:"LearningResources",
}

const gtmTags = {
	login: {
		tagName: "login",
		tagDisplayName: "Login",
	}
}
const type = {
	customEvent: "customEvent" ,
	dataLayerVariable: "dataLayerVariable"
}

const { customEvent,dataLayerVariable } = type;
const gtmEventsTrigger = {
		btnClicked: {
			triggerType: customEvent,
			triggerName: "btn_click",
			triggerDisplayName: "Button Clicked" 
		},
		pageView: {
			triggerType: customEvent,
			triggerName: "page_view",
			triggerDisplayName: "Page View"
		},
		loginSuccess: {
			triggerType: customEvent,
			triggerName: "login_success",
			triggerDisplayName: "Login Success"
		},
		loginFailed: {
			triggerType: customEvent,
			triggerName: "login_failed",
			triggerDisplayName: "Login Failed"
		},
		passwordChangeSuccess: {
			triggerType: customEvent,
			triggerName: "password_change_success",
			triggerDisplayName: "Password Change Success",
		},
		passwordChangeFailed: {
			triggerType: customEvent,
			triggerName: "password_change_failed",
			triggerDisplayName: "Password Change Failed",
		},
		forgotPasswordClicked: {
			triggerType: customEvent,
			triggerName: "forgotPasswordClicked",
			triggerDisplayName: "Forgot Password Clicked"
		},
		otpValidationFailed: {
			triggerType: customEvent,
			triggerName: "otp_validation_failed",
			triggerDisplayName: "Otp Validation Failed"
		},
		otpValidationSuccess: {
			triggerType: customEvent,
			triggerName: "otp_validation_success",
			triggerDisplayName: "Otp Validation Success"
		},
	
		addBuddySuccess:{
			triggerType: customEvent,
			triggerName: "add_buddy_success",
			triggerDisplayName: "Add Buddy Success"
		},
		reset: {
			triggerType: customEvent,
			triggerName: "reset_button_click",
		}
};


const gtmVariables = {
	eventName: {
		variableName: "eventDisplayName",
		variableDisplayName: "eventDisplayName",
		variableType: dataLayerVariable,
	},
	trigger: {
		variableName: "trigger",
		variableDisplayName: "trigger",
		variableType: dataLayerVariable,
	},
	eventParams: {
		variableName: "eventParams",
		variableDisplayName: "eventParams",
		variableType: dataLayerVariable,
	},
	userParams: {
		variableName: "userParams",
		variableDisplayName: "userParams",
		variableType: dataLayerVariable,
	},
	userParamsSecondary: {
		variableName: "userParamsSecondary",
		variableDisplayName: "userParamsSecondary",
		variableType: dataLayerVariable,
	},
	eventParamsSecondary: {
		variableName: "eventParamsSecondary",
		variableDisplayName: "eventParamsSecondary",
		variableType: dataLayerVariable,
		
	},
}

const eventParamsVariables = {
	platform: "platform",
	module: "module",
	pageLoadTime: "pageLoadTime",
}

const userParamsVariables = {
	userId: "userId",
	role: "role",
	schoolId: "schoolId",
	grade: "grade",
	rollNo: "rollNo",
	section: "section",
	userName: "userName",
	coursePackageName: "coursePackageName",
	batchId: "batchId",
	batchCode: "batchCode",
	classroomTitle: "classroomTitle",
	courseId: "courseId",
	schoolName: "schoolName",
	topicId: "topicId",
	sessionId: "sessionId",
	videoTitle: "videoTitle",
	loTitle: "loTitle",
	loId:"loId",
}


export {
    gtmEventsTrigger,
    gtmPlatform,
    gtmModule,
	gtmVariables,
	eventParamsVariables,
	userParamsVariables
}