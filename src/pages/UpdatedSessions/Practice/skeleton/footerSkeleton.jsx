import React from 'react'
import ContentLoader from 'react-content-loader'
import styles from './styles.module.scss'

const FooterBtnSkeleton=()=>{


    return(
        <div className={styles.footer}>
          <ContentLoader
              className={styles.card}
              speed={4}  
              backgroundColor={'#f5f5f5'}
              foregroundColor={'#dbdbdb'}
              viewBox="0 0 600 20"
            >
             <rect x="0" y="0" rx="2" ry="2" width="1108" height="17" /> 
            </ContentLoader>
        </div>
      )
}
export default FooterBtnSkeleton