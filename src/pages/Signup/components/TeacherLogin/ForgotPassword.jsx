import { Form, Formik } from 'formik';
import React from 'react'
import gql from 'graphql-tag';
import { get } from 'lodash';
import { useHistory } from 'react-router';

import { getToasterBasedOnType } from '../../../../components/Toaster';
import Paragraph from '../../../../library/Paragraph';
import Stack from '../../../../library/Stack';
import Input from "../../../../library/Input";
import Button from "../../../../library/Button";
import classes from "./teacherLogin.module.scss";
import emailRegExp from "../../../../constants/emailRegExp";
import { LeftArrow } from '../../../../constants/icons';
import { hs } from '../../../../utils/size';
import requestToGraphql from '../../../../utils/requestToGraphql';
import { LINK_SENT } from './const';
import { fireGtmEvent } from '../../../../utils/analytics/gtmActions';
import { gtmEvents } from '../../../../utils/analytics/gtmEvents';

const initialForgotPasswordValues = {
    emailOrUsername: "",
};

function ForgotPassword({ setMailSentTo, onBackToLoginClick, root,fromCentralizedLogin }) {
    const history = useHistory();

    const redirectToLinkSent = () => {
      history.push(`${root}step=${LINK_SENT}`)
    }

    const handleForgotPassword = async (values) => {
        const event = fromCentralizedLogin ? gtmEvents.websiteResetLinkSent : gtmEvents.teacherResetLinkSent
        fireGtmEvent(event)
        const { emailOrUsername } = values;
        const trimmedEmailOrUsername = emailOrUsername.trim();
        try {
          if (emailRegExp.test(trimmedEmailOrUsername)) {
            const res = await requestToGraphql(gql`
              mutation {
                sendForgotPasswordLink(email: "${trimmedEmailOrUsername}", platform: teacher) {
                  result
                }
              }`)
            if (get(res, 'data.sendForgotPasswordLink.result')) {
              setMailSentTo(trimmedEmailOrUsername)
              redirectToLinkSent()
            }
          } else {
            getToasterBasedOnType({
              type: "error",
              message: "Email format is incorrect",
            });
          }
        } catch (err) {
          console.log(err);
          getToasterBasedOnType({
            type: "error",
            message: "Email is incorrect",
          });
        }
    }

    return (
        <div className={classes.secondContent}>
          <div className={classes.resetFormContainer}>
            <div>
              <Stack spacing={6}>
                <p className={classes.gilroy}>Reset Password</p>
                <Paragraph variant="body1">
                  Enter Email ID to receive reset link
                </Paragraph>
              </Stack>
              <Formik initialValues={initialForgotPasswordValues} onSubmit={handleForgotPassword}>
                {({ values, handleSubmit, handleChange, isSubmitting }) => (
                  <Form className={classes.form} onSubmit={handleSubmit}>
                    <Stack spacing={12} className={classes.inputs}>
                      <Input
                        block
                        label="Email ID"
                        placeholder="email@example.com"
                        name="emailOrUsername"
                        color="secondary"
                        className={classes.input}
                        labelClassName={classes.label}
                        onChange={handleChange}
                        value={values.emailOrUsername}
                      />
                    </Stack>
  
                    <Button
                      type="quaternary"
                      block
                      size="large"
                      htmlType="submit"
                      loading={isSubmitting}
                    >
                      Send Link
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

export default ForgotPassword