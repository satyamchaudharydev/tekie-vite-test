import React from 'react'
import styles from './style.module.scss'
import CheckBox from '../../CheckBox/checkBox'
import { getVideoDuration } from '../../../../../utils/data-utils'
import getPath from '../../../../../utils/getPath'

class VideoComponent extends React.Component {

  render() {
    const {
      videoStartTime,
      videoEndTime,
      videoThumbnail,
    } = this.props
    let title = this.props.title || 'Title goes here'
    let videoTitle = this.props.videoTitle || 'VideoTitle goes here'
    if (!title) {
      title = videoTitle
      videoTitle = undefined
    }
    const videoDuration = getVideoDuration(videoStartTime, videoEndTime)
    return (
        <div className = {styles.container} onClick={(e)=>this.props.onClick(e,this.props)}>
            <div className = {styles.thumbnailArea}>
                <img src={getPath(videoThumbnail && videoThumbnail.uri)} alt='Video Thumbnail' className={styles.thumbnailImg}></img>
                <div className={styles.timeBox}>
                    <span className={styles.timeText}>{videoDuration}</span>
                </div>
            </div>
            <div className = {styles.videoDescription}>
                <div className = {styles.row}>
                    <span className={`${styles.videoDescText} ${styles.title}`}>{title}</span>
                </div>
                <div className = {styles.row}>
                    <span className={`${styles.videoDescText} ${styles.videoTitle}`}>{videoTitle}</span>
                </div>
            </div>
            {this.props.currentSection === 'bookmarks' && <CheckBox onChange={this.props.handleSelection} value={this.props.clicked}/>}
        </div>
    )
  }
}


export default VideoComponent
