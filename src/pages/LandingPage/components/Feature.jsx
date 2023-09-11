import React, { Component } from 'react'
import cx from 'classnames'
import './Feature.scss'

export default class Features extends Component {
  render() {
    return (
      <div className={'landing-page-feature-container'}>
        <div className={cx('landing-page-feature-iconContainer', 'sr-100-10-600')}>
          <div className={cx(this.props.iconClass, 'landing-page-feature-icon')} style={{
            background: `url('${this.props.icon}')`
          }}></div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 className={cx('landing-page-feature-title', 'sr-100-15-600')}>{this.props.title}</h3>
          <div className={cx('landing-page-feature-text', 'sr-200-20-600')}>{this.props.text}</div>
        </div>
      </div>
    )
  }
}
