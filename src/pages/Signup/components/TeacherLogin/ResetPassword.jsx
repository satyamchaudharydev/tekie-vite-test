import React from 'react'
import { Form, Formik } from 'formik';
import { useHistory, useLocation } from 'react-router';
import gql from 'graphql-tag';
import { get } from 'lodash';
import qs from "query-string";

import Paragraph from '../../../../library/Paragraph';
import Stack from '../../../../library/Stack';
import Input from "../../../../library/Input";
import Button from "../../../../library/Button";
import classes from "./teacherLogin.module.scss";
import { LeftArrow } from '../../../../constants/icons';
import { hs } from '../../../../utils/size';
import requestToGraphql from '../../../../utils/requestToGraphql';
import { getToasterBasedOnType } from '../../../../components/Toaster';
import { PASSWORD_CHANGED } from './const';
import { fireGtmEvent } from '../../../../utils/analytics/gtmActions';
import { gtmEvents } from '../../../../utils/analytics/gtmEvents';

const initialResetPasswordValues = {
    password: "",
    reEnterPassword: "",
};

function ResetPassword({ onBackToLoginClick, root,fromCentralizedLogin }) {
    const history = useHistory();
    const location = useLocation();

    const redirectToPasswordChange = () => {
      history.push(`${root}step=${PASSWORD_CHANGED}`)
    }

    const handleResetPassword = async (values) => {
        const { password, reEnterPassword } = values;
        const authToken = get(qs.parse(location.search), 'auth-token')
        try {
          const res = await requestToGraphql(gql`
            mutation {
              resetPasswordAndLogin(
                input: {
                  linkToken: "${authToken}"
                  password: "${password}"
                  confirmPassword: "${reEnterPassword}"
                }
              ) {
                id
              }
            }`)
          if (get(res, 'data.resetPasswordAndLogin.id')) {
            const teacherPassChangeSuccessEvent = fromCentralizedLogin ? gtmEvents.websiteResetSuccess :gtmEvents.teacherResetSuccess
            fireGtmEvent(teacherPassChangeSuccessEvent)
            redirectToPasswordChange()
          }
        } catch (err) {
          const teacherPassChangeFailedEvent = fromCentralizedLogin ? gtmEvents.websiteResetFailed  : gtmEvents.teacherResetFailed 
          fireGtmEvent(teacherPassChangeFailedEvent)
          console.log(err);
          getToasterBasedOnType({
            type: "error",
            message: "Reset Password link expired",
          });
        }
    }
    
    return (
        <div className={classes.secondContent}>
        <div className={classes.resetFormContainer}>
        <div>
            <Stack spacing={6}>
            <p className={classes.gilroy}>Create Password</p>
            <Paragraph variant="body1">
                Create a new Password for your ID
            </Paragraph>
            </Stack>
            <Formik initialValues={initialResetPasswordValues} onSubmit={handleResetPassword}>
            {({ values, handleSubmit, handleChange, isSubmitting }) => (
                <Form className={classes.form} onSubmit={handleSubmit}>
                <Stack spacing={12} className={classes.inputs}>
                    <Input
                        block
                        label="Enter New Password"
                        placeholder="Password"
                        name="password"
                        type="password"
                        color="secondary"
                        className={classes.input}
                        labelClassName={classes.label}
                        onChange={handleChange}
                        value={values.password}
                    />
                    <Input
                        block
                        label="Re-enter New Password"
                        placeholder="Re-enter password"
                        name="reEnterPassword"
                        type="password"
                        color="secondary"
                        className={classes.input}
                        labelClassName={classes.label}
                        onChange={handleChange}
                        value={values.reEnterPassword}
                    />
                </Stack>

                <Button
                    type="quaternary"
                    block
                    size="large"
                    htmlType="submit"
                    loading={isSubmitting}
                >
                    Confirm Password
                </Button>
                </Form>
            )}
            </Formik>
        </div>
        <div className={classes.backToLoginButtonContainer} onClick={onBackToLoginClick}>
            <LeftArrow width={hs(18)} height={hs(18)} color='#858585' />
            <button>Back to Login</button>
        </div>
        </div>
        </div>
    )
}

export default ResetPassword