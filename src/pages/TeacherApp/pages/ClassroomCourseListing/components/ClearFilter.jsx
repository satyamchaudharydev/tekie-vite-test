import React from 'react'
import styles from '../classroomCourseListing.module.scss';
import cx from 'classnames'
 

export const ClearFilter = ({handleClick=() => {}}) => {
  return (
    <button
        className={cx(styles.viewReportCta, styles.clearFilterCta)}
        onClick={() => handleClick()}>Clear Filters</button>

  )
}
