import React from 'react'
import classname from 'classnames'
import { UNDO_TEXT } from '../../../utils/constants'
import styles from './snackbar.module.scss'

const UndoBanner = props => (
  <div className={styles.bannerLayout}>
    <div className={styles.textLayout}>
      <span className={styles.textStyle}>
        {props.deletedItemsCount} Item{props.deletedItemsCount > 1 ? 's' : ''}{' '}
        Deleted
      </span>
    </div>
    <div className={styles.undoLayout} onClick={props.undo}>
      <span className={classname(styles.textStyle, styles.undoTextStyle)}>{UNDO_TEXT}</span>
    </div>
    <div className={styles.closeIcon} onClick={props.dismissBanner}>X</div>
  </div>
)

export default UndoBanner