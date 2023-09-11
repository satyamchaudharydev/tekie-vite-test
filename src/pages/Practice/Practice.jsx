import React from 'react'
import styles from './Practice.module.scss'
import QuestionArea from './components/QuestionArea'
import Footer from './components/Footer'
import WrongAnswer from './components/WrongAnswerOverlay'
import HelpOverlay from './components/HelpOverlay'
import CorrectAnswerOverlay from './components/CorrectAnswerOverlay'
import fetchChatPractice from '../../queries/fetchChatPractice'
import { Map } from 'immutable'
import dumpPracticeQuestions from '../../queries/dumpPracticeQuestion'
import fetchQuizQuestions from '../../queries/fetchQuizQuestions'
import duck from '../../duck'
import sort from '../../utils/immutable/sort'
import {
    visibleHintOverlay,
    visibleCorrectAnswerOverlay,
    isAnswerUsed,
    isHintUsed,
    attemptNumber,
    ARRANGE,
    FIBBLOCK,
    FIBINPUT,
    MCQ,
    STATUS
  } from './constants'
import PQStoryOverlay from './components/PQStoryOverlay/PQStoryOverlay'
import Skeleton from '../../components/QuestionTypes/Skeleton'
import PreserveState from '../../components/PreserveState'
import mentorMenteeSessionAddOrDelete from '../../utils/mmSessionAddOrDelete'

export default class PracticeQuestionRoot extends React.Component {
    state = {
      visible: false,
      answers: [],
      questionSelected: 0,
      visiblePqStoryOverlay: false,
      visibleHintOverlay: false,
      visibleCorrectAnswerOverlay: false,
      visibleWrongAnswerMessage: false,
      answersAdditionalInfo: [],
      response: null,
      pqStatus: false
    }

    initialPracticeQuestionStatus = ''

    componentDidMount = async () => {
      const learningObjectiveId = this.props.learningObjectiveId
      if(!this.props.hasFetched){
        if (this.props.match.path === '/sessions/practice/:topicId/:loId') {
          await fetchChatPractice(this.props.userId, learningObjectiveId, 'withMenteeMentorToken', false, '', this.props.topicId).call()
        } else {
          await fetchChatPractice(this.props.userId, learningObjectiveId, false, false, '', this.props.topicId).call()
        }
      }
      else{
      if (this.props.practiceQuestionStatus === 'incomplete') {
        this.setState({ visiblePqStoryOverlay: true })
      }
      mentorMenteeSessionAddOrDelete(this.props.userId, this.props.topicId, '', 'started', 'other', null, false)

      // Disable localstorage temporarily...

      // try {
      //   let answersAdditionalInfo = []
      //   const answers = []
      //   const userId = this.props.userId
      //   const data = localStorage.getItem(
      //     `pq/${userId}/${learningObjectiveId}`
      //   )
      //   const parsedData = JSON.parse(data)
      //   for (let i = 0; i < parsedData.length; i++) {
      //     answers.push([])
      //   }
      //   if (parsedData) {
      //     answersAdditionalInfo = parsedData
      //   }
      //   this.setState({ answersAdditionalInfo, answers })
      // } catch (error) {
      // }
    }
    }

