import {sortBy} from 'lodash'

const getSortedQuizAnswers = (quizAnswers) => {
    const quizAnswersByLO = {}
    const sortedQuizAnswers = []
    if (quizAnswers) {
        quizAnswers.forEach((quiz) => {
            if (quizAnswersByLO[quiz.question.learningObjective.id]) {
                (quizAnswersByLO[quiz.question.learningObjective.id]).push(quiz)
            } else {
                quizAnswersByLO[quiz.question.learningObjective.id] = [quiz]
            }
        })
        const keys = Object.keys(quizAnswersByLO)
        let newOrder = 1
        keys.forEach((key) => {
            const sortedQuizAnswersWithinLO = sortBy(quizAnswersByLO[key], 'question.order')
            sortedQuizAnswersWithinLO.forEach((quizAnswer) => {
                quizAnswer.question.order = newOrder
                sortedQuizAnswers.push(quizAnswer)
                newOrder += 1
            })
        })
    }
    return sortedQuizAnswers
}

export default getSortedQuizAnswers
