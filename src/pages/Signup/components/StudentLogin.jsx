import React, { useState } from "react";
import { get } from "lodash";
import { useHistory } from "react-router";
import moment from "moment";
import { Helmet } from "react-helmet";
import { AnimatePresence, motion } from "framer-motion";
import cx from "classnames";

import extractSubdomain, {
  isSubDomainActive,
} from "../../../utils/extractSubdomain";
import { studentAppSubDomains, teacherAppSubDomains } from "../../../constants";
import { MOBILE_BREAKPOINT } from "../../../config";
import getSystemId from "../../../utils/getOrGenerateSystemId";
import getPath from "../../../utils/getPath";
import { ImageBackground } from "../../../image";
import Clock from "../schoolLiveClassLogin/assets/clock.jsx";
import Back from "../schoolLiveClassLogin/assets/Back.jsx";
import { ReactComponent as Calendar } from "../schoolLiveClassLogin/assets/calendar.svg";
import { monthNames } from "../schoolLiveClassLogin/constants/constants";
import BuddyTeam from "../schoolLiveClassLogin/components/BuddyTeam/BuddyTeam";
import LoginForm from "../schoolLiveClassLogin/components/LoginForm/LoginForm";
import classes from "../components/TeacherLogin/teacherLogin.module.scss";
import bg from "../../../assets/login/student-bg.png";
import { fireGtmEvent } from "../../../utils/analytics/gtmActions";
import { gtmEvents } from "../../../utils/analytics/gtmEvents";

