import React, { Component } from "react";
import { get } from "lodash";
import cx from "classnames";
import SyntaxHighlighter from "react-syntax-highlighter";
import { motion } from "framer-motion";
import ContentLoader from "react-content-loader";
import PressButton from "./PressButton";
import { Button3D } from "../../photon";
import styles from "./Chat.module.scss";
import fetchChatPractice from "../../queries/fetchChatPractice";
import parseChatMessage from "./parseChatMessage";
import getPath from "../../utils/getPath";
import { minCap } from "../../utils/data-utils";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import dumpChat from "../../queries/dumpChat";
import { sort } from '../../utils/immutable'
import duck from '../../duck'
import BadgeModal from '../Achievements/BadgeModal'
import PreserveState from '../../components/PreserveState'
import withArrowScroll from '../../components/withArrowScroll'
import Arrange from '../../components/QuestionTypes/Arrange';
import Mcq from '../../components/QuestionTypes/Mcq';
import FibBlock from '../../components/QuestionTypes/FibBlock';
import FibInput from '../../components/QuestionTypes/FibInput';
import { ARRANGE, FIBBLOCK, FIBINPUT, MCQ } from '../Practice/constants';
import capitalize from '../../utils/text/capitalize';
import dumpPracticeQuestion from '../../queries/dumpPracticeQuestion';
import getCourseId, { getCodePlayground } from '../../utils/getCourseId';
import { getInSessionRoute, getNextLoComponentRoute } from '../UpdatedSessions/utils';
import OldChatStyles from '../Chat/Chat.module.scss'
import isMobile from '../../utils/isMobile';
// import UpdatedSideNavBar from '../../components/UpdatedSideNavBar'
import mentorMenteeSessionAddOrDelete from '../../utils/mmSessionAddOrDelete';
import { checkIfEmbedEnabled, isPqReportNotAllowed } from '../../utils/teacherApp/checkForEmbed'
import goBackToTeacherApp from "../../utils/teacherApp/goBackToTeacherApp";

class Chat extends Component {
  state = {
    messages: [],
    step: 1,
    buttonText: "PRESS",
    isBadgeModalVisible:
      this.props.location.state && this.props.location.state.unlockBadge,
    answers: [],
    answersAdditionalInfo: [],
    dumpLoading: false,
  };

 

async componentDidMount() {
  const { path } = this.props.match
  const { topicId } = this.props.match.params
  if (path === '/sessions/chat/:topicId/:loId') {
    await fetchChatPractice(this.props.userId, this.props.loId, 'withMenteeMentorToken', true, '', topicId).call()
  } else {
    await fetchChatPractice(this.props.userId, this.props.loId, '', false, '', topicId).call()
  }
  mentorMenteeSessionAddOrDelete(this.props.userId, topicId, '', 'started', 'other', null, false)
  if (!this.state.messages.length) {
    this.setMessages()
  }
}

componentDidUpdate(prevProps, prevState) {
  if (prevProps.match.params.loId !== this.props.match.params.loId) {
    this.setState({ messages: [] }, async () => {
      const { topicId } = this.props.match.params
      await fetchChatPractice(this.props.userId, this.props.loId, '', false, '', topicId).call()
      this.setMessages()
    })
  }
  if (this.state.step !== prevState.step) {
    const body = document.getElementById('chat-body')
    body && body.scrollTo(0, body.scrollHeight)
  }
  try {
    const iframes = document.querySelectorAll("iframe");
    if (isMobile() && iframes && iframes.length) {
      (iframes || []).forEach((el) => {
        if (el && el.style && el.contentWindow.document.body) {
          el.style.height =
            18 + get(el, "contentWindow.document.body.scrollHeight", 0) + "px";
        }
      });
    }
    
    } catch (e) {
      console.warn("IFRAME ERROR", { e });
    }
  }

  setMessages() {
    let questionIndex = -1;
    const messages = sort
      .ascend(this.props.message, ["order"])
      .toJS()
      .map((message) => {
        if (message.type === "text") {
          return {
            ...message,
            parsedMessage: parseChatMessage({
              statement: message.statement,
              emojis: message.emoji,
              alignment: message.alignment,
            }),
          };
        }
        if (message.type === "terminal") {
          return { ...message };
        }
        if (message.type === "question") {
          questionIndex++;
          this.setState({ answers: [...this.state.answers, []] });
          this.setState((prev) => ({
            answersAdditionalInfo: [
              ...prev.answersAdditionalInfo,
              {
                id: get(message, "question.id"),
                attemptNumber: 0,
                helpUsedCount: false,
                answerUsedCount: false,
              },
            ],
          }));
          return { ...message, questionIndex, hintsUsed: 0 };
        }
        return message;
      });
    this.setState({ messages: messages });
  }

