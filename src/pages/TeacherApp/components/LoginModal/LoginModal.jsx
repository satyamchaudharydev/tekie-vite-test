import React, { useEffect, useRef, useState } from "react";
import styles from "./LoginModal.module.scss";
// import Input from './components/Input'
import { useHistory, useLocation } from "react-router";
import qs from "query-string";
import Input from "../../../../photon/Input";
import { Button, PasswordInput } from "../../../../photon";
import { connect, Form, Formik } from "formik";
import login from "../../../../queries/login";
import gql from "graphql-tag";
import requestToGraphql from "../../../../utils/requestToGraphql";
import loginViaPassword from "../../../../queries/loginViaPassword";
import { getToasterBasedOnType, Toaster } from "../../../../components/Toaster";
import LoadingSpinner from "./../Loader/LoadingSpinner";
import CloseIcon from "./../../../../assets/SchoolDashboard/icons/CloseIcon";
import { get } from "lodash";
import TeacherLogin from "../../../Signup/components/TeacherLogin/TeacherLogin";
import extractSubdomain from "../../../../utils/extractSubdomain";
import { CLASSROOMS } from "../../../../constants/routes/routesPaths";
import { environments } from "../../../../constants";
import Stack from "../../../../library/Stack";
import Paragraph from "../../../../library/Paragraph";
import validateUserOTP from "../../../../queries/validateUserOTP";
import { TekieLogo } from "../../../Signup/components/TekieLogo";

