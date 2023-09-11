import React, { Component } from 'react'
import cx from 'classnames'

export default class Button3DMentor extends Component {
  render() {
    return (
      <div style={this.props.outerContainerStyle}>
        <div {...this.props} className={cx('mentor-button-3d-shadow', this.props.disabled && 'disabled', this.props.className)} >
          <div className={cx('mentor-button-3d-inner-container', this.props.disabled && 'disabled')} style={this.props.innerTextContainerStyle}>
            {this.props.loading && (
              <div class="mentor-button-loading"></div>
            )}
            <span>{this.props.title}</span>
          </div>
        </div>
      </div>
    )
  }
}