import React from 'react'
import styles from '../SessionModal.module.scss'


const Disclaimer = ({ text, type }) => {

    const getDisclaimerStyles = (type) => {
        switch (type) {
            case 'completed': {
                return styles.completed
            }
            case 'yetToBegin': {
                return styles.yetToBegin
            }
            case 'unAttended': {
                return styles.unAttended
            }
            case 'inProgress': {
                return styles.inProgress
            }
            default:
                console.log('Unhandled disclaimer type!')
        }

    }

    const getDisclaimerText = (type) => {
        switch (type) {
            case 'completed': {
                return 'Session is Complete'
            }
            case 'yetToBegin': {
                return 'Session is yet to Start'
            }
            case 'unAttended': {
                return 'This session is been canceled because it was not attended'
            }
            case 'inProgress': {
                return 'Session has started'
            }
            default:
                console.log('Unhandled disclaimer type!')
        }
    }

    const getIcon = (type) => {
        if (type === 'completed') return '../../../../../../assets/thumbs-up_1f44d.png'
        if (type === 'yetToBegin') return '../../../../../../assets/twelve-oclock_1f55b.png'
        if (type === 'unAttended') return '../../../../../../assets/cross-mark_274c.png'
        if (type === 'inProgress') return '../../../../../../assets/hourglass-done_231b.png'
    }


    return <div className={getDisclaimerStyles(type)} id='modalDesc'>

        <div style={{ height: '16px' }}>
            {type === 'completed' && <img src={require('../../../../../../../assets/thumbs-up_1f44d.png')} alt='disclaimer-icon' height={'100%'} />}
            {type === 'yetToBegin' && <img src={require('../../../../../../../assets/apple_clock.png')} alt='disclaimer-icon' height={'100%'} />}
            {type === 'unAttended' && <img src={require('../../../../../../../assets/cross-mark_274c.png')} alt='disclaimer-icon' height={'100%'} />}
            {type === 'inProgress' && <img src={require('../../../../../../../assets/apple_sand_clock.png')} alt='disclaimer-icon' height={'100%'} />}
            {/* <img src={require(getIcon(type))} alt='disclaimer-icon' height={'100%'} width={'100%'} /> */}
        </div>
        {text || getDisclaimerText(type)}


    </div>
}

export default Disclaimer