import React, { Component } from 'react'
import cx from 'classnames'
import ContentLoader from 'react-content-loader'
import styles from './CodeShowcaseSkeleton.module.scss'
class CodeShowcaseSkeleton extends Component {
    render() {
        return (
          <>
            {this.props.isTagSkeleton ? (
              <>
                <ContentLoader
                  className={cx(styles.card, styles.reactionCard)}
                  speed={2}
                  backgroundColor={"#f5f5f5"}
                  foregroundColor={"#dbdbdb"}
                >
                  <rect x="0" y="0" width="100%" height="100%" />
                </ContentLoader>
                <ContentLoader
                  className={cx(styles.card, styles.reactionCard)}
                  speed={2}
                  backgroundColor={"#f5f5f5"}
                  foregroundColor={"#dbdbdb"}
                >
                  <rect x="0" y="0" width="100%" height="100%" />
                </ContentLoader>
                <ContentLoader
                  className={cx(styles.card, styles.reactionCard)}
                  speed={2}
                  backgroundColor={"#f5f5f5"}
                  foregroundColor={"#dbdbdb"}
                >
                  <rect x="0" y="0" width="100%" height="100%" />
                </ContentLoader>
              </>
            ) : (
              <div
                className={cx(styles.cardLayout)}
                style={{ padding: `${!this.props.isDetailedView && "0px"}` }}
              >
                {this.props.isDetailedView && (
                  <div className={cx(styles.codeAuthorDetails)}>
                    <ContentLoader
                      className={cx(styles.card, styles.profileCard)}
                      speed={2}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="100%" height="100%" />
                    </ContentLoader>
                    <ContentLoader
                      className={cx(styles.card, styles.profileSubCard)}
                      speed={2}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="100%" height="100%" />
                    </ContentLoader>
                    <ContentLoader
                      className={cx(styles.card, styles.SecondarySubCard)}
                      speed={2}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="100%" height="100%" />
                    </ContentLoader>
                  </div>
                )}
                <div className={cx(styles.codeDetailsContainer)}>
                  <div className={cx(styles.codeDetails)}>
                    <ContentLoader
                      className={cx(styles.card, styles.topCard)}
                      speed={2}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="100%" height="100%" />
                    </ContentLoader>
                    <ContentLoader
                      className={cx(styles.card, styles.subHeadingCard)}
                      speed={2}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="100%" height="100%" />
                    </ContentLoader>
                    {this.props.isDetailedView && (
                      <div>
                        <ContentLoader
                          className={cx(styles.card, styles.reactionCard)}
                          speed={2}
                          backgroundColor={"#f5f5f5"}
                          foregroundColor={"#dbdbdb"}
                        >
                          <rect x="0" y="0" width="100%" height="100%" />
                        </ContentLoader>
                        <ContentLoader
                          className={cx(styles.card, styles.reactionCard)}
                          speed={2}
                          backgroundColor={"#f5f5f5"}
                          foregroundColor={"#dbdbdb"}
                        >
                          <rect x="0" y="0" width="100%" height="100%" />
                        </ContentLoader>
                        <ContentLoader
                          className={cx(styles.card, styles.reactionCard)}
                          speed={2}
                          backgroundColor={"#f5f5f5"}
                          foregroundColor={"#dbdbdb"}
                        >
                          <rect x="0" y="0" width="100%" height="100%" />
                        </ContentLoader>
                      </div>
                    )}
                    <ContentLoader
                      className={cx(styles.card, styles.middleCard)}
                      speed={2}
                      style={{
                        marginTop: `${!this.props.isDetailedView && "8px"}`,
                      }}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="100%" height="100%" />
                    </ContentLoader>
                  </div>
                  {this.props.isDetailedView && (
                    <ContentLoader
                      className={cx(styles.lastCard)}
                      speed={2}
                      backgroundColor={"#002f3e"}
                      foregroundColor={"#052732"}
                    >
                      <rect x="0" y="0" width="100%" height="100%" />
                    </ContentLoader>
                  )}
                  <div className={cx(styles.reactionContainer)}>
                    <ContentLoader
                      className={cx(styles.card, styles.reactionCard)}
                      speed={2}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="1300" height="80" />
                    </ContentLoader>
                    <ContentLoader
                      className={cx(styles.card, styles.reactionCard)}
                      speed={2}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="1300" height="80" />
                    </ContentLoader>
                    <ContentLoader
                      className={cx(styles.card, styles.reactionCard)}
                      speed={2}
                      backgroundColor={"#f5f5f5"}
                      foregroundColor={"#dbdbdb"}
                    >
                      <rect x="0" y="0" width="1300" height="80" />
                    </ContentLoader>
                  </div>
                </div>
              </div>
            )}
          </>
        );
    }
}

export default CodeShowcaseSkeleton
