import React from 'react'
import ContentLoader from 'react-content-loader'
import styles from './styles.module.scss'

const VideoTitleSkeleton = () => {
  return(
    <div className={styles.cardLayout}>
      <ContentLoader
          className={styles.card}
          speed={4}
          backgroundColor={'#f5f5f5'}
          foregroundColor={'#dbdbdb'}
          viewBox="0 0 1097 200"
        >
          <rect x="10" y="20" rx="5" ry="5" width="300" height="20"/>
          <rect x="1000" y="20" rx="5" ry="5" width="20" height="20"/>
          <rect x="1050" y="20" rx="5" ry="5" width="20" height="20"/>
          <rect x="10" y="80" rx="5" ry="5" width="700" height="10"/>
          <rect x="10" y="100" rx="5" ry="5" width="600" height="10"/>
          <rect x="10" y="120" rx="5" ry="5" width="500" height="10"/>
        </ContentLoader>
    </div>
  )
}

export default VideoTitleSkeleton
