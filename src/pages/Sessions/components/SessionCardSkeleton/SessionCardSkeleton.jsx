import React, { Component } from 'react'
import cx from 'classnames'
import ContentLoader from 'react-content-loader'
import styles from './SessionCardSkeleton.module.scss'
import hsm from '../../../../utils/scale'

class SessionCardSkeleton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: window.innerWidth
        }
    }

    componentDidMount() {
        window.addEventListener('resize', () => {
            const { innerWidth } = window
            if (this.state.width !== innerWidth) {
                this.setState(
                    {
                        width: innerWidth
                    }
                )
            }
        })
    }

    getHs = (baseWidth) => {
        if (this.state.width < 500) {
            return baseWidth * 5
        } else if (this.state.width >= 500 && this.state.width < 600) {
            return baseWidth * 4.8
        } else if (this.state.width >= 600 && this.state.width < 800) {
            return baseWidth * 4.4
        } else if (this.state.width >= 800 && this.state.width < 1000) {
            return baseWidth * 3.5
        } else if (this.state.width >= 1000 && this.state.width < 1200) {
            return baseWidth * 3
        } else if (this.state.width >= 1200 && this.state.width < 1300) {
            return baseWidth * 2.3
        }
        return baseWidth * 2.18
    }

    getButtonPos = () => {
        if (this.state.width < 500) {
            return { X: 30, Y: 105 }
        } else if (this.state.width >= 500 && this.state.width < 600) {
            return { X: 30, Y: 93 }
        } else if (this.state.width >= 600 && this.state.width < 1000) {
            return { X: 30, Y: 90 }
        } else if (this.state.width >= 1000) {
            return { X: 30, Y: 97 }
        }
    }

    render () {
        return (
            <div className={
                !(this.props.cardNumber % 3 === 2)
                    ? styles.cardContainer
                    : styles.lastCardContainer
            }>
                <ContentLoader
                    className={cx(styles.card, this.props.seperateTopMargin ? styles.cardTopMargin : '')}
                    speed={4}
                    backgroundColor={'#225169'}
                    foregroundColor={'#dbdbdb'}
                >
                    <rect x="0" y="0" width={hsm(this.getHs(235))} height={hsm(this.getHs(25))} />
                    <rect x={hsm(30)} y={hsm(this.getHs(40))} width={hsm(this.getHs(100))} height={hsm(this.getHs(14))} />
                    <rect x={hsm(30)} y={hsm(this.getHs(65))} width={hsm(this.getHs(100))} height={hsm(this.getHs(14))} />
                    <rect x={hsm(this.getButtonPos().X)} y={hsm(this.getHs(this.getButtonPos().Y))}  rx={hsm(this.getHs(10))} width={hsm(this.getHs(55))} height={hsm(this.getHs(20))} />
                </ContentLoader>
            </div>
        )
    }
}

export default SessionCardSkeleton
