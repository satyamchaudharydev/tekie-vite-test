import React, { useMemo } from "react";
import { useLocation } from "react-router";
import qs from "query-string";
import { connect } from "react-redux";
import { filterKey } from "duck-state/lib/State";
import { useHistory } from "react-router";
import { get } from "lodash";

import classes from "../schoolLiveClassLogin/styles.module.scss";
import Button from "../../../library/Button";
import Stack from "../../../library/Stack";
import Footer from "../schoolLiveClassLogin/components/Footer/Footer";
import StudentLogin from "../components/StudentLogin";
import TeacherLogin from "../components/TeacherLogin/TeacherLogin";
import { BookIcon, GlassIcon } from "../../../constants/icons";
import { STUDENT_APP_PREFIX, TEACHER_APP_PREFIX } from "../../../constants";
import "../schoolLiveClassLogin/schoolLiveClassLogin.scss";
import { gtmEvents } from "../../../utils/analytics/gtmEvents";
import { fireGtmEvent } from "../../../utils/analytics/gtmActions";
import { TekieLogo } from "../components/TekieLogo";
import LoginAlert from "../components/LoginAlert";
import extractSubdomain from "../../../utils/extractSubdomain";
import { STUDENT_BASE_URL, TEACHER_BASE_URL } from "../../../constants/routes/routesPaths";
import getMe from "../../../utils/getMe";

// where STUDENT_APP_PREFIX and TEACHER_APP_PREFIX are defined as
// STUDENT_APP_PREFIX = "student"
// TEACHER_APP_PREFIX = "teacher"

const CentralizedLogin = (props) => {

  const history = useHistory();
  const location = useLocation();

  const activeRole = extractSubdomain()

  const redirectToStudentRole = () => {
    history.push("/student/sessions")
  };

  const redirectToTeacherRole = () => {
    fireGtmEvent(gtmEvents.websiteLoginTeacherVisit)
    history.push(TEACHER_BASE_URL)
  };

  React.useLayoutEffect(() => {
    const websitePageView = gtmEvents.websiteLoginPageView
    fireGtmEvent(websitePageView)

    if (typeof window === "undefined") return;
    const userId = getMe().id
    console.log({userId})
    if(userId){
      history.push('/student/sessions')
    }
    else{
      history.push('/student')
    }
    // if (get(location, 'pathname') === '/') 
      // redirectToStudentRole();
  }, []);

  return (
    <>
      <div
        className={"school-live-class-login-container"}
      >
        {/* Tekie Logo */}
        <TekieLogo
          className={classes.tekieLogo}
        />

        <Stack
          direction="row"
          className={classes.buttonGroup}
          style={{ gap: 0 }}
        >
          <Button
            type={activeRole === STUDENT_APP_PREFIX ? "primary" : "tertiary"}
            icon={<BookIcon fill={activeRole !== STUDENT_APP_PREFIX && "#504F4F"} />}
            size="large"
            style={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            onClick={redirectToStudentRole}
          >
            Student Login
          </Button>

          <Button
            type={activeRole === TEACHER_APP_PREFIX ? "quaternary" : "tertiary"}
            size="large"
            icon={<GlassIcon fill={activeRole === TEACHER_APP_PREFIX && "#fff"} />}
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            onClick={redirectToTeacherRole}
          >
            Teacher Login
          </Button>
        </Stack>
          
        {activeRole === STUDENT_APP_PREFIX ? <StudentLogin fromCentralizedLogin={true} {...props} /> : <TeacherLogin fromCentralizedLogin={true} />}
        <Footer />
      </div>
      <LoginAlert />
    </>
  );
};

const mapStateToProps = (state) => ({
  user: filterKey(state.data.getIn(["user", "data"]), "loggedinUser").get(0),
  error: state.data.getIn(["errors", "user/fetch"]),
});

export default connect(mapStateToProps)(CentralizedLogin);