    componentDidUpdate = async (prevProps, prevState) => {
      if (this.initialPracticeQuestionStatus === '') {
        if (this.props.practiceQuestionStatus === 'complete' || this.props.practiceQuestionStatus === 'incomplete') {
          this.initialPracticeQuestionStatus = this.props.practiceQuestionStatus
        }
      }

      if (
        this.props.hasFetched &&
        this.state.answersAdditionalInfo.length === 0 &&
        this.props.userPracticeQuestions.getIn(['practiceQuestions'])
      ) {
        const practiceQuestions = this.props.userPracticeQuestions.getIn([
          'practiceQuestions'
        ])
        const practiceQuestionStatus =
          this.props.userPracticeQuestions.get('practiceQuestionStatus') || Map({})
        const answers = []
        let answersAdditionalInfo = []
        for (let i = 0; i < practiceQuestions.size; i++) {
          answers.push([])
          const info = {
            isHintUsed: false,
            isAnswerUsed: false,
            attemptNumber: 0,
            status: practiceQuestions.getIn([i, STATUS])
          }
          answersAdditionalInfo.push(info)
        }
        try {
          const learningObjectiveId = this.props.learningObjectiveId
          const { userId } = this.props
          const data = localStorage.getItem(
            `pq/${userId}/${learningObjectiveId}`
          )
          const parsedData = JSON.parse(data)
          if (parsedData) {
            answersAdditionalInfo = parsedData
          } else {
            localStorage.setItem(
              `pq/${userId}/${learningObjectiveId}`,
              JSON.stringify(answersAdditionalInfo)
            )
          }
        } catch (error) {
          // error
        }
        this.setState({ answers, answersAdditionalInfo, pqStatus: practiceQuestionStatus })
      }
      if (this.state.questionSelected !== prevState.questionSelected) {
        this.setState({
          visiblePqStoryOverlay: false,
          visibleHintOverlay: false,
          visibleCorrectAnswerOverlay: false,
          visibleWrongAnswerMessage: false
        })
      }

      if (this.props.pQDumpStatus.get('success', false) &&
          !prevProps.pQDumpStatus.get('success', false)
      ) {
        this.afterDump()
      }
    }

    updateAnswers = (questionIndex, value) => {
      const { answers } = this.state
      const newAnswers = answers.map((answer, index) => {
        if (index === questionIndex) {
          return value
        } else {
          return answer
        }
      })
      this.setState({ answers: newAnswers })
    }

    openOverlay = overlayName => {
      this.setState({ [overlayName]: true })
      if (overlayName === visibleHintOverlay) {
        this.updateAnswersAdditionalInfo(true)
      }
    }

    closeOverlay = overlayName => {
      this.setState({ [overlayName]: false })
    }

    changeQuestion = questionNumber => {
      const { userPracticeQuestions } = this.props
      const noOfQuestions = userPracticeQuestions.getIn(['practiceQuestions'])
        .size
      if (questionNumber >= 0 && questionNumber < noOfQuestions) {
        this.setState({ questionSelected: questionNumber })
      }
    }

    updateAnswersAdditionalInfo = async (
      hintUsed = false,
      answerUsed = false,
      attempted = false,
      isStatusComplete = false
    ) => {
      const learningObjectiveId = this.props.learningObjectiveId
      const { userId } = this.props
      const { questionSelected, answersAdditionalInfo } = this.state
      if (hintUsed && answersAdditionalInfo[questionSelected] &&!answersAdditionalInfo[questionSelected][isHintUsed]) {
        const newAnswersAddtionalInfo = answersAdditionalInfo.map(
          (answerInfo, index) => {
            if (index === questionSelected) {
              return { ...answerInfo, isHintUsed: true }
            } else {
              return answerInfo
            }
          }
        )
        localStorage.setItem(
          `pq/${userId}/${learningObjectiveId}`,
          JSON.stringify(newAnswersAddtionalInfo)
        )
        this.setState({ answersAdditionalInfo: newAnswersAddtionalInfo })
      } else if (
        answerUsed &&
        !answersAdditionalInfo[questionSelected][isAnswerUsed]
      ) {
        const newAnswersAddtionalInfo = answersAdditionalInfo.map(
          (answerInfo, index) => {
            if (index === questionSelected) {
              return { ...answerInfo, isAnswerUsed: true }
            } else {
              return answerInfo
            }
          }
        )
        localStorage.setItem(
          `pq/${userId}/${learningObjectiveId}`,
          JSON.stringify(newAnswersAddtionalInfo)
        )
        this.setState({ answersAdditionalInfo: newAnswersAddtionalInfo })
      } else if (attempted) {
        const newAnswersAddtionalInfo = answersAdditionalInfo.map(
          (answerInfo, index) => {
            if (index === questionSelected) {
              if (isStatusComplete === true) {
                return {
                  ...answerInfo,
                  attemptNumber: answerInfo.attemptNumber + 1,
                  status: 'complete'
                }
              } else {
                return {
                  ...answerInfo,
                  attemptNumber: answerInfo.attemptNumber + 1,
                  status: 'incomplete'
                }
              }
            } else {
              return answerInfo
            }
          }
        )

        localStorage.setItem(
          `pq/${userId}/${learningObjectiveId}`,
          JSON.stringify(newAnswersAddtionalInfo)
        )
        this.setState({ answersAdditionalInfo: newAnswersAddtionalInfo })
      }
    }

