import React from 'react'
import Modal from '../../../../components/Modal/Modal'
import { CalenderSvg } from '../../../../components/svg'
import styles from './MultiSessionModal.module.scss'

const MultiSessionModal = () => {

    return <Modal headerIcon={<CalenderSvg />} heading={'8 Jan, 2022 (12 pm to 1 pm)'} priBtnText={'Close'} clickHandler={'nextScreen'}>
        <div>
            <p className={styles.displayH4}>Sessions(2)</p>
        </div>

    </Modal>
}

export default MultiSessionModal