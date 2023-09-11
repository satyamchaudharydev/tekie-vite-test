import React, { Component } from 'react'
import { motion } from 'framer-motion'
import cx from 'classnames'
import ArrowSVG from '../../../assets/arrowIcon'
import { FAQClickCloseGA, FAQClickOpenGA } from '../../../utils/analytics/ga';
import './Collapsible.scss'

export default class Collapsible extends Component {
  state = {
    open: false
  }
  render() {
    return (
      <div className={cx('landing-page-collapsible-container', 'landing-page-collapsible-scrollClass')} style={this.props.noBorder && { borderBottom: 0 }} onClick={() => {
        this.setState({ open: !this.state.open }, () => {
          if (this.state.open) {
            FAQClickOpenGA(this.props.title)
          } else {
            FAQClickCloseGA(this.props.title)
          }
        })
      }}>
        <div className={'landing-page-collapsible-wrapper'}>
          <div className={'landing-page-collapsible-head'}>
            <motion.div initial={{ rotate: '0deg' }} className={cx('landing-page-collapsible-arrow')} animate={{
              rotate: this.state.open ? '90deg' : '0deg'
            }}>
              <ArrowSVG className={'landing-page-collapsible-arrowSVG'} />
            </motion.div>
            <h3 className={cx('landing-page-collapsible-title')}>{this.props.title}</h3>
          </div>
          <motion.div
            className={'landing-page-collapsible-body'}
            initial={{
              height: 0,
              opacity: 0,
              y: 10,
              scale: 0.8
            }}
            animate={{
              height: this.state.open ? 'auto' : 0,
              opacity: this.state.open ? 1 : 0,
              y: this.state.open ? 0 : 10,
              scale: this.state.open ? 1 : 0.8,
            }}>
              {this.props.body}
            </motion.div>
        </div>
      </div>
    )
  }
}
