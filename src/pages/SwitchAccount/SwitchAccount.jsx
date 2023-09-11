import React, { Component } from 'react'
import cx from 'classnames'
import withScale from '../../utils/withScale'
import withNoScrollBar from '../../components/withNoScrollBar'
import { motion } from 'framer-motion'
import duck from '../../duck'
import { DesktopOnly, MobileOnly } from '../../components/MediaQuery'
import classNames from './SwitchAccount.module.scss'
import backIcon from './arrow-back.svg'
import { restoreDashPattern } from 'pdf-lib'
import isMobile from '../../utils/isMobile'
import redirectByUserType from '../../utils/redirectByUserType'
import TekieLoader from '../../components/Loading/TekieLoader'
import { get } from 'lodash'

const avatars = [
  require('../../assets/avatarsSVG/coolDrop.svg'),
  require('../../assets/avatarsSVG/oldDrop.svg'),
  require('../../assets/avatarsSVG/capDrop.svg'),
  require('../../assets/avatarsSVG/normalDrop.svg'),
]

const variants = {
  profile: {
    rest: {
      boxShadow: '0px 6px 10px 0px rgba(0,173,230,0.49)',
    },
    hover: {
      boxShadow: '0px 10px 15px 0px rgba(0,173,230,0.6)',
    }
  },
  avatar: {
    rest: {
      y: 9
    },
    hover: {
      y: 10
    }
  }
}

class SwitchAccount extends Component {
  // constructor(props) {
  //   super(props)
  //   this.state = {
  //     isLoading: false
  //   }
  // }
  componentDidMount = async () => {
    // this.setState({
    //   isLoading: true
    // })
    // const { loggedInUser, userId } = this.props
    // await redirectByUserType(loggedInUser && loggedInUser.toJS(), userId)
    // this.setState({ isLoading: false })
  }
  setUser = (userChild) => async () => {
    const { userChildren } = this.props
    const parent = this.props.userParent.toJS()
    const user = {
      ...userChild.toJS(),
      parent: parent,
      email: parent.email,
      createdAt: parent.createdAt
    }
    const shouldRedirect = await redirectByUserType(user, get(userChild.toJS(), 'id'))
    if (!shouldRedirect) {
      this.props.dispatch({ type: 'LOGOUT' })

      duck.merge(() => ({ user, userChildren: userChildren.toJS(), userParent: parent }), {
        key: 'loggedinUser'
      })
      if (
        this.props.location &&
        this.props.location.state &&
        this.props.location.state.redirectURL
      ) {
        this.props.history.push(this.props.location.state.redirectURL)
      } else {
        this.props.history.push('/sessions')
      }
    }
  }

  render() {
    const { styles, userChildren } = this.props
    // if (this.state.isLoading) return <TekieLoader />
    return (
      <div style={styles.container}>
        <DesktopOnly className={classNames.desktopContainer}>
          <div style={styles.leftBranding}></div>
        </DesktopOnly>
        <div className={classNames.body}>
          <div className={cx(classNames.whoLearning, this.props.userId ? classNames.backArrowVisible : classNames.backArrowNotVisible)}>
            {this.props.userId && <img src={backIcon} alt='back' className={classNames.backIcon} onClick={() => this.props.history.push('/sessions')} />}
            Who's Learning?
          </div>
          <div className={classNames.profilesContainer}>
            {userChildren.map((userChild, i) => (
              <motion.div className={classNames.profileContainer} whileHover="hover" onClick={this.setUser(userChild)}>
                <motion.div className={classNames.profile} style={{
                  ...(this.props.userId === userChild.get('id') ? styles.selectedProfile : {})
                }} variants={variants.profile}>
                  <motion.div
                    className={classNames.profileAvatar}
                    style={{
                      backgroundImage: `url(${avatars[i % 4]})`
                    }}
                    variants={variants.avatar}
                  >
                  </motion.div>
                  {isMobile() && (
                    <div className={classNames.accountName}>{userChild.get('name')}</div>
                  )}
                </motion.div>
                {!isMobile() && (
                  <div className={classNames.accountName}>{userChild.get('name')}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}


const desktopOnlyStyles = {
  selectedProfile: {
    borderWidth: 2,
    borderColor: 'rgb(83, 203, 233)',
    borderStyle: 'solid'
  },
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row'
  },
  leftBranding: {
    width: 576,
    height: '100vh',
    backgroundImage: `url(${require('../../assets/SwitchAccountSideNav.png')})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center'
  }
}

const mobileOnlyStyles = {
  selectedProfile: {
    background: 'rgba(0, 173, 230, 0.3)',
    borderRadius: '16px',
  },
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'row'
  },
}

const styles = isMobile() ? mobileOnlyStyles : desktopOnlyStyles

export default withNoScrollBar(withScale(SwitchAccount, styles))