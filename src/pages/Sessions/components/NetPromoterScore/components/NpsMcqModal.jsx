import { get } from 'lodash'
import React from 'react'
import styles from './NpsMcqModal.module.scss'

const extraInfo = 'It was outstanding experience to me use tekie. Compared to all others, you guys rock in teaching'

const NpsMcq = ({ goodNpsScoreMcq, avgNpsScoreMcq, setGoodNpsScoreMcq, setAvgNpsScoreMcq, rating, isMobile = false, setNpsStep }) => {

    return (
        <div className={isMobile ? styles.mbMcqContainer : styles.mcqContainer}>
            {
                rating > 8 ?
                    (
                        goodNpsScoreMcq.map((option, index) => {
                            return (
                                <div key={index}
                                    className={option.isSelected ?
                                        (isMobile ? styles.mbSelectedMcqOption : styles.selectedMcqOption) :
                                        styles.mcqOption}
                                    onClick={() => {
                                        if (!option.isSelected) {
                                            setGoodNpsScoreMcq(goodNpsScoreMcq.map(option => {
                                                if (option.optionNumber === index + 1) {
                                                    option.isSelected = true
                                                    return option
                                                }
                                                else {
                                                    return option
                                                }
                                            }))
                                        } else {
                                            setGoodNpsScoreMcq(goodNpsScoreMcq.map(option => {
                                                if (option.optionNumber === index + 1) {
                                                    option.isSelected = false
                                                    return option
                                                }
                                                else {
                                                    return option
                                                }
                                            }))
                                        }
                                    }}><p className={styles.mcqText}>{option.mcqOptionName}</p></div>
                            )
                        })
                    ) :
                    (
                        avgNpsScoreMcq.map((option, index) => {
                            return (
                                <div key={index}
                                    className={option.isSelected ? (isMobile ? styles.mbSelectedMcqOption : styles.selectedMcqOption) : styles.mcqOption}
                                    onClick={() => {

                                        if (!option.isSelected) {
                                            setAvgNpsScoreMcq(avgNpsScoreMcq.map(option => {
                                                if (option.optionNumber === index + 1) {
                                                    option.isSelected = true
                                                    return option
                                                }
                                                else {
                                                    return option
                                                }
                                            }))
                                        } else {
                                            setAvgNpsScoreMcq(avgNpsScoreMcq.map(option => {
                                                if (option.optionNumber === index + 1) {
                                                    option.isSelected = false
                                                    return option
                                                }
                                                else {
                                                    return option
                                                }
                                            }))
                                        }
                                    }}><p className={styles.mcqText}>{option.mcqOptionName}</p></div>
                            )
                        })
                    )
            }
        </div>
    )
}

export default NpsMcq