  renderOutput = (code) => {
    return (
      <iframe
        srcDoc={code}
        className={styles.previewIframe}
        title="Preview Editor"
        onLoad={(obj) => {
          const iframes = document.querySelectorAll("iframe");
          if (isMobile() && iframes && iframes.length) {
            (iframes || []).forEach((el) => {
              if (el.style && el.contentWindow.document.body) {
                el.style.height =
                  15 +
                  get(el, "contentWindow.document.body.scrollHeight", 0) +
                  "px";
              }
            });
          }
        }}
      />
    );
  };

  renderMessages = (step) => (message, i) => {
    if (!message) return <></>;
    let messageComponent = <></>;
    const { type } = message;

    let prevMessage = this.state.messages[i - 1];

    const hiddenStyles = !(this.state.step >= i + 1)
      ? {
          height: 0,
          overflow: "hidden",
          padding: 0,
          lineHeight: 0,
          width: 0,
          margin: 0,
        }
      : {};

    if (type === "text") {
      if (message.alignment === "left") {
        messageComponent = (
          <div className={styles.text} style={hiddenStyles}>
            {message.parsedMessage}
          </div>
        );
      } else {
        messageComponent = (
          <div className={styles.textRight} style={hiddenStyles}>
            {message.parsedMessage}
          </div>
        );
      }
    }

    if (type === "image") {
      messageComponent = (
        <div
          className={styles[`message${message.alignment}`]}
          style={hiddenStyles}
        >
          <div className={styles[`imageContainer${message.alignment}`]}>
            <img
              src={getPath(message.image.uri)}
              className={styles.image}
              alt="Chat"
            />
          </div>
        </div>
      );
    }

    if (type === "terminal") {
      let messageParams = get(message, "editorMode")
        ? `&language=${message.editorMode}`
        : "";
      const pythonMessageComponent = (
        <div
          className={OldChatStyles[`message${message.alignment}`]}
          style={hiddenStyles}
        >
          <div className={OldChatStyles.terminalInputContainer}>
            <SyntaxHighlighter
              language="python"
              style={darcula}
              customStyle={{
                padding: 0,
                margin: 0,
                backgroundColor: "transparent",
                whiteSpace: "pre-wrap",
              }}
            >
              {message.terminalInput ? message.terminalInput : ""}
            </SyntaxHighlighter>
          </div>
          {message.terminalOutput && (
            <div className={OldChatStyles.terminalOutputContainer}>
              <div className={OldChatStyles.terminalOutputText}>
                {message.terminalOutput.split("\n").map((outputLine) => (
                  <div>{outputLine}</div>
                ))}
              </div>
              <div
                className={OldChatStyles.terminalPlayButton}
                onClick={() => {
                  window.open(
                    `/code-playground?chat=${message.id}${messageParams}`,
                    "_blank"
                  );
                }}
              />
            </div>
          )}
        </div>
      );
      const webMessageComponent = (
        <div
          className={cx(
            styles[`message${message.alignment}`],
            styles.terminalContainer,
            !message.terminalOutput && styles.terminalInputOnlyContainer,
            !message.terminalInput && styles.terminalOutputOnlyContainer
          )}
          style={hiddenStyles}
        >
          {message.terminalInput && (
            <div
              className={cx(
                styles.terminalInputContainer,
                !message.terminalOutput && styles.terminalInputOnly
              )}
            >
              <SyntaxHighlighter
                language="css"
                style={darcula}
                customStyle={{
                  padding: 0,
                  margin: 0,
                  backgroundColor: "transparent",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.terminalInput ? message.terminalInput : ""}
              </SyntaxHighlighter>
            </div>
          )}
          {message.terminalOutput && (
            <div
              className={cx(
                styles.terminalOutputContainer,
                !message.terminalInput && styles.terminalOutputOnly
              )}
            >
              {this.renderOutput(message.terminalOutput)}
              {message.terminalInput && (
                <div
                  className={styles.terminalPlayButton}
                  onClick={() => {
                    window.open(
                      `/code-playground?chat=${message.id}${messageParams}`,
                      "_blank"
                    );
                  }}
                />
              )}
            </div>
          )}
        </div>
      );

      const MessageComponents = {
        python: pythonMessageComponent,
        markup: webMessageComponent,
      };

      if (
        message.editorMode &&
        Object.keys(MessageComponents).includes(message.editorMode)
      ) {
        messageComponent = MessageComponents[message.editorMode];
      } else {
        if (getCodePlayground() === "python") {
          messageComponent = pythonMessageComponent;
        } else {
          messageComponent = webMessageComponent;
        }
      }
    }

    if (type === "question") {
      messageComponent = this.renderQuestion(message, i, hiddenStyles);
    }

    if (type === "sticker") {
      messageComponent = (
        <div
          className={styles[`message${message.alignment}`]}
          style={hiddenStyles}
        >
          <img src={getPath(get(message, "sticker.image.uri"))} alt="Sticker" />
        </div>
      );
    }

    if (type === "hintPretext") {
      messageComponent = (
        <div
          className={styles[`text${capitalize(prevMessage.alignment)}`]}
          style={hiddenStyles}
        >
          {parseChatMessage({ statement: message.text })}
        </div>
      );
    }
    if (type === "tryAgain") {
      messageComponent = (
        <div className={styles.hintWrong} style={hiddenStyles}>
          Incorrect, Try Again
        </div>
      );
    }
    if (type === "hint") {
      messageComponent = (
        <div className={styles.hint} style={hiddenStyles}>
          <span role="img" aria-label="bulb-emoji" className={styles.hintEmoji}>
            💡
          </span>
          {parseChatMessage({ statement: message.text })}
        </div>
      );
    }
    return messageComponent;
  };

  updateAnswers = (questionIndex, value) => {
    const { answers } = this.state;
    const newAnswers = answers.map((answer, index) => {
      if (index === questionIndex) {
        return value;
      } else {
        return answer;
      }
    });
    this.setState({ answers: newAnswers });
  };

  renderQuestion = (message, i, hiddenStyles) => {
    let questionComponent = <></>;
    let answers = message.defaultAnswers
      ? message.defaultAnswers
      : this.state.answers;
    let isSubmittedForReview = !!message.defaultAnswers;
    const { question } = message;
    if (question) {
      if (get(question, "questionType") === "arrange") {
        questionComponent = (
          <Arrange
            key={get(question, "id")}
            question={question}
            withUpdatedDesign
            answers={answers}
            isSubmittedForReview={isSubmittedForReview}
            updateAnswers={this.updateAnswers}
            activeQuestionIndex={message.questionIndex}
            fromChatbot
            isMobile={isMobile()}
            fromHomework={false}
          />
        );
      }
      if (get(question, "questionType") === "mcq") {
        questionComponent = (
          <Mcq
            key={get(question, "id")}
            answerType="RS"
            question={question}
            withUpdatedDesign
            answers={answers}
            isSubmittedForReview={isSubmittedForReview}
            fromChatbot
            updateAnswers={this.updateAnswers}
            activeQuestionIndex={message.questionIndex}
            isMobile={isMobile()}
            fromHomework={false}
          />
        );
      }
      if (get(question, "questionType") === "fibBlock") {
        questionComponent = (
          <FibBlock
            language="css"
            terminalAuto
            key={get(question, "id")}
            question={question}
            reviewMode
            withUpdatedDesign
            answers={answers}
            isSubmittedForReview={isSubmittedForReview}
            updateAnswers={this.updateAnswers}
            activeQuestionIndex={message.questionIndex}
            isMobile={isMobile()}
            fromChatbot
            fromHomework={false}
          />
        );
      }
      if (get(question, "questionType") === "fibInput") {
        questionComponent = (
          <FibInput
            terminalAuto
            key={get(question, "id")}
            question={question}
            withUpdatedDesign
            answers={answers}
            isSubmittedForReview={isSubmittedForReview}
            updateAnswers={this.updateAnswers}
            activeQuestionIndex={message.questionIndex}
            isMobile={isMobile()}
            fromHomework={false}
          />
        );
      }
    }

    const questionEvaluationLabels = {
      correct: "Correct",
      incorrect: "Incorrect",
    };
    const questionEvaluationLabel =
      questionEvaluationLabels[message.resultType];
    const shouldQuestionLabel =
      message.resultType === "incorrect" && message.animationDisable
        ? false
        : !!questionEvaluationLabel;

    return (
      <div
        className={cx(
          styles.questionContainer,
          styles[message.alignment],
          message.resultType === "correct" && styles.correctQuestion,
          message.resultType === "incorrect" && styles.inCorrectQuestion
        )}
        style={hiddenStyles}
      >
        {questionComponent}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!isSubmittedForReview &&
            (!isMobile() ? (
              <div
                className={styles.checkButton}
                onClick={() => {
                  this.onCheckButtonClick();
                }}
              >
                Check
              </div>
            ) : (
              <Button3D
                title="Submit"
                onClick={() => {
                  this.onCheckButtonClick();
                }}
              />
            ))}
        </div>
        <div
          className={cx(
            styles.questionLabel,
            !shouldQuestionLabel && styles.hiddenEvaluationLabel,
            message.resultType === "incorrect" && styles.questionLabelIncorrect
          )}
        >
          {questionEvaluationLabel}
        </div>
      </div>
    );
  };

