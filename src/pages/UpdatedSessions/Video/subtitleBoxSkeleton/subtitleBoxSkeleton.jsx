import React from 'react'
import ContentLoader from 'react-content-loader'
import styles from './styles.module.scss'

const SubtitleBoxSkeleton = () => {
  return(
    <div className={styles.cardLayout}>
      <ContentLoader
          className={styles.card}
          speed={4}
          backgroundColor={'#f5f5f5'}
          foregroundColor={'#dbdbdb'}
          viewBox="0 0 417 900"
        >
          <rect x="0" y="100" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="160" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="220" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="280" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="340" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="400" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="460" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="520" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="580" rx="5" ry="5" width="600" height="40"/>
          <rect x="0" y="640" rx="5" ry="5" width="600" height="40"/>
        </ContentLoader>
    </div>
  )
}

export default SubtitleBoxSkeleton
