import React from 'react'
import styles from './Log.module.scss'
import CreditIcon from '../../components/Buttons/CreditButton/CreditIcon'
import moment from 'moment'

const reasons = {
  signUpBonus: 'Welcome to Tekie!',
  coursePurchased: 'Redeemed on course purchase',
  bankTransfer: 'Redeemed on bank transfer',
}

const Log = props => {
    if(props.reason ==='coursePurchased' && props.type === 'credited'){
        return ''
    }
  return (
    <div className={styles.container}>
      <div>
        <div className={styles.reason}>{reasons[props.reason]}</div>
        <div className={styles.date}>({moment(props.createdAt).format('DD-MM-YYYY')})</div>
      </div>
      <div className={styles.sep}></div>
      <div className={styles.transactions} style={{
        color: props.type === 'credited' ? '#00ade6' : '#ff5744'
      }}>
        <span style={{
          color: '#333333'
        }}>{props.type === 'credited' ? '+' : '-'}</span> {props.amount}
      </div>
      <div className={styles.coin}>
        <CreditIcon />
      </div>
    </div>
  )
}


export default Log
