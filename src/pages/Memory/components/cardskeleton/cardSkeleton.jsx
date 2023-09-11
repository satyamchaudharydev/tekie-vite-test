import React from 'react'
import ContentLoader from 'react-content-loader'
import styles from './styles.module.scss'

const CardSkeleton = () => {
  return(
    <div className={styles.cardLayout}>
      <ContentLoader
          className={styles.card}
          speed={4}
          backgroundColor={'#f5f5f5'}
          foregroundColor={'#dbdbdb'}
          viewBox="0 0 670 128"
        >
          <rect x="10" y="9.5" rx="3" ry="3" width="150" height="108.9"/>
          <rect x="184.6" y="26" rx="1" ry="1" width="279" height="25"/>
          <rect x="184.6" y="54" rx="1" ry="1" width="279" height="25"/>
        </ContentLoader>
    </div>
  )
}

export default CardSkeleton