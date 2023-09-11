import React, { Component } from 'react'
import cx from 'classnames'
import ContentLoader from 'react-content-loader'
import styles from './CodingAssignmentSkeleton.module.scss'

class CodingAssignmentSkeleton extends Component {
    render() {
        return <div  className={styles.cardLayout}>
            <ContentLoader
                className={cx(styles.card, styles.topCard)}
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x="0" y="0"  width="1300" height="80" />
            </ContentLoader>
            <ContentLoader
                className={cx(styles.card, styles.middleCard)}
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x="0" y="0"  width="1400" height="110" />
            </ContentLoader>
            <ContentLoader
                className={cx(styles.card, styles.lastCard)}
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x="0" y="0"  width="1400" height="400" />
            </ContentLoader>
        </div>
    }
}

export default CodingAssignmentSkeleton
