import React, { Component } from 'react'
import { get } from 'lodash'
import { motion } from 'framer-motion'
import { withRouter } from 'react-router-dom'
import SimpleButtonLoader from '../../../../components/SimpleButtonLoader'
import { updateStudentProfile } from '../../../../queries/updateUserDetails'
import { filterKey } from '../../../../utils/data-utils'
import { connect } from 'react-redux'
import CloseIcon from '../../../../assets/Close.jsx'
import './AvatarModal.scss'
import { studentProfileAvatars } from '../../../../utils/constants/studentProfileAvatars'


class AvatarModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      avatarSelected: null
    }
  }
  componentDidMount(prevProps) {
    if (get(prevProps, 'visible', false) && !this.props.visible) {
      this.setState({
        loading: false,
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.visible && !this.props.visible) {
      this.setState({
        loading: false,
      })
    }
    if (prevProps.studentProfile !== this.props.studentProfile) {
      this.setState({
        avatarSelected: get(this.props, 'studentProfile.profileAvatarCode', 'theo')
      })
    }
  }

  saveSelectedAvatar = () => {
    const { avatarSelected } = this.state
    const { studentProfile } = this.props
    if (avatarSelected && studentProfile && studentProfile.id) {
      this.setState({
        loading: true,
      }, async () => {
        await updateStudentProfile({ profileAvatarCode: avatarSelected }, studentProfile.id)
        this.setState({
          loading: false
        })
        this.props.closeAvatarModal()
      })
    }
  }

  render() {
    return (
      <div className={'avatar-page-container'} onClick={() => {
        this.props.closeAvatarModal()
      }}>
        <div className={'avatar-page-popup'} onClick={(e) => { e.stopPropagation() }}>
          <img src={require('../../../../assets/avartarWave.svg')} style={{ zIndex: '1', position: 'absolute', width: '100%', bottom: 0 }} alt='Wave' />
          <div className={'avatar-page-close'} onClick={() => {
            this.props.closeAvatarModal()
          }}>
            <div className={'avatar-page-closeIcon'}>
              <CloseIcon />
            </div>
          </div>
          <div className={'avatar-page-text'}>
            Choose Your Avatar
          </div>
          <div className={'avatar-page-img-container'}>
            {studentProfileAvatars.map((avatar, index) => (
              <motion.div
                whileTap={{
                  scale: 0.95
                }}
                className={`avartar-page-img ${this.state.avatarSelected === avatar ? 'active' : ''}`}
                onClick={() => {
                  this.setState({
                    avatarSelected: avatar
                  })
                }}
                style={{ background: `url('${require(`../../../../assets/${avatar}.png`)}` }}
              ></motion.div>
            ))}
          </div>
          <motion.div
            whileTap={{
              scale: 0.95
            }}
            className={'avatar-page-saveButton'}
            onClick={() => {
              this.saveSelectedAvatar()
            }}
          >
            {this.state.loading && (
              <div className={'avatar-page-loadingIconContainer'}>
                <SimpleButtonLoader
                  showLoader
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, transparent, transparent)'
                  }}
                  customClassName={'avatar-page-loadingIcon'}
                />
              </div>
            )}
            <span>Save Avatar</span>
          </motion.div>
        </div>
      </div>
    )
  }
}

export default connect((state) => ({
  isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
}))(withRouter(AvatarModal))
