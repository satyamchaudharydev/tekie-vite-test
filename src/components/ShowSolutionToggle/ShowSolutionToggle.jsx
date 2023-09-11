import React from 'react'
import cx from "classnames";
import styles from './ShowSolutionToggle.module.scss'

const ShowSolutionToggle = (props) => {
    const handleClick = () => {
        props.handleToggleClick()
    }
    return (
        <div className={cx(styles.solutionContainer, props.isSeeAnswers && styles.active)}>
            <div className={cx(styles.toggleContainer, props.isSeeAnswers && styles.active)} onClick={handleClick}>
                <div className={cx(styles.toggleSwitch, props.isSeeAnswers && styles.active)}>
                </div>
            </div>
            <h3 className={cx(styles.solutionText, props.isSeeAnswers && styles.active)}>Show Correct Answer</h3>
        </div>
    )
}

export default ShowSolutionToggle