const StudentLogin = ({ fromCentralizedLogin, ...props }) => {
  const [batchDetails, setBatchDetails] = useState({});
  const [isBuddyLoginEnabled, setIsBuddLoginEnabled] = useState(false);
  const [buddyTeamList, setBuddyTeamList] = useState([]);
  const [step, setStep] = useState(0);
  const [buddyLoginLimit, setBuddyLoginLimit] = useState(5);
  const [schoolLogo, setSchoolLogo] = useState("");
  const [isStudentSelected, setIsStudentSelected] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [isRollNoAutoGenerated, setIsRollNoAutoGenerated] = useState(false);
  const [loginWithEmail, setLoginWithEmail] = useState(false);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1920
  );
  const [loading, setIsLoading] = useState(false);

  const history = useHistory();

  React.useEffect(() => {
    let isBuddyLoginEnabledFlag = false;
    let buddyLoginLimitValue = 5;
    if (get(props, "isBuddyLoginEnabled", false)) {
      isBuddyLoginEnabledFlag = get(props, "isBuddyLoginEnabled", false);
    }
    if (
      !isBuddyLoginEnabledFlag &&
      isSubDomainActive &&
      studentAppSubDomains.includes(extractSubdomain())
    ) {
      isBuddyLoginEnabledFlag = true;
    }
    if (get(props, "buddyLoginLimit", 0)) {
      buddyLoginLimitValue = get(props, "buddyLoginLimit");
    }
    if (
      isSubDomainActive &&
      studentAppSubDomains.includes(extractSubdomain())
    ) {
      buddyLoginLimitValue = 5;
    }
    setIsBuddLoginEnabled(isBuddyLoginEnabledFlag);
    setBuddyLoginLimit(buddyLoginLimitValue);
    getSystemId();
    if (window && window.sessionStorage) sessionStorage.clear();
    if (get(props, "schoolDetails.logo")) {
      setSchoolLogo(get(props, "schoolDetails.logo"));
    }
    if (
      props.user &&
      props.user.get("role") !== "mentor" &&
      !teacherAppSubDomains.includes(extractSubdomain())
    ) {
      history.push("/sessions");
    }
    setTimeout(() => {
      const studentLoginVisitEvent = gtmEvents['studentPageView']
      fireGtmEvent(studentLoginVisitEvent)
    })
  }, []);

  React.useLayoutEffect(() => {
    window.onresize = () => {
      setWidth(window.innerWidth);
    };
  }, []);

  let mobileView = width < MOBILE_BREAKPOINT;

  const getDate = (date) => {
    let extractedDate = moment(date).date();
    let extractedMonth = moment(date).month();
    return `${extractedDate} ${monthNames[extractedMonth]}`;
  };

  const findSessionTime = (data) => {
    return `${moment(get(data, "startTime")).format("LT")} - ${moment(
      get(data, "endTime")
    ).format("LT")}`;
  };

  const goBackHandler = () => {
    if (loading) return;
    setStep((prevStep) => prevStep - 1);
  };

  const renderClassDetails = () => {
    return (
      <>
        <p className={"school-live-class-login-classroomAndTopicTitle"}>
          {get(batchDetails, 'classroomTitle')} - {get(batchDetails, 'topicTitle')}
        </p>
        <div className={"school-live-class-login-classTimingDetails"}>
          <div className={"school-live-class-login-classDateWrapper"}>
            <Calendar />
            <p>{getDate(get(batchDetails, 'sessionStartDate'))}</p>
          </div>
          <div className={"school-live-class-login-classTimeWrapper"}>
            <Clock />
            <p>{findSessionTime(batchDetails)}</p>
          </div>
        </div>
        <div className={"school-live-class-login-separator"}></div>
        {isBuddyLoginEnabled && buddyTeamList.length > 0 && (
          <div>
            {buddyTeamList.length > 1 ? (
              <p className={"school-live-class-login-teamTitle"}>
                Here's your team!
              </p>
            ) : null}
          </div>
        )}
      </>
    );
  };

  const renderBackButton = () => {
    if (!step || !mobileView) return;
    return (
      <div
        className={cx(
          "school-live-class-login-backLogoWrapper",
          loading && "school-live-class-login-disabled"
        )}
        onClick={goBackHandler}
      >
        <Back />
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="mixpanel-login-identifier"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Helmet>
          <link rel="canonical" href="https://student.tekie.in/" />
          <title>Tekie - Student Login Page</title>
          <meta
            name="description"
            content="A NEP 2020 aligned computer science and coding curriculum for your school. World's 1st animated storytelling series on Coding. Getting schools ready for the future."
          ></meta>
          <meta
            name="keywords"
            content="student, login, coding, programming, computer science, NEP, school, tekie"
          />
        </Helmet>
        {renderBackButton()}
        {schoolLogo && (
          <div className={"school-live-class-login-pageHeaderContainer"}>
            <ImageBackground
              className={"school-live-class-login-schoolLogoWrapper"}
              src={getPath(schoolLogo)}
              srcLegacy={getPath(schoolLogo)}
            />
          </div>
        )}
        <div className={"school-live-class-login-loginForm"}>
          <div className={"school-live-class-login-ImageContainer"}>
            <img src={bg} alt="Form" />
            <div
              className={"school-live-class-login-imageOverlayTextContainer"}
            >
              {(batchDetails && Object.keys(batchDetails).length) ? (
                renderClassDetails()
              ) : (
                <>
                  <p className={cx(classes.gilroy)}>Welcome to Tekie!</p>
                  {/* <p className={oneToOneSessionText}>Get Set Code with Tekie</p> */}
                </>
              )}
              {isBuddyLoginEnabled && (
                <div
                  className={"school-live-class-login-buddyTeamListContainer"}
                >
                  <BuddyTeam
                    students={buddyTeamList || []}
                    buddyTeamList={buddyTeamList}
                    setBuddyTeamList={setBuddyTeamList}
                    setStep={setStep}
                    batchDetails={batchDetails}
                    setIsStudentSelected={setIsStudentSelected}
                    selectedStudentDetails={selectedStudentDetails}
                    setSelectedStudentDetails={setSelectedStudentDetails}
                    isRollNoAutoGenerated={isRollNoAutoGenerated}
                  />
                </div>
              )}
            </div>
          </div>
          <LoginForm
            setIsBuddLoginEnabled={setIsBuddLoginEnabled}
            setBuddyLoginLimit={setBuddyLoginLimit}
            isBuddyLoginEnabled={isBuddyLoginEnabled}
            step={step}
            setStep={setStep}
            loginWithEmail={loginWithEmail}
            setLoginWithEmail={setLoginWithEmail}
            width={width}
            schoolCode={get(props, "schoolDetails.code")}
            batchDetails={batchDetails}
            setBatchDetails={setBatchDetails}
            loading={loading}
            setIsLoading={setIsLoading}
            buddyTeamList={buddyTeamList}
            setBuddyTeamList={setBuddyTeamList}
            buddyLimit={buddyLoginLimit}
            isStudentSelected={isStudentSelected}
            setIsStudentSelected={setIsStudentSelected}
            selectedStudentDetails={selectedStudentDetails}
            setSelectedStudentDetails={setSelectedStudentDetails}
            setSchoolLogo={setSchoolLogo}
            isRollNoAutoGenerated={isRollNoAutoGenerated}
            setIsRollNoAutoGenerated={setIsRollNoAutoGenerated}
            fromCentralizedLogin={fromCentralizedLogin}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StudentLogin;
