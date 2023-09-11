import ContentLoader from 'react-content-loader'
import "./eventsSkeleton.scss"
import React from "react"

const EventsSkeleton =()=>{
     return (
         <>
             <ContentLoader 
                className="card_op_1"
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {
                    
                    <rect x="0" y="0"  width="100%" height="100%" />
                }   
            </ContentLoader>
            <ContentLoader 
                
                className="card_op_2"
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {
                    
                    <rect x="0" y="0"  width="100%" height="100%" />
                }   
            </ContentLoader>
            <ContentLoader 
                
                className="card_op_3"
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {
                    
                    <rect x="0" y="0"  width="100%" height="100%" />
                }   
            </ContentLoader>
            <ContentLoader 
                
                className="card_op_3"
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

export default EventsSkeleton