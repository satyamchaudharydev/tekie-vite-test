const BROWSE = 'Browse'
const SIGN_IN = 'Sign in'
const EMAIL_REG_EXPRESSION = /\S+@\S+\.\S+/
const PASSWORD_MIN_LENGTH = 6
const FORGOT_PASSWORD = 'Forgot Password?'
const CREATE_ACCOUNT = 'Create Account'
const NOT_ON_TEKIE = 'Not on Tekie yet?'
const SIGN_UP = 'SIGN UP'
const EMAIL_ID_PLACEHOLDER = 'Email id'
const PASSWORD_PLACEHOLDER = 'Password'
const RESEND_INSTRUCTION =
  'Please enter your registered email ID so we can send a password reset link'
const RESEND_LINK = 'Re send Link'
const SEND_LINK = 'Send Reset Link'
const SENT_EMAIL_MESSAGE =
  'Email sent. Please check your email for further instructions'
const CREATE_PROFILE = 'Create a profile to save your personal curriculum'
const FB_LOGIN_TEXT = 'Continue with Facebook'
const GOOGLE_LOGIN_TEXT = 'Continue with Google'
const OR = 'or'
const CREATE_ACCOUNT_MAIL = 'Create an account with email'
const HAVE_AN_ACCOUNT_ALREADY = 'Have an account already?'
const TERMS_AND_CONDITIONS = 'By signing up you agree to Tekie\'s terms of use'
const SETTINGS = 'Settings'
const CURR_PASSWORD = 'Current Password'
const NEW_PASSWORD = 'New Password'
const VERIFY_PASSWORD = 'Verify Password'
const routes = {
  start: 'start',
  signUp: 'signUp',
  signIn: 'signIn',
  createAccount: 'createAccount',
  forgotPassword: 'forgotPassword',
  changePasword: 'changePassword',
  app: 'app',
  video: 'video',
  homepage: 'homepage'
}
const loginValidationRules = {
  email: {
    required: 'Email field is required',
    invalid: 'Entered email is not valid'
  },
  password: {
    required: 'Password field is required',
    minLengthError: `Password should be more than ${PASSWORD_MIN_LENGTH} letters`,
    misMatchError: 'Passwords do not match'
  }
}
const ACCOUNT = 'Account'
const CHANGE_PASSWORD = 'Change password'
const LOG_OUT = 'Log out'
const SHARE = 'Share'
const SUPPORT = 'Support'
const FAQ = 'FAQs'
const FEATURE_SUGGEST = 'Suggest a feature'
const CONTACT_US = 'Contact us'
const TANDC = 'Terms and Conditions'
const VERSION_TEXT = 'Version 1.0'
const COPYRIGHT_TEXT = 'Copyright 2019 Tekie'
const PRIVACY_POLICY = 'Privacy Policy'

export {
  BROWSE,
  SIGN_IN,
  EMAIL_REG_EXPRESSION,
  PASSWORD_MIN_LENGTH,
  CREATE_ACCOUNT,
  FORGOT_PASSWORD,
  NOT_ON_TEKIE,
  SIGN_UP,
  routes,
  EMAIL_ID_PLACEHOLDER,
  PASSWORD_PLACEHOLDER,
  RESEND_INSTRUCTION,
  SEND_LINK,
  RESEND_LINK,
  SENT_EMAIL_MESSAGE,
  CREATE_PROFILE,
  FB_LOGIN_TEXT,
  GOOGLE_LOGIN_TEXT,
  OR,
  CREATE_ACCOUNT_MAIL,
  HAVE_AN_ACCOUNT_ALREADY,
  TERMS_AND_CONDITIONS,
  SETTINGS,
  loginValidationRules,
  ACCOUNT,
  CHANGE_PASSWORD,
  LOG_OUT,
  SHARE,
  SUPPORT,
  FAQ,
  FEATURE_SUGGEST,
  CONTACT_US,
  TANDC,
  PRIVACY_POLICY,
  VERSION_TEXT,
  COPYRIGHT_TEXT,
  CURR_PASSWORD,
  NEW_PASSWORD,
  VERIFY_PASSWORD
}
