
import ContentLoader from 'react-content-loader'
import "../../EventsSkeleton/eventsSkeleton.scss"
import styles from "../../EventsSkeleton/eventsSkeleton.scss"
import React from "react"

const TagsSkeleton = () => {
    return (
        <div className={styles.cardLayout} style={{

        }}>
            <ContentLoader
                className="tag_op_1"
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {

                    <rect x="0" y="0" width="100%" height="100%" />
                }
            </ContentLoader>
            <ContentLoader

                className="tag_op_1"
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {

                    <rect x="0" y="0" width="100%" height="100%" />
                }
            </ContentLoader>
            <ContentLoader

                className="tag_op_1"
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {

                    <rect x="0" y="0" width="100%" height="100%" />
                }
            </ContentLoader>
            <ContentLoader
                className="tag_op_1"
                speed={4}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                {

                    <rect x="0" y="0" width="100%" height="100%" />
                }
            </ContentLoader>



        </div>
    )
}

export default TagsSkeleton