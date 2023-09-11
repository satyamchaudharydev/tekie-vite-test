import React from 'react'
import cx from 'classnames'
import ContentLoader from 'react-content-loader'
import styles from './Skeleton.module.scss'

const CardSkeleton = ({isMobile}) => {
    return (
        <div className={styles.cardLayout} style={{
            marginTop: `${isMobile ? '70px' : ''}`
        }}>
            <ContentLoader
                className={isMobile ? cx(styles.mbCard, styles.mbTopCard) : cx(styles.card, styles.topCard)}
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {
                    isMobile ?
                    <rect x="0" y="0"  width="1097" height="200" />
                    :
                    <rect x="0" y="0"  width="744" height="80" />
                }   
            </ContentLoader>
            <ContentLoader
                className={isMobile ? cx(styles.mbCard, styles.mbMiddleCard) : cx(styles.card, styles.middleCard)}
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {
                    isMobile ?
                    <rect x="0" y="0"  width="1097" height="300" />
                    :
                    <rect x="0" y="0"  width="744" height="110" />
                } 
            </ContentLoader>
            <ContentLoader
                className={isMobile ? cx(styles.mbCard, styles.mbLastCard) : cx(styles.card, styles.lastCard)}
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >            
                {
                    isMobile ?
                    <rect x="0" y="0"  width="1097" height="800" />
                    :
                    <rect x="0" y="0"  width="744" height="300" />
                } 
            </ContentLoader>

        </div>
    )
}

export default CardSkeleton
