import React, { Component } from 'react'
import { sortBy } from 'lodash'
import ResumeLearning from './components/ResumeLearning'
import fetchHomePage from '../../queries/fetchHomePage'
import chatThumbnail from '../../assets/chat.png'
import pqThumbnail from '../../assets/pq.png'
import quizImage from '../../assets/quiz.png'
import { getDataById } from '../../utils/data-utils'
import sort from '../../utils/immutable/sort'
import getPath from '../../utils/getPath'
import Topics from './components/Topics'

import styles from './HomePage.module.scss'

const getResumeLearningThumbnail = (componentType, videoThumbnail) => {
  const images = {
    quiz: quizImage,
    video: videoThumbnail,
    message: chatThumbnail,
    practiceQuestion: pqThumbnail
  }
  return images[componentType]
}

class HomePage extends Component {
  componentDidMount() {
    fetchHomePage().call()
  }

  nestTopicsInChapter = (topics, chapters) => {
    const nestedTopicsInChapter = chapters.map(chapter => ({
      ...chapter,
      topics: sortBy(chapter.topics.map(topic =>
        getDataById(topics, topic.id)
      ), 'order')
    }))
    return nestedTopicsInChapter
  }

  render() {
    const nestedTopicsInChapter = this.nestTopicsInChapter(
      sort.ascend(this.props.topic, ['order']).toJS(),
      sort.ascend(this.props.chapter, ['order']).toJS()
    )
    return (
      <>
        <div className={styles.container}>
          <ResumeLearning
            {...this.props}
            thumbnail={getResumeLearningThumbnail(
              this.props.currentTopicComponent,
              getPath(
                this.props.currentTopicComponentDetail.getIn([
                  'thumbnail',
                  'uri'
                ])
              )
            )}
          />
          <div className={styles.chapterContainer}>
            {nestedTopicsInChapter
              .filter(chapter => chapter.id)
              .map((chapter, i) => (
                <Topics
                  {...chapter}
                  key={chapter.id}
                  firstTopic={i === 0}
                />
            ))}
          </div>
        </div>
      </>
    )
  }
}

export default HomePage
