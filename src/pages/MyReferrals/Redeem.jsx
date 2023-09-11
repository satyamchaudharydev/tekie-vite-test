import React, { Component } from 'react'
import { motion } from 'framer-motion'
import styles from './Redeem.module.scss'
import withNoScrollBar from '../../components/withNoScrollBar'
import Coin from '../../components/Buttons/CreditButton/CreditIcon'
import { Link } from 'react-router-dom'

class Redeem extends Component {
  render() {
    return (
      <div className={styles.main} onClick={(e) => {
        e.stopPropagation()
      }}>
        <div className={styles.credits}>
          <div className={styles.coin}>
            <Coin />
          </div>
          <div className={styles.amount}>{this.props.credits}</div>
        </div>
        <div className={styles.title}>Redeem your credits</div>
        <div className={styles.text}>You can redeem your credits by <Link to="/checkout">purchasing our course.</Link></div>
        <div className={styles.or}>Or</div>
        <div>
          <div className={styles.text}>You can trasfer your credits to <span onClick={this.props.onBankTransfer}>your bank account.</span></div>
          <div className={styles.creditsInfo}>( 1 Credit = 1₹)</div>
        </div>
      </div>
    )
  }
}

// const RedeemWithNoScrollBar = withNoScrollBar(Redeem)

class RedeemExit extends Component {
  render() {
    return (
      <motion.div 
        initial={{
          opacity: 0
        }}
        animate={this.props.visible ? {
          opacity: 1
        } : { opacity: 0 }}
        className={styles.container}
        onClick={() => {
          this.props.close()
        }}
        style={!this.props.visible && { pointerEvents: 'none' }}

      >
        {this.props.visible && <Redeem {...this.props} />}
      </motion.div>
    )
  }
}

export default RedeemExit