    displayCorrectAnswerMessage = () => {
      this.openOverlay(visibleCorrectAnswerOverlay)
      const { questionSelected } = this.state
      const { userPracticeQuestions } = this.props
      this.setState({
        visibleWrongAnswerMessage: false,
        visibleHintOverlay: false
      })
      if (
        questionSelected ===
        userPracticeQuestions.getIn(['practiceQuestions']).size - 1
      ) {
        this.dumpPracticeQuestions()
      }
    }

    displayWrongAnswerMessage = () => {
      this.setState(
        {
          visibleWrongAnswerMessage: true
        },
        () => setTimeout(()=>{this.setState({ visibleWrongAnswerMessage: false })},2000)
      )
    }

    dumpPracticeQuestions = async () => {
      const { userPracticeQuestions } = this.props
      const { answersAdditionalInfo } = this.state
      const dumpInput = []
      for (let i = 0; i < answersAdditionalInfo.length; i++) {
        const questionId = userPracticeQuestions.getIn([
          'practiceQuestions',
          i,
          'question',
          'id'
        ])
        const questionInput = {
          questionConnectId: questionId,
          isHintUsed: answersAdditionalInfo[i][isHintUsed],
          isAnswerUsed: answersAdditionalInfo[i][isAnswerUsed],
          attemptNumber:
            i === answersAdditionalInfo.length - 1
              ? answersAdditionalInfo[i][attemptNumber] + 1
              : answersAdditionalInfo[i][attemptNumber],
          isCorrect: true,
          questionAction: 'next'
        }
        dumpInput.push(questionInput)
      }
      const learningObjectiveId = this.props.learningObjectiveId
      this.practiceQuestionStatusBeforeDump = this.props.userPracticeQuestions.get('practiceQuestionStatus')
      this.response = await dumpPracticeQuestions(
        this.props.userId,
        learningObjectiveId,
        dumpInput,
        this.props.nextComponent,
        this.props.topicId,
        this.props.userLearningObjective.get('id'),
        'withMenteeMentorToken'
      )
    }

    afterDump = () => {
      const learningObjectiveId = this.props.learningObjectiveId
      if (this.props.nextComponent.get('nextComponentType') === 'message') {
        fetchChatPractice(this.props.userId, this.props.nextComponent.getIn(['learningObjective', 'id']), false, false, '', this.props.topicId)
      } else {
        fetchQuizQuestions(this.props.userId, this.props.topicId)
      }
      if (this.practiceQuestionStatusBeforeDump === 'incomplete') {
        const filteredLO = this.props.learningObjectives.filter(learningObjective => learningObjective.getIn(['topics', 0, 'id']) === this.props.topicId)
        const order = sort.ascend(filteredLO, ['order']).findIndex((learningObjective, i) => learningObjective.get('id') === this.props.learningObjectiveId)
        const userTopicJourneyQuiz = this.props.userTopicJourney.getIn([0, 'quiz'])
        const quiz = (userTopicJourneyQuiz &&  userTopicJourneyQuiz.toJS) ? userTopicJourneyQuiz.toJS() : {}

        // Topic title issue bug.
        const nextComponentToUpdate = order + 1 === this.props.learningObjectives.size
          ? {
            userTopicJourney: {
              id: this.props.topicId,
              quiz: { isUnlocked: true, ...quiz }
            },
            learningObjective: [{
              id: learningObjectiveId,
              practiceQuestionStatus : 'complete'
            }]
          }
          : {
            learningObjective: [{
              id: this.props.nextComponent.getIn(['learningObjective', 'id']),
              isUnlocked: true,
            }, {
              id: learningObjectiveId,
              practiceQuestionStatus : 'complete'
            }]
          }
        duck.merge(() => ({
          currentTopicComponent: this.props.nextComponent.get('nextComponentType'),
          currentTopicComponentDetail: {
            currentLearningObjectiveId: this.props.nextComponent.getIn(['learningObjective', 'id']),
            componentTitle: this.props.nextComponent.get('nextComponentType') === 'message'
              ? this.props.nextComponent.getIn(['learningObjective', 'title'])
              : 'Quiz',
            thumbnail: this.props.nextComponent.getIn(['learningObjective', 'thumbnail']),
            description: this.props.nextComponent.getIn(['learningObjective', 'description']),
            percentageCovered: ((((order + 1) * 2) + 1) / ((filteredLO.size * 2) + 2)) * 100
          },
          ...nextComponentToUpdate
        }))
      }
      this.setState({ response: this.response })
      this.onReportButtonClick()
    }

