import React from 'react'
import './ContentArea.scss'
import cx from 'classnames'
import ContentLoader from 'react-content-loader'

const ContentsSkeleton = () => {
    return (
        <div>
            <ContentLoader
                className={cx('cheatsheet-loadingText', 'cheatsheet-contentTitle')}
                speed={2}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
            <div className={'cheatsheet-contentContainer'}>
                <div>
                    <ContentLoader
                    className={cx('cheatsheet-loadingText')}
                    speed={2}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                    >
                    <rect x='0' y='0' width='100%' height='100%' />
                    </ContentLoader>
                    <ContentLoader
                    className={cx('cheatsheet-image')}
                    style={{
                        boxShadow: '0 3px 6px 0 rgba(0, 0, 0, 0.16)',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}
                    speed={2}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                    >
                    <rect x='0' y='0' width='100%' height='100%' />
                    </ContentLoader>
                    <ContentLoader
                        className={cx('cheatsheet-terminalInputContainer', 'cheatsheet-terminalInputContainerLoader')}
                        speed={2}
                        backgroundColor={'#f5f5f5'}
                        foregroundColor={'#dbdbdb'}
                    >
                        <rect x='0' y='0' width='100%' height='100%' />
                    </ContentLoader>
                </div>
                <div>
                    <ContentLoader
                        className={cx('cheatsheet-terminalInputContainer', 'cheatsheet-terminalInputContainerLoader')}
                        speed={2}
                        backgroundColor={'#f5f5f5'}
                        foregroundColor={'#dbdbdb'}
                    >
                        <rect x='0' y='0' width='100%' height='100%' />
                    </ContentLoader>
                    <ContentLoader
                        style={{ marginTop: '20px' }}
                        className={cx('cheatsheet-terminalInputContainerLeft', 'cheatsheet-terminalInputContainer', 'cheatsheet-terminalInputContainerLoader')}
                        speed={2}
                        backgroundColor={'#225169'}
                        foregroundColor={'#dbdbdb'}
                    >
                        <rect x='0' y='0' width='100%' height='100%' />
                    </ContentLoader>
                </div>
            </div>
        </div>
    )
}

export default ContentsSkeleton
