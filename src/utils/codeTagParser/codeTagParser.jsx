import React from 'react'
import styles from './codeTagParser.module.scss'

export default (statement) => {
  //  statement = '<code><bold>asdfdghj<bold><code><code><blank><blank><code>is very good<code><block>hkjl<block><code>'
  const statementArr = (statement) ? statement.split('<code>') : []
  return statementArr.map((textval, index) => {
    if (index % 2 === 0) {
      return (
        <span className={styles.questionText}>{textval}</span>
      )
    } else {
      if (textval.indexOf('<bold>') !== -1) {
        const boldText = textval.replace(/<bold>/g, '')
        return (
          <span className={`${styles.questionText} ${styles.bold}`}>{boldText}</span>
        )
      } else if (textval.indexOf('<block>') !== -1) {
        const blockText = textval.replace(/<block>/g, '')
        return (
          <span className={`${styles.questionText} ${styles.block}`}>{blockText}</span>
        )
      } else if (textval.indexOf('<blank>') !== -1) {
        return <div className={styles.blank} style={{display:'inline-block'}} />
      }
      else{
        return null
      }
    }
  })
}
