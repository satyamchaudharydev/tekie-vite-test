import React, {Component} from 'react'
import cx from 'classnames'
import {get} from 'lodash'
import {List, Map} from 'immutable'
import styles from './QuizReport.module.scss'
import updatedStyles from '../UpdatedSessions/QuizReport/QuizReport.module.scss'
import {ReactComponent as TriangleBG} from '../../assets/triangleBG.svg'
import ResultTube from './components/ResultTube'
import fetchQuizReport from '../../queries/fetchQuizReport'
import MasteryTube from './components/MasteryTube'
import SeeAnswerButton from './components/SeeAnswerButton'
import Breakdown from './components/Breakdown'
import BigNextButton from '../../components/Buttons/BigNextButton'
import getPath from '../../utils/getPath'
import BadgeModal from '../Achievements/BadgeModal'
import fetchTopics from '../../queries/sessions/fetchTopic'
import {sort} from "../../utils/immutable";
import dumpQuiz from "../../queries/dumpQuiz";
import fetchTopicJourney from "../../queries/fetchTopicJourney"
import PopUp from '../../components/PopUp/PopUp'
import {hs} from "../../utils/size";
import SimpleButtonLoader from "../../components/SimpleButtonLoader";
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils'

const masteryLevels = ['none', 'familiar', 'master', 'proficient']

export default class QuizReport extends Component {
    state = {
        animateResultTube: false,
        startAnimation: false,
        totalFill: 1,
        correctFill: 0,
        incorrectFill: 0,
        unansweredFill: 0,
        hasFetched: 0,
        isBadgeModalVisible: this.props.location.state && this.props.location.state.unlockBadge,
        isQuizFetched: false
    }

    async componentDidMount() {
        let reportType = ''
        let topicId = this.props.match.params.topicId
        if ( get(this, 'props.match.path') === '/sessions/quiz-report-latest/:topicId') {
            reportType = 'latestQuizReport'
            topicId = this.props.location.state && this.props.location.state.quizReportTopicId
        } else {
            reportType = get(this, 'props.match.path') === '/quiz-report-latest/:topicId'
                ? 'latestQuizReport'
                : 'firstQuizReport'
        }
        await fetchQuizReport(topicId).call()
        await fetchTopics().call()
    }

