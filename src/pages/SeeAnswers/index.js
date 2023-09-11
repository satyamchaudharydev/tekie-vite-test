import { connect } from 'react-redux'
import SeeAnswers from './SeeAnswers'
import fetchQuizAnswers from '../../queries/fetchQuizAnswers'
import { filterKey } from '../../utils/data-utils'

const getQuizReportId = (userFirstAndLatestQuizReport, props) => {
    const { match: { path } } = props
    if (path && path === '/see-answers-first/:topicId') {
        return  userFirstAndLatestQuizReport.getIn([0, 'firstQuizReport', 'quizReportId'])
    } else if (path && path === '/see-answers-latest/:topicId') {
        return userFirstAndLatestQuizReport.getIn([0, 'latestQuizReport', 'quizReportId'])
    } else if (path && path === '/sessions/see-answers-latest/:topicId') {
        return userFirstAndLatestQuizReport.getIn([0, 'latestQuizReport', 'quizReportId'])
    }

}

const mapStateToProps = (state, props) => {
    const quizReportId = getQuizReportId(
        state.data.getIn([
            'userFirstAndLatestQuizReport',
            'data'
        ]),
        props)
    return (
        {
            quizReportId,
            userQuizAnswers: filterKey(state.data.getIn([
                'userQuizAnswers',
                'data'
            ]),`userQuizAnswers/${quizReportId}`),
            ...(fetchQuizAnswers(quizReportId).mapStateToProps(state))
        }
    )
}

export default connect(mapStateToProps)(SeeAnswers)
