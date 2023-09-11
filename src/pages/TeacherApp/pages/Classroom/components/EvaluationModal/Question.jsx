import { get } from 'lodash';
import React from 'react'
import IframeContent from '../../../../../../components/IframeContent/IframeContent';
import TekieCEParser from '../../../../../../components/Preview/Preview';
import parseMetaTags from '../../../../../../utils/parseMetaTags';
import { evaluationTypes } from '../../../../utils';
import { useEvaluationContext } from './contexts/EvaluationContext';
import styles from './EvaluationModal.module.scss'

const Question = ({ openedFromStudentPerformance }) => {
    const { state: { questions,currentQuesNos, practices, evaluationType, currentPracticeNos, presentStudents, currentStudentNos } } = useEvaluationContext()

    const renderCodingQuestion = () => {
        let statement = null
        let parserId = null
        if (openedFromStudentPerformance) {
            statement = get(questions[currentQuesNos], 'assignmentQuestion.statement')
            parserId = get(questions[currentQuesNos], 'assignmentQuestion.id')
        } else {
            statement = get(presentStudents[currentStudentNos],'question.assignmentQuestion.statement','')
            parserId = get(presentStudents[currentStudentNos],'question.assignmentQuestion.id','')
        }
        return (
            <div className={styles.codingQuestionParser}>
                <TekieCEParser
                    value={statement}
                    init={{ selector: `EV-Question_${parserId}` }}
                    legacyParser={(statement) => {
                        return parseMetaTags({ statement, removeCodeTag: true });
                    }}
                />
            </div>
        )
    }

    const renderPracticeQuestion = () => {
        let currentPractice = null
        if (openedFromStudentPerformance) {
            currentPractice = practices[currentPracticeNos]
        } else {
            currentPractice = presentStudents[currentStudentNos]
        }
        return (
            <>
                <h3 className={styles.practiceQuestionTitleStyle}>{get(currentPractice, 'blockBasedPractice.title')}</h3>
                <div style={{ margin: '15px 0', fontSize: '9px', fontWeight: '400' }}>
                    <TekieCEParser
                        value={get(currentPractice,'blockBasedPractice.projectDescription','')}
                        init={{ selector: `EV-Question_${get(currentPractice, 'blockBasedPractice.id')}` }}
                        legacyParser={(statement) => {
                            return parseMetaTags({ statement, removeCodeTag: true });
                        }}
                    />
                </div>
                {get(currentPractice , 'blockBasedPractice.externalDescriptionEnabled') ? (
                    <IframeContent
                        projectDescription={get(currentPractice, 'blockBasedPractice.projectCreationDescription')}
                        forAnswerLink
                    />
                ) : (
                    <TekieCEParser
                        value={get(currentPractice,'blockBasedPractice.projectCreationDescription','')}
                        init={{ selector: `EV-Question_${get(currentPractice, 'blockBasedPractice.id')}` }}
                        legacyParser={(statement) => {
                            return parseMetaTags({ statement, removeCodeTag: true });
                        }}
                    />
                )}
            </>
        )
    }

    return <div className={`${styles.box} ${styles.quesBox}`}>
        {(evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) ? (
            renderPracticeQuestion()
        ) : (
            renderCodingQuestion()
        )}
    </div>;
};

export default Question