    onReportButtonClick = async () => {
      const {learningObjectiveId,topicId} = this.props
      const { userId } = this.props
        this.closeOverlay(visibleCorrectAnswerOverlay)
        localStorage.removeItem(`pq/${userId}/${learningObjectiveId}`)
      if (this.props.match.path === '/sessions/practice/:topicId/:loId') {
        this.props.history.push(
            `/sessions/practice-report/${topicId}/${learningObjectiveId}`,
            {
              answers: this.state.answers,
              answersAdditionalInfo: this.state.answersAdditionalInfo,
              shouldFetchReportOffline: true
            }
        )
      } else if (this.props.match.path === '/practice/:topicId/:loId') {
        this.props.history.push(
            `/practice-report/${topicId}/${learningObjectiveId}`,
            {
              answers: this.state.answers,
              answersAdditionalInfo: this.state.answersAdditionalInfo,
              shouldFetchReportOffline: true
            }
        )
      } else if (this.props.match.path === '/revisit/sessions/practice/:topicId/:loId') {
        this.props.history.push(
            `/revisit/sessions/practice-report/${topicId}/${learningObjectiveId}`,
            {
              learningObjectiveId,
              topicId: this.props.topicId,
              isFirstTime: this.initialPracticeQuestionStatus === 'incomplete'
            }
        )
      }
        // this.props.navigation.navigate('PQReport', {
        //   learningObjectiveId,
        //   topicId: this.props.topicId,
        //   isFirstTime: this.initialPracticeQuestionStatus === 'incomplete'
        // })
    }

    onCheckButtonClick = () => {
      const { userPracticeQuestions } = this.props
      const { questionSelected, answers } = this.state
      const practiceQuestions =
        userPracticeQuestions.getIn(['practiceQuestions']) || Map({})
      const questionData = practiceQuestions.get(questionSelected) || Map({})
      let isStatusComplete = false
      if (questionData.getIn(['question', 'questionType']) === ARRANGE) {
        const options = questionData.getIn(['question', 'arrangeOptions'])
        let isCorrect = true
        for (let i = 0; i < options.size; i++) {
          /* pick the element in at each index and get its correct position from props data
           then compare the position with current position which is index + 1
          */
          const correctPosition = options.getIn([
            answers[questionSelected][i],
            'correctPosition'
          ])
          // one is added because the order returned in answers is 0 indexed
          const currentPosition = i + 1
          if (currentPosition !== null && currentPosition !== correctPosition) {
            this.displayWrongAnswerMessage()
            isCorrect = false
            break
          }
        }
        if (isCorrect) {
          isStatusComplete = true
          this.displayCorrectAnswerMessage()
        }
      } else if (questionData.getIn(['question', 'questionType']) === FIBINPUT) {
        const options = questionData.getIn(['question', 'fibInputOptions'])
        let allBlanksCorrect = true
        for (let i = 0; i < options.size; i++) {
          const correctPosition = options.getIn([i, 'correctPosition']) || Map({})
          const correctAnswers = options.getIn([i, 'answers']) || Map({})
          const attemptedAnswer = answers[questionSelected][correctPosition - 1]
          let isAnswerCorrect = false
          for (
            let answerindex = 0;
            answerindex < correctAnswers.size;
            answerindex++
          ) {
            if (attemptedAnswer === correctAnswers.get(answerindex)) {
              isAnswerCorrect = true
              break
            }
          }
          if (!isAnswerCorrect) {
            allBlanksCorrect = false
            break
          }
        }
        if (allBlanksCorrect) {
          isStatusComplete = true
          this.displayCorrectAnswerMessage()
        } else {
          this.displayWrongAnswerMessage()
        }
      } else if (questionData.getIn(['question', 'questionType']) === FIBBLOCK) {
        const options = questionData.getIn(['question', 'fibBlocksOptions'])
        let allBlanksCorrect = true
        for (let i = 0; i < options.size; i++) {
          const correctPositions = options.getIn([i, 'correctPositions'])
          const statement = options.getIn([i, 'statement'])
          let isAnswerCorrect = false
          for (
            let positionIndex = 0;
            positionIndex < correctPositions.size;
            positionIndex++
          ) {
            const position = correctPositions.get(positionIndex)
            const attemptedAnswer = answers[questionSelected][position - 1]
            if (attemptedAnswer === statement) {
              isAnswerCorrect = true
              break
            }
          }
          if (!isAnswerCorrect && correctPositions.size > 0) {
            allBlanksCorrect = false
          }
        }
        if (allBlanksCorrect) {
          isStatusComplete = true
          this.displayCorrectAnswerMessage()
        } else {
          this.displayWrongAnswerMessage()
        }
      } else if (questionData.getIn(['question', 'questionType']) === MCQ) {
        const options = questionData.getIn(['question', 'mcqOptions'])
        let correctAnswer = true
        for (let i = 0; i < options.size; i++) {
          const isCorrect = options.getIn([i, 'isCorrect'])
          const isSelected = answers[questionSelected][i]
          /*  1. option is true and its not selected
              2.option is false and it selected
              both are wrong answer cases */
          if ((isCorrect && !isSelected) || (!isCorrect && isSelected)) {
            correctAnswer = false
          }
        }
        if (correctAnswer) {
          isStatusComplete = true
          this.displayCorrectAnswerMessage()
        } else {
          this.displayWrongAnswerMessage()
        }
      }
      this.updateAnswersAdditionalInfo(
        undefined,
        undefined,
        true,
        isStatusComplete
      )
    }

