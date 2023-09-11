import React from 'react'
import ContentLoader from 'react-content-loader'
import styles from './styles.module.scss'

const VideoPlayerSkeleton = () => {
  return(
    <div className={styles.cardLayout}>
      <ContentLoader
          className={styles.card}
          speed={4}
          backgroundColor={'#f5f5f5'}
          foregroundColor={'#dbdbdb'}
          viewBox="0 0 1097 617"
        >
          <rect x="0" y="0" rx="1" ry="1" width="1097" height="617"/>
        </ContentLoader>
    </div>
  )
}

export default VideoPlayerSkeleton