  checkAnswer = () => {
    const currentQuestionMessage = this.state.messages[this.state.step - 1];
    const currentQuestion = get(currentQuestionMessage, "question", {});

    let isCorrect = true;
    if (currentQuestion.questionType === FIBBLOCK) {
      const options = get(currentQuestion, "fibBlocksOptions", []);
      for (let i = 0; i < options.length; i++) {
        const correctPositions = get(options, `[${i}].correctPositions`);
        const statement = get(options, `[${i}].statement`);
        for (
          let positionIndex = 0;
          positionIndex < correctPositions.length;
          positionIndex++
        ) {
          const position = correctPositions[positionIndex];
          const attemptedAnswer = this.state.answers[
            currentQuestionMessage.questionIndex
          ][position - 1];
          if (attemptedAnswer === statement) {
            isCorrect = true;
            break;
          } else {
            return false;
          }
        }
      }
    } else if (currentQuestion.questionType === FIBINPUT) {
      const options = get(currentQuestion, "fibInputOptions", []);
      for (let i = 0; i < options.length; i++) {
        const correctPosition = get(options, `[${i}].correctPosition`);
        const correctAnswers = get(options, `[${i}].answers`, {});
        const attemptedAnswer = this.state.answers[
          currentQuestionMessage.questionIndex
        ][correctPosition - 1];
        isCorrect = false;
        for (
          let answerIndex = 0;
          answerIndex < correctAnswers.length;
          answerIndex++
        ) {
          if (attemptedAnswer === correctAnswers[answerIndex]) {
            isCorrect = true;
            break;
          }
        }
        if (!isCorrect) {
          return false;
        }
      }
    } else if (currentQuestion.questionType === ARRANGE) {
      if (this.state.answers[currentQuestionMessage.questionIndex].length === 0)
        return;
      const options = get(currentQuestion, "arrangeOptions", []);
      isCorrect = true;
      for (let i = 0; i < options.length; i++) {
        const correctPositions = get(
          options,
          `[${
            this.state.answers[currentQuestionMessage.questionIndex][i]
          }].correctPositions`
        );
        const currentPosition = i + 1;
        if (
          currentPosition !== null &&
          !correctPositions.includes(currentPosition)
        ) {
          isCorrect = false;
          break;
        }
      }
    } else if (currentQuestion.questionType === MCQ) {
      const options = get(currentQuestion, "mcqOptions", []);
      isCorrect = true;
      for (let i = 0; i < options.length; i++) {
        let isCorrectAtIndex = get(options, `[${i}].isCorrect`, false);
        let isSelected = this.state.answers[
          currentQuestionMessage.questionIndex
        ][i];
        if (
          (isCorrectAtIndex && !isSelected) ||
          (!isCorrectAtIndex && isSelected)
        ) {
          isCorrect = false;
          break;
        }
      }
    }
    return isCorrect;
  };

