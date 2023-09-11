import React, { useEffect, useState } from "react";
import cx from "classnames";
import { get } from "lodash";
import { useHistory, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Form, Formik } from "formik";
import qs from "query-string";
import teacherBgImage from "../../../../assets/login/teacher-bg.png";
import Input from "../../../../library/Input";
import { getToasterBasedOnType } from "../../../../components/Toaster";
import Stack from "../../../../library/Stack";
import Paragraph from "../../../../library/Paragraph";
import Button from "../../../../library/Button";
import emailRegExp from "../../../../constants/emailRegExp";
import loginViaPassword from "../../../../queries/loginViaPassword";
import { createMagicLink } from "../../../../utils/createMagicLink";
import redirectAccordingToSubdomainAndEnvironment from "../../../../utils/redirectAccToSubdomainAndEnv";
import classes from "./teacherLogin.module.scss";
import ForgotPassword from "./ForgotPassword";
import MailSent from "./MailSent";
import ResetPassword from "./ResetPassword";
import PasswordChanged from "./PasswordChanged";
import {FORGOT_PASSWORD, LINK_SENT, PASSWORD_CHANGED, RESET_PASSWORD} from './const';
import { gtmEvents } from "../../../../utils/analytics/gtmEvents";
import { fireGtmEvent, userParamsMapper } from "../../../../utils/analytics/gtmActions";
import { TEACHER_APP_PREFIX } from "../../../../constants";
import { isSubDomainActive } from "../../../../utils/extractSubdomain";
import config from "../../../../config";
import { getUserParams } from "../../../../utils/getUserParams";
import getRole from "../../../../constants/roleGroup";

const initialValues = {
  emailOrUsername: "",
  password: "",
};

