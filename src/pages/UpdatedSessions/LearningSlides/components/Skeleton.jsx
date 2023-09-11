import classNames from 'classnames'
import React from 'react'
import ContentLoader from 'react-content-loader'

const Skeleton = ({ isMobile }) => {
  return(
    <div className={classNames(isMobile && 'learningSlide-loaderCardLayout', !isMobile && 'learningSlide-loaderCardLayoutMobile')} >
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
        </>
      ): (
        <>
          <ContentLoader
              className={'learningSlide-loaderCard'}
              speed={4}
              backgroundColor={'#f5f5f5'}
              foregroundColor={'#dbdbdb'}
              viewBox="0 0 1097 617"
            >
              <rect x="0" y="0" rx="1" ry="1" width="100%" height="100%"/>
            </ContentLoader>
        </>
      )}
    </div>
  )
}

export default Skeleton