  showAnswerIsCorrect() {
    const currentQuestionMessage = this.state.messages[this.state.step - 1];
    /* 
    {
      ...currentQuestionMessage,
      defaultAnswers: this.state.answers,
    },
  */
    this.setState(
      (prev) => ({
        messages: [
          ...this.state.messages.slice(0, prev.step - 1),
          {
            ...currentQuestionMessage,
            resultType: "correct",
            defaultAnswers: this.state.answers,
          },
          ...this.state.messages.slice(prev.step),
        ],
        answersAdditionalInfo: this.state.answersAdditionalInfo.map((answer) =>
          answer.id === get(currentQuestionMessage, "question.id")
            ? {
                ...answer,
                attemptNumber: answer.attemptNumber + 1,
              }
            : answer
        ),
      }),
      () => {
        const nextMessage = this.state.messages[this.state.step]
        this.setState((prev) => ({
          step: prev.step + 1,
        }), () => {
          if (get(nextMessage, 'type') === 'question') {
            this.updateStartEndTimeForAnswer(nextMessage, 'next')
          } else if (get(currentQuestionMessage, 'type') === 'question') {
            this.updateStartEndTimeForAnswer(currentQuestionMessage, 'prev')
          }
        });
      }
    );
  }

  showHintAndWrongAnswer() {
    const currentQuestionMessage = this.state.messages[this.state.step - 1];
    let nextStep = this.state.step;
    if (
      currentQuestionMessage.hintsUsed ===
      get(currentQuestionMessage, "question.hints", []).length
    ) {
      this.setState(
        (prev) => ({
          messages: [
            ...this.state.messages.slice(0, prev.step - 1),
            {
              ...currentQuestionMessage,
              resultType: "incorrect",
              defaultAnswers: null,
              animationDisable: false,
            },
            ...this.state.messages.slice(prev.step),
          ],
        }),
        () => {
          setTimeout(() => {
            this.setState({
              messages: this.state.messages.map((message, i) =>
                this.state.step - 1 === i
                  ? { ...message, animationDisable: true, resultType: null }
                  : message
              ),
            });
          }, 2000);
        }
      );
    } else {
      const hintPretext = get(
        currentQuestionMessage,
        `question.hints[${currentQuestionMessage.hintsUsed}].hintPretext`
      )
        ? {
            type: "hintPretext",
            text: get(
              currentQuestionMessage,
              `question.hints[${currentQuestionMessage.hintsUsed}].hintPretext`
            ),
            hintsUsed: currentQuestionMessage.hintsUsed + 1,
          }
        : {};
      const hint = get(
        currentQuestionMessage,
        `question.hints[${currentQuestionMessage.hintsUsed}].hint`
      )
        ? {
            type: "hint",
            text: get(
              currentQuestionMessage,
              `question.hints[${currentQuestionMessage.hintsUsed}].hint`
            ),
            hintsUsed: currentQuestionMessage.hintsUsed + 1,
          }
        : {};
      this.setState((prev) => ({
        step: nextStep + 2,
        answersAdditionalInfo: this.state.answersAdditionalInfo.map((answer) =>
          answer.id === get(currentQuestionMessage, "question.id")
            ? {
                ...answer,
                attemptNumber: answer.attemptNumber + 1,
                isHintUsed: true,
              }
            : answer
        ),
        messages: [
          ...this.state.messages.slice(0, prev.step - 1),
          {
            ...currentQuestionMessage,
            resultType: "incorrect",
            defaultAnswers: this.state.answers,
            hintsUsed: currentQuestionMessage.hintsUsed + 1,
          },
          hintPretext,
          hint,
          {
            ...currentQuestionMessage,
            resultType: null,
            defaultAnswers: null,
            hintsUsed: currentQuestionMessage.hintsUsed + 1,
          },
          ...this.state.messages.slice(prev.step),
        ],
        answers: this
        .state.answers.map((answer, i) =>
          i === currentQuestionMessage.questionIndex ? [] : answer
        ),
      }));
    }
  }

