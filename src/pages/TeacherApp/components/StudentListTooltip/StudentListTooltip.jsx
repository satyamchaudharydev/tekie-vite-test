import { get } from "lodash";
import React from "react";
import styles from './StudentListTooltip.module.scss'
import { AbsentUserBlock } from "../../../../constants/icons";

const StudentListTooltip = ({ heading, list, assignmentKey }) => {
    return (
        <div className={styles.tooltipContainer}>
            <div className={styles.tooltipHeadingContainer}>
                <AbsentUserBlock />
                <h2>{heading}</h2>
            </div>
            <ul className={styles.tooltipBodyContainer}>
                {list && list.length ? (
                    list.map(item => (
                        <li>
                            <span style={{ fontWeight: '600' }}>{assignmentKey ? get(item, 'rollNo') : get(item, 'student.rollNo')} </span>{assignmentKey ? get(item, 'username') : get(item, 'student.user.name')}
                        </li>
                    ))
                    ) : null}
            </ul>
        </div>
    )
}

export default StudentListTooltip