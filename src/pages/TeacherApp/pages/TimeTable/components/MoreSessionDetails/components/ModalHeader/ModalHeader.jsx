import React from 'react'
import moment from 'moment'
import { CalendarSvg } from '../../../../../../../../constants/icons'
import { CloseSvg } from '../../../../../../components/svg'
import styles from './ModalHeader.module.scss'
import getThemeColor from '../../../../../../../../utils/teacherApp/getThemeColor'

export default function ModalHeader({ closeModal,MoreSessions }) {
    return (
        <div className={styles.ModalHeaderContainer}>
            <CalendarSvg color={getThemeColor()} />
            <h2 className={styles.sessionDetailHeaderText}>{moment(MoreSessions[0].start).format('ll')}{` (${moment(MoreSessions[0].event.start).format('LT')} to ${moment(MoreSessions[MoreSessions.length-1].event.end).format('LT')})`}</h2>
            <div className={styles.closeIconContainer} onClick={closeModal}>
                <CloseSvg />
            </div>
        </div >
    )
}