// const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const LoginModal = (props) => {
  const location = useLocation();
  const history = useHistory();
  // const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')
  // const [username, setUsername] = useState('')
  // const [loginUsing, setLoginUsing] = useState('email')
  // const [currentScreen, setCurrentScreen] = useState('login')
  const [loading, setLoading] = useState(false);
  // const screens = {
  //     email: [
  //         'login',
  //         'forgotPassword'
  //     ]
  // }
  // const loginViaEmailOrUsername = async (emailOrUsername, password) => {
  //     setLoading(true)
  //     try {
  //         if (email) {
  //             await loginViaPassword({ email: emailOrUsername.trim(), password }, false, '', null, 'teacherApp').call()
  //         } else {
  //             await loginViaPassword({ username: emailOrUsername.trim(), password }, false, '', null, 'teacherApp').call()
  //         }
  //     } catch (err) {
  //         setLoading(false)
  //         console.log(err)
  //     }
  //     setLoading(false)
  // }
  // const nextScreen = () => {
  //     const screenList = screens[loginUsing]
  //     const nextScreen = screenList[screenList.indexOf(currentScreen) + 1]

  //     setCurrentScreen(nextScreen)
  // }

  // const renderLoginScreen = () => {
  //     return <div className={styles.loginModal}>
  //         <h3 className={styles.titleContainer}>Teacher's Login</h3>
  //         <Formik
  //             initialValues={{ emailOrUsername: '', password: '' }}
  //             validate={values => {
  //                 const errors = {}
  //                 if (values.password.trim().length === 0 && values.emailOrUsername.trim().length === 0) {
  //                     errors.emailOrUsername = 'Email/Username required'
  //                     errors.password = 'Password required'
  //                 }
  //                 return errors;
  //             }}
  //             onSubmit={async (values, formik) => {
  //                 loginViaEmailOrUsername(values.emailOrUsername.trim(), values.password.trim())
  //             }}>
  //             {({ handleSubmit, setValues, values, errors, touched }) => (
  //                 <Form className='signup-or-login-formik-container' style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
  //                     <div style={{ marginBottom: '8px', letterSpacing: '0.06em' }}>
  //                         <Input label='Email/Username' error={touched.emailOrUsername ? errors.emailOrUsername : ''} onChangeText={(emailOrUsername) => {
  //                             if (emailRegExp.test(emailOrUsername.trim())) {
  //                                 setEmail(emailOrUsername.trim())
  //                                 setUsername('')
  //                             } else {
  //                                 setUsername(emailOrUsername.trim())
  //                                 setEmail('')
  //                             }
  //                             setValues({
  //                                 ...values,
  //                                 emailOrUsername: emailOrUsername
  //                             })
  //                         }} />
  //                     </div>
  //                     <div style={{ marginBottom: '19px', letterSpacing: '0.06em' }}>
  //                         <PasswordInput
  //                             label=' Enter Password'
  //                             value={password}
  //                             error={touched.password ? errors.password : ''}
  //                             onChangeText={(password) => {
  //                                 setValues({
  //                                     ...values,
  //                                     password
  //                                 })
  //                                 setPassword(password)
  //                             }}
  //                         />
  //                     </div>
  //                     <p className={styles.forgotPassword} onClick={nextScreen}>Forgot Password ?</p>
  //                     <button type='submit' hidden />
  //                     <Button title='Login' className={styles.loginBtn} isLoading={loading} onClick={() => {
  //                         handleSubmit()
  //                     }}>
  //                         <LoadingSpinner height='22px' width='22px' color="#fff" />
  //                     </Button>
  //                 </Form>
  //             )}
  //         </Formik>
  //     </div>
  // }

  // const renderForgotPasswordScreen = () => {

  //     return (
  //         <div className={styles.loginModal}>
  //             <h3 className={styles.titleContainer}>Reset your password</h3>
  //             <Formik
  //                 initialValues={{ email: '' }}
  //                 validate={values => {
  //                     const errors = {}
  //                     if (values.email.trim().length === 0) {
  //                         errors.email = 'Email required'
  //                     }
  //                     else if (!emailRegExp.test(values.email)) {
  //                         errors.email = 'Invalid email'
  //                     }
  //                     return errors;
  //                 }}
  //                 onSubmit={async (values, formik) => {
  //                     const res = await requestToGraphql(gql`
  //                     mutation {
  //                     sendForgotPasswordLink(email: "${values.email}") {
  //                         result
  //                     }
  //                     }`)
  //                 }}>
  //                 {({ handleSubmit, setValues, values, errors, touched, isSubmitting }) => (
  //                     <Form className='signup-or-login-formik-container' style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
  //                         <div style={{ marginBottom: '8px', letterSpacing: '0.04em' }}>
  //                             <Input label='Enter Email to receive reset password link' error={touched.email ? errors.email : ''} onChangeText={(email) => {
  //                                 setValues({
  //                                     ...values,
  //                                     email
  //                                 })
  //                                 setEmail(email.trim())
  //                             }} />
  //                         </div>
  //                         <Button title='Reset' disabled={isSubmitting} isLoading={loading} className={styles.loginBtn} onClick={() => {
  //                             handleSubmit()
  //                         }}>
  //                             <LoadingSpinner height='22px' width='22px' />
  //                         </Button>
  //                     </Form>
  //                 )}
  //             </Formik>
  //         </div>
  //     )
  // }

  // useEffect(() => {
  //     if (props.error) {
  //         const errors = props.error.toJS()
  //         const errorItem=errors[errors.length-1]
  //         if(get(errorItem,'error.errors[0].message','').includes('email')||get(errorItem,'error.errors[0].message','').includes('record not found')){
  //             getToasterBasedOnType({
  //                 type: 'error',
  //                 message: `Incorrect ${email ? 'Email' : 'Username'}`,
  //                 autoClose: 2000
  //               })
  //         }else{  getToasterBasedOnType({
  //             type: 'error',
  //             message: 'Incorrect Password',
  //             autoClose: 2000
  //           })

  //         }
  //     }
  // }, [props.error])

  useEffect(() => {
    // extract auth token from url
    const linkToken = get(qs.parse(location.search), "authToken");

    if (!linkToken) return;
    if (get(props, 'userId')) return;

    const validateOTP = async () => {
      setLoading(true);
      try {
        await validateUserOTP(
          {
            linkToken,
            validateMagicLink: true,
          },
          true,
          "",
          () => {},
          () => {},
          true
        ).call();

      } catch (error) {
        console.log("Something went wrong", error);
      } finally {
        setLoading(false);
      }
    };

    validateOTP();
  }, []);

  // console.log("userFetchStatus", props.userFetchStatus);

  return (
    <div className={styles.loginModalContainer}>
      <Stack alignItems="center" style={{width: "100%"}}>
        {get(props, "userFetchStatus") || loading ? (
          <Stack alignItems="center" spacing={6}>
            <LoadingSpinner />
            <Paragraph>
              Logging you in...
            </Paragraph>
          </Stack>
        ) : (
          <>
            <TekieLogo
              src
              className={styles.tekieLogo}

            />
            <TeacherLogin />
          </>
        )}
      </Stack>
      {/* {currentScreen === 'login' && renderLoginScreen()}
        {currentScreen === 'forgotPassword' && renderForgotPasswordScreen()} */}
    </div>
  );
};

export default LoginModal;
