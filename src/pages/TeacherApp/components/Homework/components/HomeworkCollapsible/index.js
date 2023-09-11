import { Map } from "immutable";
import { connect } from "react-redux";
import fetchQuizReport from "../../../../../../queries/fetchQuizReport";
import fetchTopics from "../../../../../../queries/sessions/fetchTopic";
import { filterKey } from "../../../../../../utils/data-utils";
import HomeworkCollapsible from "./HomeworkCollapsible";

const getUserQuizs = (userQuiz, key) => {
    const filteredUserQuiz = filterKey(userQuiz, key)
    if (filteredUserQuiz.size !== 0) return filteredUserQuiz.get(0)
    return Map({})
}

const sortByLoOrderAndQuestionOrder = (question1, question2) => {
    const question1LoOrder = question1.getIn(['question', 'learningObjective', 'order'])
    const question2LoOrder = question2.getIn(['question', 'learningObjective', 'order'])
    if (question1LoOrder === question2LoOrder) {
        return question1.getIn(['question', 'order']) - question2.getIn(['question', 'order'])
    }
    return question1LoOrder - question2LoOrder
}

const mapStateToProps = (state, props) => {
    const userQuizs = getUserQuizs(
        state.data.getIn(["userQuiz", "data"]),
        `userQuiz/${props.topicId}`
    ).get("quiz");
    let quizSortedByOrder = Map({});
    if (userQuizs) {
    quizSortedByOrder = userQuizs.sort(sortByLoOrderAndQuestionOrder);
    }
    return {
        loggedInUser:
        filterKey(state.data.getIn(["user", "data"]), "loggedinUser").get(0) ||
        Map({}),
        ...fetchTopics().mapStateToProps(state),
        topic: state.data.getIn(["topic", "data"]),
        userQuizs: quizSortedByOrder,
        userQuizAnswers: state.data.getIn([
            'userQuizAnswers',
            'data'
        ]),
        userFirstAndLatestQuizReport: state.data.getIn([
            'userFirstAndLatestQuizReports',
            'data'
        ]),
        quizReportFailureStatus: state.data.getIn([
            'userQuizReport',
            'fetchStatus',
            `userQuizReport/${props.topicId}`,
            'failure'
        ]),
    };
};

export default connect(mapStateToProps)(HomeworkCollapsible);
