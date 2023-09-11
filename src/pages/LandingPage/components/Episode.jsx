import React, { Component } from 'react'
import cx from 'classnames'
import './Episode.scss'

export default class Episode extends Component {
  state = {
    videoClassName: '',
    videoStyles: {}
  }
  componentDidMount() {
    const card = document.querySelector('#__landing_feature')
    const { offsetWidth, offsetHeight } = card

    const videoClassName = offsetWidth > offsetHeight * 1.77
      ? 'landing-page-episode-videoPlayerWidth'
      : 'landing-page-episode-videoPlayerHeight'
    const videoStyles = offsetWidth > offsetHeight * 1.77
      ? { top: (((offsetWidth / 1.7777) - offsetHeight) / 2) * -1}
      : { left: (((offsetHeight * 1.7777) - offsetWidth) / 2) * -1}
    this.setState({ videoClassName, videoStyles })
  }
  render() {
    return (
      <div>
        <div className={cx('landing-page-episode-title', 'landing-page-episode-textCenter', 'sr-200-5-600')}>{this.props.title}</div>  
        <div className={cx('landing-page-episode-card', 'sr-100-0-600')} id="__landing_feature" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ width: '100%', height: '100%' }}>
            <div className={'landing-page-episode-absoluteContainer'}>
              <video className={this.state.videoClassName} style={this.state.videoStyles} playsinline muted autoPlay loop>
                <source src={this.props.video} type="video/mp4"  />
              </video>
            </div>
            <div className={cx('landing-page-episode-card', 'landing-page-episode-body')}>
              <div>
                <div className={cx('landing-page-episode-episode', 'sr-300-10-600')}>
                  {this.props.episode}
                </div>
                <div className={cx('landing-page-episode-description', 'sr-400-15-600')} style={{ fontWeight: 300 }}>
                  {this.props.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
