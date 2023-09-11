import React, { Component } from 'react'
import cx from 'classnames'
import './Activities.scss'

export default class Activities extends Component {
  render() {
    return (
      <div className={cx('landing-page-activities-container', this.props.scrollClass)} style={this.props.noMarginRight && { marginRight: 0 }}>
        <h3 className={'landing-page-activities-title'}>{this.props.title}</h3>
        {this.props.activities.map(activity => (
          <div className={'landing-page-activities-row'}>
            <div className={'landing-page-activities-bullet'} />
            <div className={'landing-page-activities-activity'}>{activity}</div>
          </div>
        ))}
      </div>
    )
  }
}
