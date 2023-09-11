import ContentLoader from 'react-content-loader'
import "./EventBannerLoading.scss"
import React from "react"

const BannerSkeleton =()=>{
     return (
         <>
             <ContentLoader 
                className="banner_loader"
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {
                    
                    <rect x="0" y="0"  width="100%" height="100%" />
                }   
            </ContentLoader>
           
            
        </>
    )
}

export default BannerSkeleton