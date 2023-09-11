import gql from 'graphql-tag'
import { get } from 'lodash'
import { getToasterBasedOnType } from '../components/Toaster'
import config from '../config'
import duck from '../duck'
import store from '../store'
import { isSubDomainActive } from '../utils/extractSubdomain'
import isSchoolWebsite from '../utils/isSchoolWebsite'
import getUserForState from "./utils/signupLoginUser";
import getRole from '../constants/roleGroup'
export const failureToasterProps = (e) => {
	if (e && e.includes("Daily OTP limit exceeded, please contact support.")) {
		if (window.fcWidget) {
			window.fcWidget.open({ name: "Inbox" });
		}
	}
	if (
		e &&
		e.includes("One or more records sent in Connect are not present in db")
	) {
		return {
			type: "info",
			message: "Please select a child to register",
			autoClose: 4000,
		};
	}
	if (e && e.includes("Child is already registered for event")) {
		return {
			type: "info",
			message: e,
			autoClose: 4000,
		};
	}
	return {
		type: "error",
		message: e,
		autoClose: 4000,
	};
};
const batchSlots = `
batch {
  id
  b2b2ctimeTable {
    ${new Array(24)
			.fill("")
			.map((_, i) => `slot${i}`)
			.join("\n")}
  }
}
`;

const loginViaPassword = (
	input,
	shouldLogin,
	key,
	callbackIfMultipleChildren = () => {},
	teacherApp
) => {
	let formData = new FormData();
	formData.append("app", "manage");
	return duck.query({
		query: `https://app-stage.uolo.co/rest/loginuser/3.1`,
		options: {
			tokenType: "appTokenOnly",
			input: {},
			rest: true,
			method: "post",
			headers: {
				Authorization: `Basic ${Buffer.from(
					`${input.username || input.email}:${input.password}`
				).toString("base64")}`,
			},
			data: formData,
			apiType: "loginViaPassword",
		},
		changeExtractedData: (_, originalData) => {
			if (
				originalData &&
				originalData.loginViaPassword &&
				originalData.loginViaPassword
			) {
				const logindetails = get(originalData, 'loginViaPassword.logindetails');
				const user = get(originalData, 'loginViaPassword.users[0]')
				const userRole = getRole(get(user, "roleid"))
				localStorage.setItem("appVersion", import.meta.env.REACT_APP_VERSION);
				if (teacherApp) {
					if (
						userRole === config.TEACHER
						// &&
						// get(originalData, "loginViaPassword.secondaryRole") ===
						// 	config.SCHOOL_TEACHER
					) {
						if (
							!get(user, 'divinfo.name')
						) {
							return getToasterBasedOnType(
								failureToasterProps("Not Authorized")
							);
						}
						const academicYears = get(
							originalData,
							"loginViaPassword.academicYears",
							[]
						);
						let academicYear;
						const currentYear = new Date();
						// if (academicYears && academicYears.length > 1) {
						// 	academicYears.length &&
						// 		academicYears.forEach((data) => {
						// 			if (
						// 				new Date(get(data, "startDate")) <= currentYear &&
						// 				new Date(get(data, "endDate")) >= currentYear
						// 			) {
						// 				localStorage.setItem("academicYear", get(data, "id"));
						// 				academicYear = get(data, "id");
						// 			}
						// 		});
						// 	if (!academicYear && academicYears && academicYears.length) {
						// 		academicYears.length &&
						// 			academicYears.forEach((data) => {
						// 				if (
						// 					new Date(get(data, "startDate")).getFullYear() ===
						// 					currentYear.getFullYear()
						// 				) {
						// 					localStorage.setItem("academicYear", get(data, "id"));
						// 				}
						// 			});
						// 	}
						// }
						return {
							user: {
								...user,
								schoolTeacher: user,
								rawData: user,
								logindetails
							},
						};
					}
					if (userRole === config.MENTOR) {
						const isSchoolTrainer = get(
							originalData,
							"loginViaPassword.roles",
							[]
						).includes(config.SCHOOL_TRAINER);
						if (isSchoolTrainer) {
							return {
								user: {
									...user,
									schoolTeacher: user,
									rawData: user,
									logindetails
								},
							};
						}
					}
					return getToasterBasedOnType(
						failureToasterProps(
							"Oops! You need to use the Student app to login."
						)
					);
				}
				if (
					userRole === "selfLearner" ||
					(userRole === "mentor" &&
						!get(originalData, "loginViaPassword.children[0]"))
				) {
					if (!shouldLogin && userRole !== "mentor") {
						store.dispatch({
							type: "user/fetch/failure",
							error: {
								status: "UnexpectedError",
								errors: [
									{
										message:
											"Thank you for logging in, we'll get back to you shortly.",
									},
								],
								data: {
									loginViaPassword: null,
								},
							},
							autoReducer: true,
							key: "loggedinUser",
							uniqId: null,
						});
						return {};
					} else {
						return {
							user: {
								...user,
							},
						};
					}
				}
				const { ...parent } = originalData.loginViaPassword;
				if (get(originalData, "loginViaPassword.role") === "mentor") {
					return {
						user: {
							...get(originalData, "loginViaPassword.children[0]"),
							isMentorLoggedIn: true,
							parent: {
								...parent,
								parentProfile: {
									children: [
										get(
											originalData,
											"loginViaPassword.mentorProfile.studentProfile.user"
										),
									],
								},
							},
							email: originalData.loginViaPassword.email,
							createdAt: originalData.loginViaPassword.createdAt,
							rawData: originalData.loginViaPassword,
						},
					};
				}
				if (isSchoolWebsite() || isSubDomainActive) {
					if (
						get(originalData, "loginViaPassword.role") === config.SCHOOL_ADMIN
					) {
						return {
							user: {
								...originalData.loginViaPassword,
								schoolAdmin: originalData.loginViaPassword,
							},
						};
					}
				}
				// before user loggingIn reset the redux store to default values
				// store.dispatch({
				//   type: 'LOGOUT'
				// })
				return getUserForState(
					originalData.loginViaPassword,
					callbackIfMultipleChildren
				);
			}
		},
		type: "user/fetch",
		key: key || "loggedinUser",
	});
};
	


export default loginViaPassword
