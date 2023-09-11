import React from 'react'
import getPath from '../../../../../utils/getPath'
import styles from './style.module.scss'
import CheckBox from '../../CheckBox/checkBox'
class ChatComponent extends React.Component {

  render() {
    const { title, thumbnail } = this.props
    return (
      <div className = {styles.container} onClick={(e)=>this.props.onClick(e,this.props)}>
          <div className = {styles.thumbnailArea}>
              <img src={getPath(thumbnail && thumbnail.uri)} alt='Video Thumbnail' className={styles.thumbnailImg}></img>
          </div>
          <div className = {styles.videoDescription}>
              <div className = {styles.row}>
                  <span className={`${styles.videoDescText} ${styles.title}`}>{title}</span>
              </div>
          </div>
          {this.props.currentSection === 'bookmarks' && <CheckBox onChange={this.props.handleSelection} value={this.props.clicked}/>}
      </div>
    )
  }
}


export default ChatComponent
