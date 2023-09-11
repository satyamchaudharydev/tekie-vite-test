import { get, sortBy } from "lodash";
import React, { useState } from "react";
import { withRouter } from "react-router";
import fetchQuizAnswers from "../../../../../../queries/fetchQuizAnswers";
import fetchQuizQuestions from "../../../../../../queries/fetchQuizQuestions";
import fetchQuizReport from "../../../../../../queries/fetchQuizReport";
import QuestionAreaReview from "../../../../../UpdatedSessions/Quiz/components/QuestionAreaReview";
import { ReportsContainer, TitleContainer } from "../../../../../UpdatedSessions/QuizReport/components/reportContainers";
import getMasteryLabel from "../../../../../../utils/getMasteryLabels";
import { masteryLevels } from '../../../../../UpdatedSessions/QuizReport/QuizReport';
import isMobile from "../../../../../../utils/isMobile";
import { getLastAttemptAnswers } from "../../../../../UpdatedSessions/Quiz/Quiz";
// import { filterItems } from "../../../../../../utils/data-utils";
// import { MenuToggle } from "../../../../../B2BLandingPage/components/Header";

import "./HomeworkCollapsible.scss";

const getPrevAnswer = (options, questionType) => {
  const answer = [];
  console.log('IN PREV ANSWER');
  switch (questionType) {
    case "mcq":
      console.log('IN -> MCQ');
      options.forEach((option) => {
        if (option.isSelected) {
          answer.push(true);
        } else {
          answer.push(false);
        }
      });
      break;
      case 'fibBlock':
      console.log('IN -> FIB BLOCK')
      let modOptions = sortBy(options, "position");
      const positionsIncluded = [];
      modOptions.forEach((option) => {
        console.log('asfasf', !positionsIncluded.includes(get(option, "position")))
        if (!positionsIncluded.includes(get(option, "position"))) {
          answer.push(option.statement);
          positionsIncluded.push(get(option, "position"));
        }
      });
      break;
      case "fibInput":
      console.log('IN -> FIB INPUT')
      modOptions = sortBy(options, "position");
      modOptions.forEach((option) => {
        answer.push(option.answer);
      });
      case "arrange":
      console.log('IN -> ARRANGE')
      options.forEach((option, index) => (option.index = index));
      const sortedOptions = sortBy(options, "position");
      sortedOptions.forEach((option) => {
        answer.push(get(option, "index"));
      });
  }

  return answer;
};
const QuizComponent = ({
  topicId,
  courseId,
  userId,
  userFirstAndLatestQuizReport,
  match,
  quizReportFailureStatus,
  userQuizAnswers,
}) => {
  const [clicked, setClicked] = useState(null);
  const [hasReportFetched, setHasReportFetched] = useState(false);
  const [quizReport, setQuizReport] = useState({});
  const [quizReportId, setQuizReportId] = useState(null);
  const [masteryLevelIndex, setMasteryLevelIndex] = useState(0);
  const [masteryLabel, setMasteryLabel] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
 
  /**
   * Fetching quiz first and latest report.
   */
  React.useEffect(() => {
    (async function() {
      // console.log({
      //   topicId,
      //   courseId,
      //   userId,
      // });
      if (topicId && courseId && userId) {
        await fetchQuizReport(topicId, courseId, [userId]).call();
        setHasReportFetched(true);
      }
    })();
  }, [userId, courseId, topicId]);

  /**
   * Fetching quiz answers based on latest report.
   */
  React.useEffect(() => {
    (async function() {
      if (
        userFirstAndLatestQuizReport &&
        userFirstAndLatestQuizReport.toJS() &&
        hasReportFetched &&
        userId &&
        courseId &&
        topicId &&
        !quizReportFailureStatus
      ) {
        setQuizReport(userFirstAndLatestQuizReport.toJS()[0]);

        /** Calculating User's Mastery Label */
        const masteryLevel = userFirstAndLatestQuizReport.getIn([
          0,
          "latestQuizReport",
          "quizReport",
          "masteryLevel",
        ]);
        setMasteryLevelIndex(
          masteryLevels.findIndex((item) => masteryLevel === item)
        );
        setMasteryLabel(getMasteryLabel(masteryLevel));

        /** Fetching User's Quiz Answer Based On Latest Report Id */
        const quizReportId = userFirstAndLatestQuizReport.getIn([
          0,
          "latestQuizReport",
          "quizReportId",
        ]);
        if (quizReportId) {
          setQuizReportId(quizReportId);
          // await fetchQuizQuestions(userId, topicId, courseId);
          await fetchQuizAnswers(quizReportId, null, true, courseId).call();
        }
      }
    })();
  }, [userFirstAndLatestQuizReport, hasReportFetched]);

  // console.log(quizReportId, courseId,"cnqcnoqocoqom")

  const toggle = (id) => {
    if (clicked === id) {
      return setClicked(null);
    }
    setClicked(id);
  };

  const getQuizAnswersArray = (quizAnswersArrTemp = []) => { 
    const finalArr = [];
    if (quizAnswersArrTemp && quizAnswersArrTemp.length) {
      quizAnswersArrTemp.forEach(el => {
        const questionType = get(el, 'question.questionType', '');
        if (questionType === 'fibInput') {
          finalArr.push(getPrevAnswer(get(el, 'userFibInputAnswer', []), 'fibInput'))
        } else if (questionType === 'mcq') {
          finalArr.push(getPrevAnswer(get(el, "userMcqAnswer", []), 'mcq'));
        } else if (questionType === 'fibBlock') {
          finalArr.push(getPrevAnswer(get(el, 'userFibBlockAnswer', []), 'fibBlock'));
        } else if (questionType === 'arrange') {
          finalArr.push(getPrevAnswer(get(el, 'userArrangeAnswer', []), 'arrange'));
        } else {
          finalArr.push([]);
        }
      })
    }
    return finalArr;
  }

  // Constructing user's last attempted quiz answers.
  const quizAnswers = getLastAttemptAnswers(userQuizAnswers);
  const quizAnswersArr = getQuizAnswersArray(quizAnswers);
  return (
    <>
      <section class="quiz_section_container">
        {hasReportFetched && !quizReportId ? (
          <div className="quiz_heading quiz_empty_heading">
            Student has not attempted quiz yet
          </div>
        ) : (
          <>
            <div class="quiz_heading">Quiz Questions</div>
            <div className="quiz_report_container">
              <TitleContainer
                thisTopic={get(quizReport, "topicData", {})}
                isFetching={
                  !hasReportFetched || !quizAnswers || !quizAnswers.length
                }
              />
              <ReportsContainer
                isFetching={
                  !hasReportFetched || !quizAnswers || !quizAnswers.length
                }
                masteryLevelIndex={masteryLevelIndex}
                masteryLabel={masteryLabel}
                totalFill={get(
                  quizReport,
                  "latestQuizReport.quizReport.totalQuestionCount",
                  1
                )}
                correctFill={get(
                  quizReport,
                  "latestQuizReport.quizReport.correctQuestionCount",
                  0
                )}
                incorrectFill={get(
                  quizReport,
                  "latestQuizReport.quizReport.inCorrectQuestionCount",
                  0
                )}
                unansweredFill={get(
                  quizReport,
                  "latestQuizReport.quizReport.unansweredQuestionCount",
                  0
                )}
              />
            </div>
            {hasReportFetched && quizAnswers && quizAnswers.length ? (
              <div className="quiz_report_container quiz_answer_container">
                <QuestionAreaReview
                  noTopMargin
                  numberOfQuestions={quizAnswers.length}
                  userQuizs={quizAnswers}
                  lastAttemptAnswers={quizAnswers}
                  changeQuestion={(questionNumber) =>
                    setCurrentQuestionIndex(questionNumber)
                  }
                  activeQuestionIndex={currentQuestionIndex}
                  path={match.path}
                  answers={quizAnswersArr || []}
                  isMobile={isMobile()}
                  openOverlay={() => {}}
                  closeOverlay={() => {}}
                  updateAnswers={() => {}}
                  visibleAbortOverlay={false}
                  visibleSubmitOverlay={false}
                  onBackButtonClick={() => {}}
                  isSubmittedForReview={true}
                />
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
};

export default withRouter(QuizComponent);
