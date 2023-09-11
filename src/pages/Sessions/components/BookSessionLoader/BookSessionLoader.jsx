import React, { Component } from 'react'
import ContentLoader from 'react-content-loader'
import styles from './BookSessionLoader.module.scss'
import hsm from '../../../../utils/scale'

class BookSessionLoader extends Component {
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
                this.setState({
                    width: innerWidth
                })
            }
        })
    }

    getHs = (baseWidth) => {
        if (this.state.width < 600) {
            return baseWidth * 1.5
        } else if (this.state.width >= 600 && this.state.width < 700) {
            return baseWidth * 1.3
        } else if (this.state.width >= 700 && this.state.width < 800) {
            return baseWidth * 1.22
        } else if (this.state.width >= 800 && this.state.width < 900) {
            return baseWidth * 1.08
        }
        return baseWidth * 0.98
    }

    getVs = (baseHeight) => {
        if (this.state.width < 550) {
            return baseHeight * 2.2
        } else if (this.state.width >= 550 && this.state.width < 600) {
            return baseHeight * 1.9
        } else if (this.state.width >= 600 && this.state.width < 700) {
            return baseHeight * 1.5
        } else if (this.state.width >= 700 && this.state.width < 900) {
            return baseHeight * 1.25
        }
        return baseHeight * 1
    }

    getButtonPos = () => {
        if (this.state.width < 500 || (this.state.width >= 600 && this.state.width < 700)) {
            return {X: 360, Y: 300}
        } else if (this.state.width >= 500 && this.state.width < 600) {
            return {X: 320, Y: 300}
        } else if (this.state.width >= 700 && this.state.width < 800) {
            return {X: 550, Y: 300}
        }else if (this.state.width >= 800 && this.state.width < 900) {
            return {X: 550, Y: 266}
        } else if (this.state.width >= 900 && this.state.width < 1000) {
            return {X: 650, Y: 260}
        } else if (this.state.width >= 1000 && this.state.width < 1200) {
            return {X: 750, Y: 250}
        } else if (this.state.width >= 1200 && this.state.width < 1300) {
            return {X: 675, Y: 240}
        }

        return {X: 700, Y: 250}
    }

    getY = () => {
        if (this.state.width < 800) {
            return {title: 60, dateTime: 180}
        } else if (this.state.width >= 800 && this.state.width < 1000) {
            return {title: 50, dateTime: 150}
        }

        return {title: 50, dateTime: 150}
    }

    getButtonDimensions = () => {
        if (this.state.width < 1100) {
            return {width: 320, height: 94}
        } else if (this.state.width >= 1100 && this.state.width < 1200) {
            return {width: 280, height: 80}
        } else if (this.state.width >=1200 && this.state.width < 1300) {
            return {width: 245, height: 72}
        }

        return {width: 200, height: 65}
    }

    render () {
        return (
            <ContentLoader
                className={styles.card}
                speed={4}
                backgroundColor={'#ffffff'}
                foregroundColor={'#0a3145'}
            >
                <rect x={hsm(this.getHs(40))} y={hsm(this.getVs(this.getY().title))} width={hsm(this.getHs(490))} height={this.getHs(25)} />
                <rect x={hsm(this.getHs(40))} y={hsm(this.getVs(this.getY().dateTime))} width={hsm(this.getHs(340))} height={hsm(this.getHs(60))} />
                <rect
                    x={hsm(this.getVs(this.getButtonPos().X))} y={hsm(this.getVs(this.getButtonPos().Y))} rx={hsm(this.state.width < 1200 ? this.getHs(45) : this.getHs(35))}
                    width={hsm(this.getButtonDimensions().width)}
                    height={hsm(this.getHs(this.getButtonDimensions().height))}
                />
            </ContentLoader>
        )
    }
}

export default BookSessionLoader
