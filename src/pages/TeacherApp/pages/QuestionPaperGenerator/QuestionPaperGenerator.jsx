import { get } from 'lodash';
import React from 'react'
import { Redirect } from 'react-router';
import Button from '../../components/Button/Button';
import ReportPageHeader from '../../components/ReportPageHeader';
import styles from './questionPaperGenerator.module.scss';

class QuestionPaperGenerator extends React.Component{
    render() { 
        const checkIfQuestionPaperIsEnabled = () => {
            const { loggedInUser } = this.props
            let loggedInUserData = (loggedInUser && loggedInUser.toJS()) || {}
            return get(loggedInUserData, 'mentorProfile.schools[0].isQuestionPaperGeneratorEnabled', false)
        }
        const isQuestionPaperGeneratorEnabled = checkIfQuestionPaperIsEnabled()
        if (!isQuestionPaperGeneratorEnabled) {
            return  <Redirect to='/teacher/classrooms' />
        }
        return (
            <div className={styles.questionPaperGeneratorContainer}>
                <ReportPageHeader fromQuestionPage={true} />
                <div className={styles.questionPaperGeneratorDivContainer}>
                    <div className={styles.questionPaperGeneratorDiv}>
                        <h1>Question Paper Generator</h1>
                        <p>Click below button to launch question paper generator</p>
                        <div className={styles.questionPaperButtonDiv}>
                            <Button widthFull type='primary' text={'Launch'} onBtnClick={() => window.open("https://app.examin8.com/login", "_blank")} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default QuestionPaperGenerator;
