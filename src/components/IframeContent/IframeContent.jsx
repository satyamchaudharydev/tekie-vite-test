import React from 'react'
import styles from './iframeContent.module.scss';


const IframeContent = ({ projectDescription: projectDescriptionSrc, embedViewHeight, forAnswerLink = false }) => {
  const getIframeHeight = () => {
    if (embedViewHeight && typeof embedViewHeight === 'number') {
      if (embedViewHeight <= 200) return 'inherit'
      else return `${embedViewHeight}px`
    } else if (forAnswerLink) return 'inherit'
    else return '100%'
  }
  return (
    <iframe
    className={styles.iframeContent} style={{ height: getIframeHeight() }} width='100%'
    id='externalDescriptionForPractice'
    src={projectDescriptionSrc}
    title='External description'
    />
  )
}

export default IframeContent