  onCheckButtonClick = () => {
    const isCorrectAnswer = this.checkAnswer();
    if (isCorrectAnswer) {
      this.showAnswerIsCorrect();
    } else {
      this.showHintAndWrongAnswer();
    }
  };

  updateComponentDetail = () => {
    const { loId } = this.props.match.params;
    duck.merge(() => ({
      learningObjective: {
        id: loId,
        chatStatus: "complete",
        practiceQuestionStatus: "complete",
      },
    }));
  };
  getNextComponent = () => {
    const { topicId, loId } = this.props.match.params
    const { topics } = this.props
    const topicJS = (topics && topics.toJS().filter(topic => topic.id === topicId)) || []
    const { topicComponentRule = [] } = topicJS[0] || {}
    if (topicComponentRule) {
      let sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
      sortedTopicComponentRule = (sortedTopicComponentRule || []).filter(el => !['homeworkAssignment', 'quiz', 'homeworkPractice'].includes(get(el, 'componentName')))
      const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => el.learningObjective && el.learningObjective.id === loId)
      let nextComponent = null
      if (sortedTopicComponentRule[currentTopicComponentIndex + 1]) {
        nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
      }
      return {
        nextComponent,
        currentComponent: sortedTopicComponentRule[currentTopicComponentIndex]
      }
    }
    return {
      nextComponent: null,
      currentComponent: null
    }
  }

  openMessage = async (isTriggeredByTimer = false) => {
    const { topicId, loId, courseId } = this.props.match.params;
    const courseString = courseId ? `/${courseId}` : "";
    const currentMessage = this.state.messages[this.state.step - 1];
    if (
      currentMessage.type === "question" &&
      currentMessage.resultType !== "correct"
    ) {
      return;
    }

    if (!(this.state.step < this.state.messages.length)) {
      dumpChat(
        this.props.userId,
        loId,
        { chatAction: "next" },
        this.props.userLearningObjective.getIn([0, "id"]),
        false,
        courseId,
        topicId,
      ).call();
      let pqDumpInput = this.state.answersAdditionalInfo.map((answer) => ({
        questionConnectId: answer.id,
        isHintUsed: answer.isHintUsed,
        isAnswerUsed: false,
        attemptNumber: answer.attemptNumber,
        isCorrect: true,
        questionAction: "next",
        startTime: answer.startTime,
        endTime: answer.endTime
      }));
      let isReportNext =
        get(this.props.learningObjective.toJS(), "0.questionBankMeta.count") >
        0;
      // let isPQNext =
      //   get(this.props.learningObjective.toJS(), "0.questionBankMeta.count") >
      //   0;
      const course = this.props.course && this.props.course.toJS();
      let sortedLoComponentRule = []
      if (course) {
        sortedLoComponentRule = get(
          course,
          "defaultLoComponentRule",
          []
        );
        const { currentComponent } = this.getNextComponent()
        if (currentComponent && (get(currentComponent, 'learningObjectiveComponentsRule', []) || []).length) {
          sortedLoComponentRule = get(currentComponent, 'learningObjectiveComponentsRule', [])
        }
        if (
          sortedLoComponentRule &&
          sortedLoComponentRule.findIndex(
            (el) => get(el, "componentName") === "message"
          ) !== -1
        ) {
          isReportNext = false;
        }
      }
      if (isReportNext) {
        this.setState({ dumpLoading: true });
        await dumpPracticeQuestion(
          this.props.userId,
          loId,
          pqDumpInput,
          this.props.userLearningObjective.getIn([0, "nextComponent"]),
          topicId,
          this.props.userLearningObjective.getIn([0, "id"]),
          "withMenteeMentorToken",
          getCourseId(topicId)
        );
        this.setState({ dumpLoading: false });
      }

      // const topicComponentRule = get(
      //   this.props.topic.toJS(),
      //   "0.topicComponentRule",
      //   []
      // );
      const revistRoute =
        this.props.match.path ===
        "/revisit/sessions/chat/:courseId/:topicId/:loId"
          ? "/revisit"
          : "";
      // const currentComponentIndex = topicComponentRule.findIndex(
      //   (rule) =>
      //     get(rule, "componentName") === "learningObjective" &&
      //     get(rule, "learningObjective.id") === this.props.loId
      // );
      // const isAssignmentNextComponent =
      //   get(topicComponentRule[currentComponentIndex + 1], "componentName") ===
      //   "assignment";
      if (isReportNext) {
        if (checkIfEmbedEnabled()) {
          if (isPqReportNotAllowed()) {
            const redirectUrl = this.moveToNextComponent(isReportNext)
            if (redirectUrl) {
              return this.props.history.push(redirectUrl)
            } else {
              if (checkIfEmbedEnabled()) goBackToTeacherApp()
            }
          }
          this.props.history.push(
            `${revistRoute}/sessions/pq-report${courseString}/${topicId}/${loId}`,
            {
              answers: this.state.answers,
              answersAdditionalInfo: this.state.answersAdditionalInfo,
              shouldFetchReportOffline: true,
              // detailedReport: 'fdsf....'
            }
          );
        } else {
          this.props.history.push(
            `${revistRoute}/sessions/practice-report${courseString}/${topicId}/${loId}`,
            {
              answers: this.state.answers,
              answersAdditionalInfo: this.state.answersAdditionalInfo,
              shouldFetchReportOffline: true,
              // detailedReport: 'fdsf....'
            }
          );
        }
      } else {
        const redirectUrl = this.moveToNextComponent(isReportNext)
        // Chat is not considered as last component so, there is no end session operation here
        if (redirectUrl) {
          this.props.history.push(redirectUrl)
        } else {
          this.props.history.push(
            `${revistRoute}/sessions/chat${courseString}/${topicId}/${loId}`
          );
        }
      }
      if (
        this.props.userLearningObjective.getIn([0, "chatStatus"]) ===
        "incomplete"
      ) {
        this.updateComponentDetail();
      }

      return;
    }

    if (this.state.step < this.state.messages.length) {
      const currentMessage = this.state.messages[this.state.step - 1];
      if (
        currentMessage.type !== "question" ||
        currentMessage.resultType === "correct"
      ) {
        const nextMessage = this.state.messages[this.state.step]
        this.setState((prev) => ({ step: prev.step + 1 }), () => {
          if (get(nextMessage, 'type') === 'question') {
            this.updateStartEndTimeForAnswer(nextMessage, 'next')
          } else if (get(currentMessage, 'type') === 'question') {
            this.updateStartEndTimeForAnswer(currentMessage, 'prev')
          }
        });
      }
    }
  };

  moveToNextComponent = (isReportNext) => {
    const { course } = this.props
    const { topicId, loId, courseId } = this.props.match.params;
    const { currentComponent, nextComponent } = this.getNextComponent()
    const childComponentsName = []
    if (isReportNext) childComponentsName.push('chatbot')
    else childComponentsName.push('message')
    const defaultLoComponentRule = (course && course.toJS() && get(
      course.toJS(),
      "defaultLoComponentRule",
      []
    )) || []
    const redirectUrl = getNextLoComponentRoute({
        course,
        learningObjective: this.props.learningObjectives,
        learningObjectiveId: loId,
        topicComponentRule: currentComponent,
        courseId,
        topicId,
        childComponentsName
    })
    if (redirectUrl) {
      return redirectUrl;
    }
    if (nextComponent) {
      const { redirectUrl } = getInSessionRoute({
        topicComponentRule: nextComponent,
        course: {
          id: courseId,
          defaultLoComponentRule
        },
        topicId,
        learningObjectives: this.props.learningObjectives,
        goToNextComponent: true,
      })
      if (redirectUrl) {
        return redirectUrl
      }
    }
    // const revistRoute = this.props.match.path.includes("/revisit") ? '/revisit' : ''
    // if (nextComponent.componentName === 'learningObjective') {
    //   const { course } = this.props
    //   const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
    //   let filteredLo = this.props.learningObjectives && this.props.learningObjectives.toJS().filter(lo => get(lo, 'id') === nextComponent.learningObjective.id)
    //   let LoRedirectKey = 'comic-strip'
    //   if (filteredLo && filteredLo.length && sortedLoComponentRule && sortedLoComponentRule.length) {
    //     let filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule)
    //     if (filteredLoComponentRule && filteredLoComponentRule.length) {
    //       LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
    //     }
    //   }
    //   return this.props.history.push(`${revistRoute}/sessions/${LoRedirectKey}/${courseId}/${topicId}/${nextComponent.learningObjective.id}`)
    // } else if (nextComponent.componentName === 'blockBasedProject') {
    //   return this.props.history.push(`${revistRoute}/sessions/project/${courseId}/${topicId}/${nextComponent.blockBasedProject.id}`)
    // } else if (nextComponent.componentName === 'blockBasedPractice') {
    //   return this.props.history.push(`${revistRoute}/sessions/practice/${courseId}/${topicId}/${nextComponent.blockBasedProject.id}`)
    // } else if (nextComponent.componentName === 'assignment') {
    //   return this.props.history.push(`${revistRoute}/sessions/coding/${courseId}/${topicId}`)
    // } else if (nextComponent.componentName === 'video') {
    //   return this.props.history.push(`${revistRoute}/sessions/video/${courseId}/${topicId}/${nextComponent.video.id}`)
    // }
  }
  updateStartEndTimeForAnswer = (questionObj, type = 'next') => {
    const { answersAdditionalInfo } = this.state
    const findQuestionAnsInfo = answersAdditionalInfo.find(question => get(question, 'id') === get(questionObj, 'question.id'))
    const newAnswerAdditionalInfo = answersAdditionalInfo.map((ansInfo) => {
      if (get(findQuestionAnsInfo, 'id') === get(ansInfo, 'id')) {
        if (type === 'next' && !get(ansInfo, 'startTime')) return { ...ansInfo, startTime: new Date().toISOString() }
        else if (type !== 'next' && get(ansInfo, 'startTime')) {
          return { ...ansInfo, endTime: new Date().toISOString() }
        }
      }
      return { ...ansInfo }
    })
    this.setState({
      answersAdditionalInfo: newAnswerAdditionalInfo
    })
  }

  closeBadgeModal = () => {
    const { history } = this.props;
    if (history.location && history.location.state) {
      const state = {};
      history.replace({ ...history.location, state });
    }
    this.setState({
      isBadgeModalVisible: false,
    });
  };

  handleButtonClick = async () => {
    if (!this.props.chatPracticeStatus.getIn(["success"])) return;
    this.openMessage();
  };

  render() {
    const { course } = this.props;
    const isLoading = this.props.chatPracticeStatus.get("loading");
    const { isBadgeModalVisible } = this.state;
    const currentMessage = this.state.messages[this.state.step - 1];
    const shouldShowPressButton = currentMessage
      ? !(
          currentMessage.type === "question" &&
          currentMessage.resultType !== "correct"
        )
      : true;

    const isReportNext =
      get(this.props.learningObjective.toJS(), "0.questionBankMeta.count") > 0;
    const topicComponentRule = get(
      this.props.topic.toJS(),
      "0.topicComponentRule",
      []
    );
    const currentComponentIndex = topicComponentRule.findIndex(
      (rule) =>
        get(rule, "componentName") === "learningObjective" &&
        get(rule, "learningObjective.id") === this.props.loId
    );
    const isAssignmentNextComponent =
      get(topicComponentRule[currentComponentIndex + 1], "componentName") ===
      "assignment";
    if (isMobile()) {
      return (
        <>
          <div style={{ marginBottom: "60px" }}>
            {/* <UpdatedSideNavBar
              mobileNav
              parent="sessions"
              revisitRoute={this.props.match.path.includes("/revisit")}
              computedMatch={this.props.computedMatch || this.props.match}
              pageTitle="Chat"
            /> */}
          </div>
          {isBadgeModalVisible && (
            <BadgeModal
              closeModal={this.closeBadgeModal}
              shouldAnimate
              unlockBadge={this.props.location.state.unlockBadge}
            />
          )}
          <div className={styles.container}>
            {(this.state.dumpLoading && !isPqReportNotAllowed()) && (
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  background: "rgba(0,0,0,0.6)",
                  zIndex: 999999,
                }}
              >
                <div className={styles.loaderModal}>
                  <div className={styles.loadingAnimation} />
                  <div className={styles.loadingText}>
                    {isReportNext
                      ? "Please wait, generating your report."
                      : "Please wait, loading..."}
                  </div>
                </div>
              </div>
            )}
            {this.state.messages.length ? (
              <PreserveState
                state={this.state}
                setState={(state, callback = () => {}) => {
                  this.setState(
                    {
                      ...state,
                      /*added here because initially preservestate is setting isBadgeModal to null in its
                  componentDidMount*/
                      isBadgeModalVisible:
                        this.props.location.state &&
                        this.props.location.state.unlockBadge,
                    },
                    callback
                  );
                }}
                persistIf={(id) => {
                  return id === `chat${this.props.loId}`;
                }}
                saveIf={this.state.step}
                id={`chat${this.props.loId}`}
                preserveScroll={["chat-body"]}
              />
            ) : (
              <></>
            )}
            <div className={styles.frameMobile}>
              <div className={styles.frameBGMobile}></div>
              <div
                className={styles.body}
                id="chat-body"
                style={{
                  height: shouldShowPressButton ? "" : "100%",
                }}
              >
                {isLoading && (
                  <>
                    <ContentLoader
                      className={styles.contentLoader}
                      speed={4}
                      backgroundColor={"rgba(0, 173, 229,  0.4)"}
                      foregroundColor={"#a5ddf3"}
                    >
                      <rect x="0" y="0" rx="5" ry="5" width="300" height="40" />
                    </ContentLoader>
                  </>
                )}
                {!isLoading &&
                  this.state.messages.map(this.renderMessages(this.state.step))}
                <div>
                  <div className={styles.emptyElement}></div>
                </div>
              </div>
              <div
                className={cx(
                  styles.tapContainer,
                  !shouldShowPressButton && styles.tapContainerHidden
                )}
              >
                <div className={styles.buttonsContainer}>
                  <div className={styles.leftDrop}></div>
                  <motion.div
                    style={{
                      originX: 0.5,
                      originY: 1,
                      cursor: isLoading ? "auto" : "pointer",
                    }}
                    className={styles.tapButton}
                    onMouseDown={this.handleButtonClick}
                    onMouseUp={this.stopHoldingPressButton}
                    whileHover={
                      isLoading
                        ? {}
                        : {
                            scale: 1.02,
                            opacity: 0.8,
                          }
                    }
                    whileTap={
                      isLoading
                        ? {}
                        : {
                            scale: 0.95,
                            opacity: 1,
                          }
                    }
                  >
                    <PressButton
                      progress={
                        (this.state.step / this.state.messages.length) * 100
                      }
                    />
                    <div className={styles.tapButtonBody}>
                      {this.state.step <
                      minCap(this.state.messages.length, 2) ? (
                        <span>{this.state.buttonText}</span>
                      ) : (
                        <span>Next</span>
                      )}
                    </div>
                  </motion.div>
                  <div className={styles.rightDrop}></div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        {isBadgeModalVisible && (
          <BadgeModal
            closeModal={this.closeBadgeModal}
            shouldAnimate
            unlockBadge={this.props.location.state.unlockBadge}
          />
        )}
        <div className={styles.container}>
          {(this.state.dumpLoading && !isPqReportNotAllowed()) && (
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.6)",
                zIndex: 999999,
              }}
            >
              <div className={styles.loaderModal}>
                <div className={styles.loadingAnimation} />
                <div className={styles.loadingText}>
                  {isReportNext
                    ? "Please wait, generating your report."
                    : "Please wait, loading..."}
                </div>
              </div>
            </div>
          )}
          {this.state.messages.length ? (
            <PreserveState
              state={this.state}
              setState={(state, callback = () => {}) => {
                this.setState(
                  {
                    ...state,
                    /*added here because initially preservestate is setting isBadgeModal to null in its
                  componentDidMount*/
                    isBadgeModalVisible:
                      this.props.location.state &&
                      this.props.location.state.unlockBadge,
                  },
                  callback
                );
              }}
              persistIf={(id) => {
                return id === `chat${this.props.loId}`;
              }}
              saveIf={this.state.step}
              id={`chat${this.props.loId}`}
              preserveScroll={["chat-body"]}
            />
          ) : (
            <></>
          )}
          <div className={styles.frame}>
            <div className={styles.frameBG}></div>
            <div className={styles.body} id="chat-body">
              {isLoading && (
                <>
                  <ContentLoader
                    className={styles.contentLoader}
                    speed={4}
                    backgroundColor={"rgba(0, 173, 229,  0.4)"}
                    foregroundColor={"#a5ddf3"}
                  >
                    <rect x="0" y="0" rx="5" ry="5" width="300" height="40" />
                  </ContentLoader>
                </>
              )}
              {!isLoading ? <span className="chat-page-mixpanel-identifier" /> : null}
              {!isLoading &&
                this.state.messages.map(this.renderMessages(this.state.step))}
              <div>
                <div className={styles.emptyElement}></div>
              </div>
            </div>
            <div
              className={cx(
                styles.tapContainer,
                !shouldShowPressButton && styles.tapContainerHidden
              )}
            >
              <div className={styles.buttonsContainer}>
                <div className={styles.leftDrop}></div>
                <motion.div
                  style={{
                    originX: 0.5,
                    originY: 1,
                    cursor: isLoading ? "auto" : "pointer",
                  }}
                  className={styles.tapButton}
                  onMouseDown={this.handleButtonClick}
                  onMouseUp={this.stopHoldingPressButton}
                  whileHover={
                    isLoading
                      ? {}
                      : {
                          scale: 1.02,
                          opacity: 0.8,
                        }
                  }
                  whileTap={
                    isLoading
                      ? {}
                      : {
                          scale: 0.95,
                          opacity: 1,
                        }
                  }
                >
                  <PressButton
                    progress={
                      (this.state.step / this.state.messages.length) * 100
                    }
                  />
                  <div className={styles.tapButtonBody}>
                    {this.state.step < minCap(this.state.messages.length, 2) ? (
                      <span>{this.state.buttonText}</span>
                    ) : (
                      <span>Next</span>
                    )}
                  </div>
                </motion.div>
                <div className={styles.rightDrop}></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default withArrowScroll(Chat, "chat-body");
