import React, { Component } from 'react'
import cx from 'classnames'

export default class Button extends Component {
  render() {
    return (
      <div {...this.props} className={cx('photon-button', this.props.disabled && 'disabled', this.props.className)} >
        <div>
          {!this.props.isLoading ? this.props.title : null}
        </div>
        {(!this.props.hideArrow && !this.props.isLoading) && (
          <div className='photon-button-arrowContainer'>
          </div>
        )}
        {
          this.props.isLoading ? this.props.children : null
        }
      </div>
    )
  }
}