const TeacherLogin = ({ fromCentralizedLogin = false }) => {
  const history = useHistory();
  const location = useLocation();

  const root = `${history.location.pathname}?activeRole=${TEACHER_APP_PREFIX}&`

  const [mailSentTo, setMailSentTo] = useState(null)

  const currentStep = get(qs.parse(location.search), 'step')

  const handleLogin = async (values) => {
    const { emailOrUsername, password } = values;
    const trimmedEmailOrUsername = emailOrUsername.trim();
    const trimmedPassword = password.trim();
    let loginResponse;
    
    const ebookID = get(qs.parse(location.search), 'ebookId')
    
    try {
      if (emailRegExp.test(trimmedEmailOrUsername)) {
        loginResponse = await loginViaPassword(
          { email: trimmedEmailOrUsername, password: trimmedPassword },
          false,
          "",
          null,
          "teacherApp"
        );
      } else {
        loginResponse = await loginViaPassword(
          { username: trimmedEmailOrUsername, password: trimmedPassword },
          false,
          "",
          null,
          "teacherApp"
        );
      }
    
      const userConnectId = get(loginResponse, "loginViaPassword.users[0].id");
      const userRole = getRole(get(loginResponse, 'loginViaPassword.users[0].roleid'))
      // if there's no user throw error
      if (!userConnectId) {
        const loginFailedEvent = fromCentralizedLogin ? gtmEvents.websiteTeacherLoginFailed : gtmEvents.teacherLoginFailed
        fireGtmEvent(loginFailedEvent)
        throw new Error("Cannot find user");
      }

      const userParams = getUserParams()
      const loginSuccessEvent = fromCentralizedLogin ? gtmEvents.websiteTeacherLoginSuccess : gtmEvents.teacherLoginSuccess
      fireGtmEvent(loginSuccessEvent, {userParams})
      if (!fromCentralizedLogin) {
        return true
      }
      // if (userRole !== config.TEACHER) {
      //   return;
      // }
      // // get magic link token for user
      // const magicLinkToken = await createMagicLink(userConnectId);
      // if (typeof window !== 'undefined' && window.store) {
      //   window.store.dispatch({ type: "LOGOUT" });
      // }
      console.log('called till')
      history.push('/teacher/classrooms')
      
      // redirectAccordingToSubdomainAndEnvironment(magicLinkToken, "teacher",true,ebookID);
      
    } catch (err) {
      console.log({ err })
      const loginFailedEvent = fromCentralizedLogin ? gtmEvents.websiteTeacherLoginFailed : gtmEvents.teacherLoginFailed
      fireGtmEvent(loginFailedEvent)
      getToasterBasedOnType({
        type: "error",
        message: "Either username or password is incorrect",
      });
    }
  };
  useEffect(() => {
    setTimeout(() => {
      const teacherPageViewEvent = gtmEvents.teacherPageView
      fireGtmEvent(teacherPageViewEvent)
    })
  }, [])

  const handleForgotPasswordClick = () => {
    const forgotPasswordClickedEvent = fromCentralizedLogin ? gtmEvents.websiteForgotPasswordClick : gtmEvents.forgotPasswordClicked
    fireGtmEvent(forgotPasswordClickedEvent)
    history.push(`${root}step=${FORGOT_PASSWORD}`)
  }

  const onBackToLoginClick = () => {
    if (isSubDomainActive) {
      history.push('/')
    } else {
      history.push('/login?activeRole=teacher')
    }
  }
  const renderLoginForm = () => (
    <div className={classes.secondContent}>
      <Stack style={{width: '100%'}} className={classes.heading} spacing={6}>
        <p className={classes.gilroy}>
          Teacher Login
          </p>
        <Paragraph variant="body1">
          Fill below details to continue
        </Paragraph>
      </Stack>
      <Formik initialValues={initialValues} onSubmit={handleLogin}>
        {({ values, handleSubmit, handleChange, isSubmitting }) => (
          <Form className={classes.form} onSubmit={handleSubmit}>
            <Stack spacing={12}>
              <Input
                block
                label="Email ID / Username"
                placeholder="email@example.com"
                name="emailOrUsername"
                color="secondary"
                type="text"
                className={classes.input}
                labelClassName={classes.label}
                onChange={handleChange}
                value={values.emailOrUsername}
                key={'emailOrUsername'}
              />

              <Input
                block
                label="Password"
                placeholder="Enter your password"
                name="password"
                type="password"
                color="secondary"
                className={classes.input}
                labelClassName={classes.label}
                onChange={handleChange}
                value={values.password}
                key={'password'}
              />
            </Stack>

            <Button
              text
              className={classes.forgotPassword}
              size='large'
              type="quaternary"
              onClick={handleForgotPasswordClick}
            >
              Forgot Password?
            </Button>

            <Button
              type="quaternary"
              block
              size="large"
              htmlType="submit"
              loading={isSubmitting}
            >
              Continue
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case FORGOT_PASSWORD:
        return <ForgotPassword setMailSentTo={setMailSentTo} onBackToLoginClick={onBackToLoginClick} fromCentralizedLogin={fromCentralizedLogin} root={root} />
      case LINK_SENT:
        return <MailSent mailSentTo={mailSentTo} onBackToLoginClick={onBackToLoginClick} />
      case RESET_PASSWORD:
        return <ResetPassword onBackToLoginClick={onBackToLoginClick} root={root} fromCentralizedLogin={fromCentralizedLogin}/>
      case PASSWORD_CHANGED:
        return <PasswordChanged onBackToLoginClick={onBackToLoginClick} />
      default:
        return renderLoginForm();
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        className={'mixpanel-login-identifier'}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Stack direction="row" className={classes.container} style={{ gap: 0 }}>
          <div className={classes.firstContent}>
            <div className={classes.imageContainer}>
              <img
                src={teacherBgImage}
                alt="Teacher Login"
                className={classes.teacherBgImage}
              />
            </div>

            <p className={cx(classes.welcomeText, classes.gilroy)}>
              Welcome to Tekie!
            </p>
          </div>

          {renderCurrentStep()}
          
        </Stack>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeacherLogin;
