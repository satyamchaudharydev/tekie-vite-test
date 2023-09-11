import React from 'react'
import Lottie from 'react-lottie'
import {fromJS} from 'immutable'
import styles from './styles.module.scss'
import badgeRevealBG from '../../../assets/badgeReveal.png'
import badgeRevealBG2X from '../../../assets/badgeReveal@2x.png'
import badgeRevealBG3X from '../../../assets/badgeReveal@3x.png'
import congratsBanner from '../../../assets/congratsBanner.png'
import congratsBanner2X from '../../../assets/congratsBanner@2x.png'
import congratsBanner3X from '../../../assets/congratsBanner@3x.png'
import BadgeItem from '../Badge/badge'
import ShareButton from '../../../components/Buttons/ShareButton'
import ConfettiBadge from '../../../assets/animations/confetti-badge.json'
import BottomUpConfetti from '../../../assets/animations/bottomUpConfetti.json'
import fetchUserBadges from "../../../queries/fetchUserBadges";
export default class BadgeModal extends React.Component {
  state = {
    animateRotatingIcon : this.props.shouldAnimate,
    showConfetti: false,
    isBadgeUnlocked: false
  }
  componentDidMount(){
    document.addEventListener('click',this.handleOutsideClick)
  }
  componentWillUnmount(){
    document.removeEventListener('click',this.handleOutsideClick)
  }
  handleOutsideClick=(e)=>{
    if(this.nodeRef.contains(e.target)){
      return;
    }
    this.props.closeModal()
  }
  confettiOneOptions = {
    loop: false,
    autoplay: true,
    animationData: ConfettiBadge,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }
  confettiTwoOptions = {
    loop: false,
    autoplay: true,
    animationData: BottomUpConfetti,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }
  /**
   * @param {React.SyntheticEvent} event
   */
  revealBadge=(event) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    this.setState({
      showConfetti: true,
      animateRotatingIcon: false,
      isBadgeUnlocked: true
    })
    fetchUserBadges()
  }
  render() {
    const {
      unlockBadge
    } = this.props
    const { animateRotatingIcon, showConfetti } = this.state
    const data = (this.props.unlockBadge && fromJS(this.props.unlockBadge)) || this.props.data
    return (
      <div className={styles.fullScreenWrapper}>
        <div className={styles.modalContainer} ref={node=>{this.nodeRef=node;}}>
          <img src={badgeRevealBG}
            srcSet={`${badgeRevealBG2X} 2x,${badgeRevealBG3X} 3x`}
            className={styles.badgeModalBG}
            alt='badge'
          ></img>
          
          <img src={congratsBanner}
            srcSet={`${congratsBanner2X} 2x,${congratsBanner3X} 3x`}
            className={styles.congratsBanner}
            alt='Congrats'
          ></img>
          <span className={styles.unlockText}>You have unlocked a new {data && data.get('type')}</span>
          {showConfetti && (
              <Lottie
                options={this.confettiOneOptions}
                style={{position:'absolute'}}
              />
            )}
          <BadgeItem data={data}
            badgeContainerStyle={styles.badgeContainer}
            thumbnailStyle={styles.thumbnailStyle}
            badgeTextHolder={styles.badgeTextHolder}
            badgeText={styles.badgeText}
            showLockedRotation = {this.state.animateRotatingIcon}
            revealBadge={this.revealBadge}
            showConfetti={showConfetti}
            isBadgeUnlocked={this.state.isBadgeUnlocked}
          />
          {showConfetti && (
              <Lottie
                options={this.confettiTwoOptions}
                style={{position:'absolute'}}
              />
            )}
          {
            animateRotatingIcon && <span className={styles.unlockText}>Tap to collect the {data && data.get('type')}</span>
          }
          {
            !animateRotatingIcon && (
              <React.Fragment>
                <span className={styles.badgeDescription}>{data && data.get('description')}</span>
                {showConfetti && <ShareButton text='Continue' onClick={this.props.handleNext || this.props.closeModal} overrideStyles={styles.nextButton}/>}
              </React.Fragment>
            )
          }
        </div>
      </div>
    )
  }
}
