import React from 'react'
import classNames from 'classnames'
import getPath from '../../../../../utils/getPath'
import styles from './style.module.scss'
import CheckBox from '../../CheckBox/checkBox'
import UnfilledButton from '../../../../../components/Buttons/UnfilledButton/UnfilledButton'

class PracticeComponent extends React.Component {
  /**
   * @param {MouseEvent} e
   */
  handlePQReportNavigation = (e) => {
    e.stopPropagation();
    this.props.onClick(e,{...this.props,navigateToPQReport: true})
  }
  render() {
    const {
      title,
      videoThumbnail
    } = this.props
    return (
      <div className = {styles.container} onClick={(e)=>this.props.onClick(e,this.props)}>
          <div className = {styles.thumbnailArea}>
              <img src={getPath(videoThumbnail && videoThumbnail.uri)} alt='Video Thumbnail' className={styles.thumbnailImg}></img>
          </div>
          <div className = {styles.videoDescription}>
              <div className = {styles.row}>
                  <span className={`${styles.videoDescText} ${styles.title}`}>{title}</span>
              </div>
              <div className = {styles.row}>
                  <UnfilledButton buttonText="Practice" overrideButtonContainerStyle={styles.actionButtonContainer}/>
                  <div onClick={(e)=> this.handlePQReportNavigation(e)}>
                    <UnfilledButton buttonText="View Report" overrideButtonContainerStyle={classNames(styles.actionButtonContainer,styles.leftGap)}/>
                  </div>
              </div>
          </div>
          {this.props.currentSection === 'bookmarks' && <CheckBox/>}
      </div>
    )
  }
}


export default PracticeComponent
