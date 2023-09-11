import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { filterKey } from "duck-state/lib/State";
import qs from "query-string";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { get } from "lodash";
import moment from "moment";
import cx from "classnames";

import formImage from "../../../assets/Final BG 1.svg";
import Footer from "./components/Footer/Footer";
import LoginForm from "./components/LoginForm/LoginForm";
import { Toaster } from "../../../components/Toaster";
import { MOBILE_BREAKPOINT } from "../../../config";
import { monthNames } from "./constants/constants";
import { ImageBackground } from "../../../image";
import getPath from "../../../utils/getPath";
import Clock from "./assets/clock.js";
import { ReactComponent as Calendar } from "./assets/calendar.svg";
import Back from "./assets/Back.js";
import BuddyTeam from "./components/BuddyTeam/BuddyTeam";
import getSystemId from "../../../utils/getOrGenerateSystemId";
import extractSubdomain, {
  isSubDomainActive,
} from "../../../utils/extractSubdomain";
import { teacherAppSubDomains, studentAppSubDomains } from "../../../constants";
import StudentLogin from "../components/StudentLogin";
import validateUserOTP from "../../../queries/validateUserOTP";
import "./schoolLiveClassLogin.scss";
import LoadingSpinner from "../../TeacherApp/components/Loader/LoadingSpinner";
import { moveToSession } from "./utils";
import Stack from "../../../library/Stack";
import Paragraph from "../../../library/Paragraph";
import { TekieLogo } from "../components/TekieLogo";
import Alert from "../../../library/Alert/Alert";


const SchholLiveClassLogin = (props) => {
  const [step, setStep] = useState(0);
  const history = useHistory();
  const location = useLocation();
  const {state} = location
  const [loginWithEmail, setLoginWithEmail] = useState(false);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1920
  );
  // const [schoolDetails, setSchoolDetails] = useState({})
  const [batchDetails, setBatchDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [buddyTeamList, setBuddyTeamList] = useState([]);
  const [isStudentSelected, setIsStudentSelected] = useState(false);
  const [isBuddyLoginEnabled, setIsBuddLoginEnabled] = useState(false);
  const [buddyLoginLimit, setBuddyLoginLimit] = useState(5);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [schoolLogo, setSchoolLogo] = useState("");
  const [isRollNoAutoGenerated, setIsRollNoAutoGenerated] = useState(false);
  const [showAlert,setShowAlert] = useState(false);

  let mobileView = width < MOBILE_BREAKPOINT;

  useEffect(() => {
    // extract auth token from url
    const linkToken = get(qs.parse(location.search), "authToken");
    const fromOtpScreenQuery = get(qs.parse(location.search), 'fromOtpScreen')

    // extract courseId, topicId and sessionId from url
    const courseId = get(qs.parse(location.search), "courseId");
    const topicId = get(qs.parse(location.search), "topicId");
    const sessionId = get(qs.parse(location.search), "sessionId");
    const bookId = get(qs.parse(location.search), "ebookId", null);
    const validateOTP = async () => {
      setLoading(true);
      try {
        const res = await validateUserOTP(
          {
            linkToken,
            validateMagicLink: true,
            loginViaOtp: Boolean(fromOtpScreenQuery),
          },
          true,
          "",
          () => {},
          () => {},
          false
        ).call();

        if(bookId && bookId !== 'undefined'){
          return history.replace(`/s/${bookId}`);
        }
        else {
           // move to session using the topicId, sessionId and courseId
          await moveToSession(
            get(res, "validateUserOTP"),
            true,
            history,
            "",
            setLoading,
            true,
            { isBuddyLoginEnabled: false, sessionId, courseId, topicId, bookId }
        );
        }
    
      } catch (error) {
        console.log("Something went wrong", error);
      } finally {
        setLoading(false);
      }
    };

    if (linkToken) {
      validateOTP();
    }
    
  }, []);

  useEffect(() => {
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
  }, []);

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    window.onresize = () => {
      setWidth(window.innerWidth);
    };
  }, []);
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
  const renderClassDetails = () => {
    return (
      <>
        <p className={"school-live-class-login-classroomAndTopicTitle"}>
          {batchDetails.classroomTitle} - {batchDetails.topicTitle}
        </p>
        <div className={"school-live-class-login-classTimingDetails"}>
          <div className={"school-live-class-login-classDateWrapper"}>
            <Calendar />
            <p>{getDate(batchDetails.sessionStartDate)}</p>
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

  const goBackHandler = () => {
    if (loading) return;
    setStep((prevStep) => prevStep - 1);
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
    <>
      <div
        className={"school-live-class-login-container"}
      >
        {schoolLogo ? (
          <div className={"school-live-class-login-pageHeaderContainer"}>
            <ImageBackground
              className={"school-live-class-login-schoolLogoWrapper"}
              src={getPath(schoolLogo)}
              srcLegacy={getPath(schoolLogo)}
            />
          </div>
        ) : (
          <TekieLogo className="tekie_logo" />
        )}

        {loading ? (
          <Stack alignItems='center' spacing={6}>
            <LoadingSpinner />
            <Paragraph>Please wait, while we're taking you to your class...</Paragraph>
          </Stack>
        ) : (
          <StudentLogin {...props}/>
        )}
        <Footer />
      </div>
      <Alert 
        open={showAlert}
        onClose={() => setShowAlert(false)}
        horizontalAlign="right"
        verticalAlign="top"
        timeout={2000}
          
      >
      Please Login to Access Ebooks

      </Alert>
    </>
  );
};

const mapStateToProps = (state) => ({
  user: filterKey(state.data.getIn(["user", "data"]), "loggedinUser").get(0),
  error: state.data.getIn(["errors", "user/fetch"]),
});

export default connect(mapStateToProps)(SchholLiveClassLogin);