import React, { Component } from 'react'
import styles from './PastHomework.module.scss'
import HomeworkCard from '../HomeworkCard'
import { get } from 'lodash'
import { pastHomeworkMessage } from '../../../../constants/homework/messages'
import SessionCardSkeleton from '../../../Sessions/components/SessionCardSkeleton'
import Collapsible from '../Collapsible'
import ContentLoader from 'react-content-loader'

import './PastHomework.scss'
import isMobile from '../../../../utils/isMobile'
class PastHomework extends Component {
    getHomeworkBasedOnStatus = (pendingHomeworks = [], filterType = 'pending') => {
        if (pendingHomeworks) {
            return pendingHomeworks.map(el => ({
                ...el,
                topics: el.topics.filter(subEl => {
                    if ((get(subEl, 'isQuizSubmitted') || (get(subEl, 'isAssignmentSubmitted') || get(subEl, 'isPracticeSubmitted'))) && get(subEl, 'isSubmittedForReview')) {
                        return (filterType === 'pending') ? false : true
                    }
                    return (filterType === 'pending') ? true : false
                })
            })).filter(el => (el.topics && el.topics.length))
        }
        return []
    }
    renderChapterWiseHomework = (chapterWiseHomework = []) => {
        const pendingHomeworks = chapterWiseHomework.map(el => ({
            id: el[0].chapterId,
            chapterTitle: el[0].chapterTitle,
            chapterOrder: el[0].chapterOrder,
            topics: el
        }))
        return (
            <>
                {!this.shouldDisplayPastHomeworkMessage() ? (
                    <div className='pastHomework-mainContainer'>
                        <Collapsible
                            startNavigationLoading={this.props.startNavigationLoading}
                            stopNavigationLoading={this.props.stopNavigationLoading}
                            hideHeader={true}
                            handleSolve={(topicId) => this.props.handleSolve(topicId)}
                            getTopicQuestionsMeta={(topicId) => this.props.getTopicQuestionsMeta(topicId)}
                            getHomeworkComponents={(topicId) => this.props.getHomeworkComponents(topicId)}
                            pendingHomeworks={this.getHomeworkBasedOnStatus(pendingHomeworks)}
                            completedHomeworks={this.getHomeworkBasedOnStatus(pendingHomeworks, 'completed')}
                            getFirstOrLatestQuizReports={this.props.getFirstOrLatestQuizReports}
                            currentHomework={this.props.currentHomework}
                            allSessions={this.props.allSessions}
                            changeTab={(t) => { this.props.changeTab(t) }} //

                            currentHomeworkProps={this.props.currentHomeworkProps}
                            fromTeacherApp={get(this.props, 'fromTeacherApp', 'false')}
                        />
                    </div>
                ) : (
                    <div className='noPastHomeworkMsgContainer'>
                        {pastHomeworkMessage}
                    </div>
                )}
            </>
        )
    }

    shouldDisplayPastHomeworkMessage = () => {
        const { chapterWisePastHomework } = this.props
        if (isMobile() || (chapterWisePastHomework && Object.keys(chapterWisePastHomework).length > 0)) {
            return false
        }
        return true
    }

    render() {
        const { chapterWisePastHomework, newFlow } = this.props
        if (newFlow) {
            if (isMobile()) {
                return (
                    <div className={`pastHomeworkContainer ${get(this.props, 'fromTeacherApp', 'false') && 'pastHomeworkContainer-teacherApp'}`}>
                        {
                            this.props.isLoading
                                ? (
                                    <div style={{padding:"10px", height:"100vh"}} >
                                        <ContentLoader
                                            className='ch-loader-card'
                                            speed={5}
                                            interval={0.1}
                                            backgroundColor={'#ffffff'}
                                            foregroundColor={'#cce7e9'}
                                        >
                                            <rect className='ch-loader-1-m' />
                                            <rect className='ch-loader-2-m' />
                                            <rect className='ch-loader-3-m' />
                                            <rect className='ch-loader-4-m' />
                                            <rect className='ch-loader-5-m' />
                                            <rect className='ch-loader-6-m' />
                                            <rect className='ch-loader-7-m' />
                                            <rect className='ch-loader-8-m' />
                                        </ContentLoader>
                                    </div>
                                ) :
                                <div />
                        }
                        {
                            !this.props.isLoading && this.renderChapterWiseHomework(Object.values(chapterWisePastHomework))
                        }
                    </div>
                )
            }
            else {
                return (
                    <div className={`pastHomeworkContainer ${get(this.props, 'fromTeacherApp', 'false') && 'pastHomeworkContainer-teacherApp'}`}>
                        {
                            this.props.isLoading
                                ? (
                                    <div className='homeworkCardsContainer'>
                                        {/* {
                                            [...Array(3)].map((_,index) => (
                                                <SessionCardSkeleton
                                                    cardNumber={index}
                                                />
                                            ))
                                        } */}
                                    </div>
                                ) :
                                <div />
                        }
                        {
                            !this.props.isLoading && chapterWisePastHomework
                                ? this.renderChapterWiseHomework(Object.values(chapterWisePastHomework))
                                : <div />
                        }
                    </div>
                )
            }
        }
        return (
            <div className={styles.pastHomeworkContainer}>
                <div className={styles.title}>
                    Past Homework
                </div>
                {
                    this.props.isLoading
                        ? (
                            <div className={styles.homeworkCardsContainer}>
                                {
                                    [...Array(3)].map((_, index) => (
                                        <SessionCardSkeleton
                                            cardNumber={index}
                                        />
                                    ))
                                }
                            </div>
                        ) :
                        <div />
                }
                {
                    !this.props.isLoading && chapterWisePastHomework
                        ? this.renderChapterWiseHomework(Object.values(chapterWisePastHomework))
                        : <div />
                }
            </div>
        )
    }
}

export default PastHomework