    /* function is used for fibinput ,fibblock  and mcq to
    check the user has attempted the question */
    checkIfFibOrMcqAttempted = () => {
      const { questionSelected, answers } = this.state
      for (let i = 0; i < answers[questionSelected].length; i = i + 1) {
        if (answers[questionSelected][i] && answers[questionSelected][i] !== '') {
          return true
        }
      }
      return false
    }

    checkIfAttempted = () => {
      const { userPracticeQuestions } = this.props
      const { questionSelected, answers } = this.state
      let isCheckButtonActive = false
      const practiceQuestions =
        userPracticeQuestions.getIn(['practiceQuestions']) || Map({})
      const questionData = practiceQuestions.get(questionSelected) || Map({})
      if (
        questionData.getIn(['question', 'questionType']) === ARRANGE &&
        answers[questionSelected] &&
        answers[questionSelected].length !== 0 &&
        JSON.stringify(answers[questionSelected]) !==
          JSON.stringify([
            ...Array(
              questionData.getIn(['question', 'arrangeOptions']).size
            ).keys()
          ])
      ) {
        isCheckButtonActive = true
      } else if (
        (questionData.getIn(['question', 'questionType']) === FIBINPUT ||
          questionData.getIn(['question', 'questionType']) === FIBBLOCK ||
          questionData.getIn(['question', 'questionType']) === MCQ) &&
        answers[questionSelected] &&
        answers[questionSelected].length !== 0
      ) {
        if (this.checkIfFibOrMcqAttempted()) {
          isCheckButtonActive = true
        }
      }
      return isCheckButtonActive
    }

    updateComponentDetailAfterChatDump = () => {
      const filteredLO = this.props.learningObjectives.filter(learningObjective => learningObjective.getIn(['topics', 0, 'id']) === this.props.topicId)
      const order = sort.ascend(filteredLO, ['order']).findIndex((learningObjective, i) => learningObjective.get('id') === this.props.learningObjectiveId)
      duck.merge(() => ({
        currentTopicComponent: 'practiceQuestion',
        currentTopicComponentDetail: {
          percentageCovered: (((order + 1) * 2) / ((filteredLO.size * 2) + 2)) * 100
        }
      }))
    }