    async componentDidUpdate(prevProps) {
        const { quizReportFetchStatus, quizReportFetchErrors, studentProfile } = this.props
        const reportType = get(this, 'props.match.path') === '/sessions/quiz-report-latest/:topicId'
            ? 'latestQuizReport'
            : 'firstQuizReport'
        if (quizReportFetchStatus && prevProps.quizReportFetchStatus) {
            if (quizReportFetchStatus.getIn(['success']) && !prevProps.quizReportFetchStatus.getIn(['success'])) {
                this.setState({
                    totalFill: this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport', 'totalQuestionCount']),
                    correctFill: this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport', 'correctQuestionCount']),
                    incorrectFill: this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport', 'inCorrectQuestionCount']),
                    unansweredFill: this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport', 'unansweredQuestionCount']),
                })
            }
            if (quizReportFetchStatus.getIn(['failure']) && !prevProps.quizReportFetchStatus.getIn(['failure'])) {
                const error = quizReportFetchErrors && get(quizReportFetchErrors.toJS().pop(), 'error.errors.0.code')
                const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '0.batch'))
                const isBatchSession = studentProfile
                                            ? get(batchDetail, 'id') &&
                                                (
                                                    get(batchDetail, 'type') === 'b2b' ||
                                                    get(batchDetail, 'type') === 'b2b2c'
                                                )
                                            : false
                if (error === 'ComponentLockedError' && !isBatchSession) {
                    const prevTopicId = this.props.location.state && this.props.location.state.quizReportTopicId
                    const currTopicId = this.props.match.params.topicId
                    const quizDumpInput = { topicId: prevTopicId, quizQuestions: [] }
                    if (!this.state.isQuizFetched) {
                        this.setState({
                            isQuizFetched: true
                        }, async () => {
                            const res = await dumpQuiz(
                                prevTopicId,
                                quizDumpInput,
                                currTopicId
                            )
                            if (res) {
                                await fetchTopicJourney(currTopicId, true).call()
                            }
                        })
                    }
                }
            }
        }
    }

    closeBadgeModal = () => {
        this.setState({
            isBadgeModalVisible: false
        })
    }

    showLoader = () => {
        const { quizDumpStatus, userTopicJourneyStatus } = this.props
        return (
            (quizDumpStatus && quizDumpStatus.getIn(['loading'])) || (userTopicJourneyStatus && userTopicJourneyStatus.getIn(['loading']))
        ) && this.state.isQuizFetched
    }

    render() {
        const { quizReportFetchStatus } = this.props
        const reportType = (
            get(this, 'props.match.path') === '/quiz-report-latest/:topicId' ||
            get(this, 'props.match.path') === '/sessions/quiz-report-latest/:topicId'
        ) ? 'latestQuizReport'
            : 'firstQuizReport'
        const learningObjectivesReport = this.props.userFirstAndLatestQuizReport.getIn([
            0,
            reportType,
            'learningObjectiveReport'
        ], List([]))
        const masteryLevel = this.props.userFirstAndLatestQuizReport.getIn([
            0,
            'latestQuizReport',
            'quizReport',
            'masteryLevel'
        ])
        const masteryLevelIndex = masteryLevels.findIndex(
            item => masteryLevel === item
        )
        const isFetching = ((quizReportFetchStatus && quizReportFetchStatus.getIn(['loading'])) && !this.showLoader())
        const thisTopic = this.props.topic.find(topic =>
            topic.get('id') === this.props.userFirstAndLatestQuizReport.getIn([0, 'topic', 'id'])
        ) || Map({})
        const nextTopic = this.props.topic.find(topic =>
            topic.get('id') === this.props.userFirstAndLatestQuizReport.getIn([0, 'nextComponent', 'topic', 'id'])
        ) || Map({})
        const { isBadgeModalVisible } = this.state
        if (isFetching || !nextTopic.get('id')) {
            return (
                <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 999999 }}>
                    <div className={updatedStyles.loaderModal}>
                        <div className={updatedStyles.loadingAnimation} />
                        <div className={updatedStyles.loadingText}>Please wait, generating your report .</div>
                    </div>
                </div>
            )
        }
        return (
            <div>
                {isBadgeModalVisible &&
                <BadgeModal closeModal={this.closeBadgeModal} shouldAnimate
                            unlockBadge={this.props.location.state.unlockBadge}
                />
                }
                <PopUp
                    showPopup={this.showLoader()}
                >
                    <div className={styles.autoSubmitQuizBox}>
                        Auto-submitting Quiz
                        <div style={{marginLeft: `${hs(20)}px`, display: 'flex'}}>
                            <SimpleButtonLoader showLoader={this.showLoader()} style={{ backgroundImage: 'linear-gradient(to bottom, transparent, transparent)' }} />
                        </div>
                    </div>
                </PopUp>
                <div className={styles.triangleBGContainer}>
                    <TriangleBG/>
                </div>
                <div className={styles.title}>
                    <div className={styles.hole}></div>
                    <div className={styles.shadow}></div>
                    <div>Summing up</div>
                    <div className={styles.titleSm}>{thisTopic.get('title')}</div>
                </div>
                <div className={styles.container}>
                    <MasteryTube
                        mastery={masteryLevelIndex === -1 ? 0 : masteryLevelIndex}
                    />
                    <div className={styles.masteryTextContainer}>
                        <div className={styles.masteryText}>You're</div>
                        <div className={styles.masteryLabel}>{masteryLevel === 'none' ? 'not familiar' : masteryLevel}</div>
                        <div className={styles.masteryText}>with this topic.</div>
                    </div>
                    <ResultTube
                        label='Total Questions'
                        total={this.state.totalFill}
                        fill={this.state.totalFill}
                        noAnimate
                        colors={['#cffbff', '#00ade6']}
                        textColor='#1ac9e8'
                    />
                    <ResultTube
                        label='Correct'
                        total={this.state.totalFill}
                        fill={this.state.correctFill}
                        colors={['#01ddb2', '#16d977']}
                        textColor='#16d977'
                        flakeColors={['#16d977', '#006838']}
                    />
                    <ResultTube
                        label='Incorrect'
                        total={this.state.totalFill}
                        fill={this.state.incorrectFill}
                        shouldAnimate={this.state.animateResultTube}
                        colors={['#ff5644', '#b52c00']}
                        textColor='#ff5644'
                        flakeColors={['#fd6554', '#800c00']}
                    />
                    <ResultTube
                        label='Unanswered'
                        total={this.state.totalFill}
                        fill={this.state.unansweredFill}
                        colors={['#bfbfbf', '#707070']}
                        textColor='#707070'
                        flakeColors={['#aaacae', '#504f4f']}
                    />
                </div>
                <SeeAnswerButton
                    topicId={this.props.match.params.topicId}
                    quizReportTopicId={
                        this.props.match.path === '/sessions/quiz-report-latest/:topicId'
                            ? this.props.location.state && this.props.location.state.quizReportTopicId
                            : this.props.match.params && this.props.match.params.topicId
                    }
                    path={this.props.match.path}
                    history={this.props.history}
                />
                <div className={cx(styles.title, styles.goalWiseContainer)}>
                    <div className={styles.hole}></div>
                    <div className={styles.shadow}></div>
                    <div>Goal wise</div>
                    <div>Breakdown</div>
                </div>
                <div className={styles.container}>
                    {learningObjectivesReport.map((loReport, i) => (
                        <Breakdown
                            report={loReport}
                            last={i + 1 === learningObjectivesReport.size}
                            path={this.props.match.path}
                            quizReportTopicId={
                                this.props.match.path === '/sessions/quiz-report-latest/:topicId'
                                    ? this.props.location.state && this.props.location.state.quizReportTopicId
                                    : this.props.match.params && this.props.match.params.topicId
                            }
                        />
                    ))}
                </div>
                <div className={styles.nextButtonContainer}>
                    <BigNextButton onClick={() => {
                        this.props.match.path === '/sessions/quiz-report-latest/:topicId'
                            ? this.props.history.push(`/sessions/video/${nextTopic.get('id')}`)
                            : this.props.history.push(`/video/${nextTopic.get('id')}`)
                    }} title={nextTopic.get('title')} thumbnail={getPath(nextTopic.getIn(['thumbnail', 'uri']))}/>
                </div>

            </div>
        )
    }
}
