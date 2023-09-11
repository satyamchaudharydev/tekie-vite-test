import classNames from 'classnames'
import React from 'react'
import ContentLoader from 'react-content-loader'
import styles from './styles.module.scss'

const Skeleton = ({ isMobile,fullSize , bg=false }) => {
  return(
    <div className={classNames({
      [styles.cardLayout]: !isMobile,
      [styles.cardLayoutMobile]: isMobile,
    })} >
      {isMobile ? (
        <>
           <ContentLoader 
            speed={4}
            width={340}
            height={84}
            viewBox="0 0 340 84"
            backgroundColor={'#f5f5f5'}
            foregroundColor={'#dbdbdb'}
          >
            <rect x="15" y="0" rx="3" ry="3" width="67" height="11" /> 
            <rect x="91" y="0" rx="3" ry="3" width="140" height="11" /> 
            <rect x="142" y="48" rx="3" ry="3" width="53" height="11" /> 
            <rect x="202" y="48" rx="3" ry="3" width="72" height="11" /> 
            <rect x="32" y="48" rx="3" ry="3" width="100" height="11" /> 
            <rect x="15" y="71" rx="3" ry="3" width="37" height="11" /> 
            <rect x="32" y="23" rx="3" ry="3" width="140" height="11" /> 
            <rect x="181" y="23" rx="3" ry="3" width="173" height="11" />
          </ContentLoader>
          <ContentLoader
            speed={4}
            backgroundColor={'#f5f5f5'}
            foregroundColor={'#dbdbdb'}
            height="230"
            width="320"
            viewBox="0 0 320 230"
          >
            <rect x="15" y="15" rx="4" ry="4" width="350" height="25" />
            <rect x="15" y="50" rx="2" ry="2" width="350" height="150" />
            <rect x="15" y="230" rx="2" ry="2" width="170" height="20" />
            <rect x="60" y="230" rx="2" ry="2" width="170" height="20" />
          </ContentLoader>
        </>
      ): (
        <>
          <ContentLoader
              className={styles.card}
              speed={4}
              height={fullSize ? '100%' : 230}
            width="100%"
             backgroundColor={'#f5f5f5'}
              foregroundColor={'#dbdbdb'}


              viewBox={!fullSize ? "0 0 1497 617" : null}
            >
            {fullSize ? (
               <rect x="0" y="0" rx="10" ry="10" width='100%' height="100%"/>
            ) : <>
              <rect x="0" y="0" rx="10" ry="10" width="600" height="100"/>
              <rect x="0" y="130" rx="10" ry="10" width="1000" height="250" /> 
              <rect x="0" y="480" rx="10" ry="10" width="300" height="100" /> 
            </>
            
          }

            </ContentLoader>
        </>
      )}
    </div>
  )
}

export default Skeleton
