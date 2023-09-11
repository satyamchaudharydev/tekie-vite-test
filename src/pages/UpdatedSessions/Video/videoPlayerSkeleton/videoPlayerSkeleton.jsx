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
          viewBox="0 0 1700 617"
        >
          <rect x="0" y="0" rx="5" ry="5" width="1700" height="617"/>
        </ContentLoader>
    </div>
  )
}

export default VideoPlayerSkeleton