    getVideoPath = (topicId, learningObjective) => {
      const loId = learningObjective && learningObjective.id
      if (this.props.match.path === '/sessions/practice/:topicId/:loId') {
        return `/sessions/video/${topicId}/${loId}`
      } else if (this.props.match.path === '/revisit/sessions/practice/:topicId/:loId') {
        return `/revisit/sessions/video/${topicId}/${loId}`
      }

      return `/video/${topicId}/${loId}`
    }

    render() {
      const {
        hasFetched,
        userPracticeQuestions,
        learningObjectiveData,
      } = this.props
      if (hasFetched) {
        const {
          questionSelected,
          answers,
          visibleCorrectAnswerOverlay,
          visibleWrongAnswerMessage,
          answersAdditionalInfo,
        } = this.state
    //     const { nextComponent } = this.props
    //     const videoThumbnail = this.props.topicData.get('videoThumbnail')
        const {topicId}=this.props
        const learningObjective = learningObjectiveData.toJS()
        const practiceQuestions =
          userPracticeQuestions.getIn(['practiceQuestions']) || Map({})
        const practiceQuestionStatus =
          userPracticeQuestions.get('practiceQuestionStatus') || Map({})
        const isCheckButtonActive = this.checkIfAttempted()
        const questionData = userPracticeQuestions.getIn(['practiceQuestions',questionSelected]) || Map({})
        const hint =  questionData.getIn(['question', 'hint'])
        const answer =  questionData.getIn(['question', 'explanation'])
        return (
            <div className={styles.container}>
              <PreserveState		
                state={this.state}		
                setState={(state, callback = () => {}) => {		
                  this.setState({		
                    ...state,		
                  },		
                  callback)		
                }}		
                persistIf={id => {		
                  return id === this.props.match.url
                }}		
                saveIf={this.state}
                id={this.props.match.url}		
              />
              <QuestionArea
                userPracticeQuestions={this.props.userPracticeQuestions}
                activeQuestionIndex={questionSelected}
                changeQuestion={this.changeQuestion}
                updateAnswers={this.updateAnswers}
                answersAdditionalInfo={answersAdditionalInfo}
                numberOfQuestions={practiceQuestions.size}
                practiceQuestionStatus={practiceQuestionStatus}
                // isPqStoryPresent={!!learningObjective.pqStory}
                answers={answers}
                // isCheckButtonActive={isCheckButtonActive}
                onCheckButtonClick={this.onCheckButtonClick}
                openOverlay={this.openOverlay}
                onReportButtonClick={this.onReportButtonClick}
                visibleHintOverlay={this.state.visibleHintOverlay}
                closeOverlay={this.closeOverlay}
                />
                <Footer
                closeOverlay={this.closeOverlay}
                openOverlay={this.openOverlay}
                isCheckButtonActive={isCheckButtonActive}
                onCheckButtonClick={this.onCheckButtonClick}
                />
                {(this.state.visibleHintOverlay)&&<HelpOverlay
                visible={this.state.visibleHintOverlay}
                closeOverlay={this.closeOverlay}
                hint={hint}
                answer={answer}
                history={this.props.history}
                videoStartTime= {learningObjective.videoStartTime}
                videoEndTime= {learningObjective.videoEndTime}
                videoPath={this.getVideoPath(topicId, learningObjective)}
                isCheckButtonActive={isCheckButtonActive}
                updateAnswersAdditionalInfo={this.updateAnswersAdditionalInfo}
                onCheckButtonClick={this.onCheckButtonClick}
                />}
                <CorrectAnswerOverlay 
                visible={visibleCorrectAnswerOverlay} 
                answer={answer}
                changeQuestion={this.changeQuestion}
                pqDumpLoading={this.props.pQDumpStatus.get('loading', false)}
                onReportButtonClick={this.onReportButtonClick}
                activeQuestionIndex={questionSelected}
                numberOfQuestions={practiceQuestions.size}
                practiceQuestionStatus={practiceQuestionStatus}
                />
                <WrongAnswer  visible={visibleWrongAnswerMessage} />
                <PQStoryOverlay
                visible={this.state.visiblePqStoryOverlay}
                closeOverlay={this.closeOverlay}
                pqStory={learningObjective.pqStory}
                />
            </div>
        )
      }
      else{
        return <Skeleton />
      }
    }
  }
