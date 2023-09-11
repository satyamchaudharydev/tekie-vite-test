import React, { Component } from 'react'
import styles from './BigNextButton.module.scss'
import { ArrowIcon } from '../ArrowButton'
export default class BigNextButton extends Component {
  render() {
    return (
      <div className={styles.container} onClick={this.props.onClick}>
        <div className={styles.thumbnail} style={{
          backgroundImage: `url("${this.props.thumbnail}")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right'

        }}></div>
        <div className={styles.body}>
          <div className={styles.nextUp}>Next up</div>
          <div className={styles.title}>{this.props.title}</div>
        </div>
        <div className={styles.circle}>
          <div className={styles.arrowCircle}>
              <ArrowIcon />
          </div>
        </div>
      </div>
    )
  }
}
