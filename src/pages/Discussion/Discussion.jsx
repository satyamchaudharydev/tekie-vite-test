import React, { Component } from 'react'
import styles from './Discussion.module.scss'
import {NextButton} from '../../components/Buttons/NextButton'

class Discussion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessionStartDate: null
        }
    }
    componentDidMount() {
        const { state } = this.props.history.location
        this.setState({
            sessionStartDate: state && state.sessionStartTime
        })
    }

    componentDidUpdate(prevState) {
        if (!this.state.sessionStartDate && prevState.sessionStartDate) {
            this.setState({
                sessionStartDate: prevState.sessionStartDate
            })
        }
    }

    handleNext = () => {
        const { params: { topicId } } = this.props.match
        this.props.history.push(`/sessions/video/${topicId}`)
    }

    render () {
        return (
            <div className={styles.container}>
                <div className={styles.bodyContainer}>
                    <div className={styles.homeworkIconContainer} />
                        <div className={styles.textContainer}>
                            Let's revisit past homework.
                        </div>
                </div>
                <div
                    className={styles.nextButtonContainer}
                    onClick={this.handleNext}
                >
                    <NextButton
                        title='Next'
                    />
                </div>
            </div>
        )
    }
}

export default Discussion
