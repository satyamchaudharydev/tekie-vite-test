import { motion } from 'framer-motion'
import React, { useState, useEffect } from 'react'
import './Footer.scss'
import cx from 'classnames'
import Next from '../../../../assets/Next'
import { Link } from 'react-router-dom'
import { get } from 'lodash'

const Footer = ({ selectTopic, totalTopic, topics, ischeatSheetTopicsFetching, selectedTopic }) => {
    const [prev, setPrev] = useState({})
    const [next, setNext] = useState({})
    useEffect(() => {
        if (topics && topics.length > 0) {
            // setting the prevTopic, if the selected topic is at 0th index then will select the topic at the last index to be used
            // for prev Topic
            if (topics.findIndex(({ isSelected }) => isSelected) === 0) {
                setPrev(topics[topics.length - 1])
            } else {
                // else selecting the prev Topic from the array
                setPrev(topics[topics.findIndex(({ isSelected }) => isSelected) - 1])
            }
        }
    }, [topics])
    useEffect(() => {
        if (topics && topics.length > 0) {
             // setting the nextTopic, if the selected topic is at last index then will select the topic at the 0th index to be used
            // for next Topic
            if (topics.findIndex(({ isSelected }) => isSelected) === topics.length - 1) {
                setNext(topics[0])
            } else {
                // else selecting the next topic from the array
                setNext(topics[topics.findIndex(({ isSelected }) => isSelected) + 1])
            }
        }
    }, [topics])
    const setTopicIndex = (type) => {
        if (type) {
            selectTopic(prev)
        } else {
            selectTopic(next)
        }
    }
    if (ischeatSheetTopicsFetching || selectedTopic === "favourites") {
        return null;
    }
    return (
        <div className={'cheatsheet-footer'}>
            {
                topics.findIndex(({ isSelected }) => isSelected) > 1 ? (
                    <Link to={`/cheatsheet/${get(prev, 'id')}`}
                        className={cx('cheatsheet-buttonContainer', 'cheatsheet-prevButton')}
                        onClick={() => setTopicIndex('prev')}
                        animate='rest'
                        initial='rest'
                    >
                        <motion.div className={cx('cheatsheet-iconCircle')}>
                            <Next />
                        </motion.div>
                        <motion.div>
                            Prev Chapter
                        </motion.div>
                    </Link>
                ) : (
                    <div className={'cheatsheet-leftButton'}></div>
                )
            }
            {
                (topics.findIndex(({ isSelected }) => isSelected) !== totalTopic - 1) ? (
                    <Link to={`/cheatsheet/${get(next, 'id')}`}
                        className={cx('cheatsheet-buttonContainer')}
                        onClick={() => setTopicIndex()}
                        animate='rest'
                        initial='rest'
                    >
                        <motion.div>
                            Next Chapter
                        </motion.div>
                        <div style={{ transform: 'scale(-1)' }}>
                            <motion.div className={cx('cheatsheet-iconCircle', 'cheatsheet-reveseIcon')}>
                                <Next />
                            </motion.div>
                        </div>
                    </Link>
                ) : (
                    <div className={'cheatsheet-rightButton'}></div>
                )
            }
        </div>
    )
}

export default Footer
