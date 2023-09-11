import React from "react";
import { useHistory } from "react-router";
import { filterKey } from "duck-state/lib/State";
import { connect } from "react-redux";
import { get } from "lodash";

import { loginWithEmailValidation } from "../../validators/validators";
import { MOBILE_BREAKPOINT } from "../../../../../config";
import CustomInput from "../CustomInput/CustomInput";
import loginWithUsernameOrEmail from "../../../../../queries/loginWithUsernameOrEmail";
import extractSubdomain from "../../../../../utils/extractSubdomain";
import { createMagicLink } from "../../../../../utils/createMagicLink";
import {
  environments,
  HOSTNAME,
  STUDENT_APP_PREFIX,
} from "../../../../../constants";
import { gtmEvents } from "../../../../../utils/analytics/gtmEvents";
import { fireGtmEvent } from "../../../../../utils/analytics/gtmActions";

const LoginWithPassword = ({
  submitCredentials,
  setSubmitCredentials,
  width,
  loading,
  setIsLoading,
  loginWithEmail,
  checkIfFieldsEmpty,
  errors,
  setErrors,
  ...props
}) => {
  let mobileView = width < MOBILE_BREAKPOINT;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const history = useHistory();

  const handleLogin = async () => {
    let validateStatus = loginWithEmailValidation(email, password);
    if (Object.keys(validateStatus).length > 0) {
      fireGtmEvent(gtmEvents.emailLoginFailed)
      return;
    }
    setIsLoading(true);
    const response = await loginWithUsernameOrEmail(
      email,
      password,
      "",
      history,
      setIsLoading
    );
    fireGtmEvent(gtmEvents.emailLoginSuccess)

  };

  React.useEffect(() => {
    if (!submitCredentials) return;
    handleLogin();
    setSubmitCredentials(false);
  }, [submitCredentials]);

  React.useEffect(() => {
    if (submitCredentials) setSubmitCredentials(false);
    checkIfFieldsEmpty(email, password);
    setErrors({});
  }, [email, password]);

  return (
    <>
      <CustomInput
        label={mobileView ? "Gmail/Username" : "Email/Username"}
        setFn={setEmail}
        value={email}
        autoComplete="off"
        noMarginTop
        error={errors.email}
      />
      <CustomInput
        label={"Password"}
        autoComplete="off"
        setFn={setPassword}
        value={password}
        secret
        error={errors.password}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  user: filterKey(state.data.getIn(["user", "data"]), "loggedinUser").get(0),
  error: state.data.getIn(["errors", "user/fetch"]),
});
export default connect(mapStateToProps)(LoginWithPassword);
