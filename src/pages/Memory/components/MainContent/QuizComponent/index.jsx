import React from 'react'
import classNames from 'classnames'
import getPath from '../../../../../utils/getPath'
import styles from './style.module.scss'
import CheckBox from '../../CheckBox/checkBox'
import UnfilledButton from '../../../../../components/Buttons/UnfilledButton/UnfilledButton'
class QuizComponent extends React.PureComponent {
  handleQuizReportNavigation = (e) => {
    e.stopPropagation();
    this.props.onClick(e,{...this.props, navigateToQuizReport: true})
  }
  render() {
    const {
      title,
      thumbnail,
    } = this.props
    return (
      <div className = {styles.container} onClick={(e)=>this.props.onClick(e,this.props)}>
          <div className = {styles.thumbnailArea}>
              <img src={getPath(thumbnail && thumbnail.uri)} alt='Quiz Thumbnail' className={styles.thumbnailImg}></img>
          </div>
          <div className = {styles.videoDescription}>
              <div className = {styles.row}>
                  <span className={`${styles.videoDescText} ${styles.title}`}>{title}</span>
              </div>
              <div className = {styles.row}>
                  <UnfilledButton buttonText="Take Quiz" overrideButtonContainerStyle={styles.actionButtonContainer} 
                  overrideButtonTextStyle = {styles.actionButtonText}/>
                  <div onClick={(e)=> this.handleQuizReportNavigation(e)}>
                    <UnfilledButton buttonText="View Report" overrideButtonContainerStyle={classNames(styles.actionButtonContainer,styles.leftGap)}
                      overrideButtonTextStyle = {styles.actionButtonText}
                    />
                  </div>
              </div>
          </div>
          {this.props.currentSection === 'bookmarks' && <CheckBox/>}
      </div>
    )
  }
}


export default QuizComponent
