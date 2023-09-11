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
          <rect x="20" y="20" rx="5" ry="5" width="150" height="40"/>
          <rect x="220" y="20" rx="5" ry="5" width="150" height="40"/>
          <rect x="-50" y="100" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="150" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="150" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="200" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="250" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="300" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="350" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="400" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="450" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="500" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="550" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="600" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="650" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="700" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="750" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="800" rx="5" ry="5" width="400" height="20"/>
          <rect x="-50" y="850" rx="5" ry="5" width="400" height="20"/>

        </ContentLoader>
    </div>
  )
}

export default SubtitleBoxSkeleton
