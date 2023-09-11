import React, { Component } from 'react'
import './Claimed.scss'

export default class Claimed extends Component {
  render() {
    const title = this.props.title ? this.props.title : 'One more step to unlock your free session'
    return (
      <div className={'landing-page-claimed-container'}>
        <div className={'landing-page-claimed-closeButton'} onClick={() => { this.props.close() }}></div>
        <div className={'landing-page-claimed-body'}>
          <div className={'landing-page-claimed-hero'}>
            {title}
          </div>
          <div className={'landing-page-claimed-subInfo'}>Please login on a PC/Laptop to access our learning platform.</div>
        </div>
      </div>
    )
  }
}
