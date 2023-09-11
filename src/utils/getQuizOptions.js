import { is } from "immutable";
import { get } from 'lodash';

const getMcqOptionsWithStatus = (mcqOptions, userMcqAnswer, isAnswered) => {
    if (isAnswered && (mcqOptions && (userMcqAnswer && userMcqAnswer.length > 0))) {
        userMcqAnswer.forEach((option, index) => {
            if (option.isSelected) {
                option.status = get(mcqOptions[index], 'isCorrect', false)
                    ? 'correct'
                    : 'wrong'
            }
        })
    } else if (!isAnswered || (userMcqAnswer && userMcqAnswer.length === 0)) {
        userMcqAnswer = mcqOptions
    }
    return userMcqAnswer
}

const getFibBlockAnswersWithStatus = (fibBlockOptions, usersFibBlockOptions, isAnswered) => {
    if (isAnswered && (fibBlockOptions && (usersFibBlockOptions && usersFibBlockOptions.length > 0))) {
        usersFibBlockOptions.forEach((option) => {
            fibBlockOptions.forEach((option_) => {
                if (option_.statement === option.statement && !option_.status) {
                    option_.status = option_.correctPositions.includes(option.position) ? 'correct' : 'wrong'
                    option_.position = option.position
                }
            })
        })
    }
    return fibBlockOptions
}

export {
    getFibBlockAnswersWithStatus,
    getMcqOptionsWithStatus
}
