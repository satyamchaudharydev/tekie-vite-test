import React from 'react'
import styles from '../classroomCourseListing.module.scss';
import cx from 'classnames'
import { get } from 'lodash';

export const Pill = ({active,iconComponent,handleClick,label,style}) => {
  return (
    <div className={cx(styles.pill, active && styles.active)}
            onClick={() => handleClick()}
        >
            {iconComponent}
            <span>{label}</span>
            {/* <CloseCircleIcon className={styles.cancelSelectedCourse} height={hs(32)} width={hs(32)} /> */}
        </div>
  )
}
