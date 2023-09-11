import React, { useState } from "react";
import { get } from 'lodash'
import { motion } from "framer-motion";
import "./NavBar.scss";
import { ReactComponent as SettingsIcon } from "./Icons/settings.svg";
import { ReactComponent as PublishedCodeIcon } from "./Icons/publishedCode.svg";
import { ReactComponent as MyCodeIcon } from "./Icons/myCode.svg";
import { ReactComponent as LogoutOutIcon } from "./Icons/logoutIcon.svg";

import cx from "classnames";
import { useHistory, withRouter } from "react-router-dom";
import getMe from "../../utils/getMe";
import { avatarsRelativePath } from "../../utils/constants/studentProfileAvatars";
import { gradeOptions } from "../../pages/TeacherApp/components/Dropdowns/fillerData";
import UpdatedButton from "../Buttons/UpdatedButton/UpdatedButton";
import { CODE_GARAGE, SELECTED_CODE_STATS_URL, SETTINGS_ACCOUNT_URL } from "../../constants/routes/routesPaths";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import LanguageIcon from "../../pages/Editor/components/LanguageIcon";
import hs, { hsFor1280 } from "../../utils/scale";
import { CodeSlashIcon } from "../UpdatedSideNavBar/icons";
import { checkIfEmbedEnabled } from "../../utils/teacherApp/checkForEmbed";



export const ProfilePicture = ({ height, width, defalutProfilePicture = false }) => {
  const me = getMe()
  const profilePictureCode = defalutProfilePicture || get(me, 'thisChild.studentProfile.profileAvatarCode')
  const profilePicture = avatarsRelativePath[profilePictureCode]
  return (
    <div className="main_navbar_profilePicture" style={{ backgroundImage: `url(${profilePicture}), linear-gradient(170deg, rgba(227,100,139,1) 0%, rgba(123,191,221,1) 96%)`, minHeight: height, minWidth: width }}>
      <div className="main_navbar_profilePicture_inset_overlay"></div>
    </div>
  )
}


export const Dropdown = ({ isVisible, containerStyle, containerClassName, ...props }) => {
  const me = getMe()
  const hasMultipleChildren = me.children.length > 1
  const history = useHistory()
  const users = props.users

  const buddyUsers = get(users,'buddyDetails',[]) ? get(users,'buddyDetails',[]) : []
  const isBuddyUser = buddyUsers.length > 0
  // if buddy the add style to the containerStyle of width "unset"
  if(isBuddyUser){
    containerStyle = {...containerStyle, width: 'unset'}
  }
  return (
    <motion.div
      className={cx("main_navbar_profileDropdown", containerClassName)}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10,
        pointerEvents: isVisible ? "all" : "none"
      }}
      transition={{
        delay: isVisible ? 0 : 0.3
      }}
      initial={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10,
        pointerEvents: isVisible ? "all" : "none"
      }}
      style={containerStyle}
    >
      {/* {hasMultipleChildren && (
        <UpdatedButton
          textClass='main_navbar_switch_account_text'
          text='Switch Account'
          type='secondary'
          widthFull
          onBtnClick={() => {
            props.history.push('/switch-account')
          }}
        ></UpdatedButton>
      )} */}
      {/* {hasMultipleChildren && (
        <div className="main_navbar__dropdown_hr"></div>
      )} */}
      { !isBuddyUser ? (
        <>
          <div className="main_navbar_dropdown_item" onClick={() => { props.history.push(SETTINGS_ACCOUNT_URL) }}>
            <div className="main_navbar_dropdown_item_icon">
              <SettingsIcon />
            </div>
            <div className="main_navbar_dropdown_text">Settings</div>
          </div>
          <div className="main_navbar_dropdown_item" onClick={() => { props.history.push(CODE_GARAGE) }}>
            <div className="main_navbar_dropdown_item_icon">
              <MyCodeIcon />
            </div>
            <div className="main_navbar_dropdown_text">Code Garage</div>
          </div>
          <div className="main_navbar_dropdown_item" onClick={() => { props.history.push(SELECTED_CODE_STATS_URL) }}>
            <div className="main_navbar_dropdown_item_icon">
              <PublishedCodeIcon />
            </div>
            <div className="main_navbar_dropdown_text">Published Code</div>
          </div>
        </>
      ) : buddyUsers.map((user, index) => {
        return (
          <div className="main_navbar_dropdown_item">
            <ProfilePicture
              width={hs(35)}
              height={hs(35)}
              defalutProfilePicture={user.studentProfile.profileAvatarCode}
            ></ProfilePicture>
            <div className="dropdown-text">
             {user.studentProfile.rollNo}
            </div>
            <div className="dropdown-text">{user.name}</div>
          </div>
        )
      })

      }
      <div className={`main_navbar_dropdown_item ${isBuddyUser ? 'profile-logout-button': null}`} onClick={() => {
        props.logout()
        history.push('/')
      }}>
        <div className="main_navbar_dropdown_item_icon">
          <LogoutOutIcon />
        </div>
        <div className="main_navbar_dropdown_text danger">Logout</div>
      </div>
    </motion.div>
  )
}

export const LearningResourcesDropdown = ({ isVisible, learningContainer, containerClassName, coursesData, ...props }) => {
  const editorsData = {
    Python : {
        logo: <LanguageIcon mode={'python'} height={20} width={20} />,
        text: 'Python Code Playground',
        link: `${window.location.origin}/code-playground?language=python` ,
    },
    JavaScript: {
        logo: <LanguageIcon mode={'markup'} height={20} width={20} />,
        text: 'Web Code Playground',
        link: `${window.location.origin}/code-playground?language=markup`,
    },
    Blockly: {
        logo: <LanguageIcon mode={'blockly'} height={20} width={20} />,
        text: 'Blockly Code Playground',
        link: `${window.location.origin}/code-playground?language=blockly`,
    },
    CodeOrg: {
        logo: <LanguageIcon mode={'CodeOrg'} height={20} width={20} />,
        text: 'Code.org',
        link: `https://studio.code.org/projects/spritelab/`,
    }
  }
  return (
    <motion.div
      className={cx("main_navbar_profileDropdown", containerClassName)}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10,
        pointerEvents: isVisible ? "all" : "none"
      }}
      transition={{
        delay: isVisible ? 0 : 0.3
      }}
      initial={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10,
        pointerEvents: isVisible ? "all" : "none"
      }}
      style={{width:hs(340)}}
    >
      {coursesData && coursesData.map(course => 
        <>
        {course !== 'Java' ? 
          <div className={cx("main_navbar_dropdown_item",)} style={{display:'flex',justifyContent:'flex-start',alignItems:'center'}} onClick={() => window.open(`${editorsData[course] && editorsData[course].link}`,'_blank')}>
              {editorsData[course] && editorsData[course].logo}
            <div className={cx("main_navbar_dropdown_text")} style={{fontWeight:'500',fontSize:hs(20),color:'#504F4F',marginLeft:'15px'}}>{editorsData[course] && editorsData[course].text}</div>
          </div>: ''}
        </>
      )}

      {(coursesData.includes('Python')) ? 
        <div className={cx("main_navbar_dropdown_item")} style={{alignItems:'center'}} onClick={() => window.open(`${window.location.origin}/cheatsheet`,'_blank')}>
            <CodeSlashIcon height={hs(24)} width={hs(24)}/>
          <div className={cx("main_navbar_dropdown_text")} style={{fontWeight:'500',fontSize:hs(20),color:'#504F4F',marginLeft:'15px'}}>Python Cheat Sheet</div>
        </div> : null
      }
    </motion.div>
  )
}

const ProfileIcon = props => {
  const [isActive, setisActive] = useState(false);
  const me = getMe()
  const dropdownRef = React.useRef()
  useOnClickOutside(dropdownRef, () => setisActive(false))


  return (
    <motion.div
      ref={dropdownRef}
      className='main_navbar_profileSectionContainer'
      onHoverStart={() => setisActive(true)}
      onClick={() => setisActive(!isActive)}
      onHoverEnd={() => setisActive(false)}
    >
      <ProfilePicture />
      <div className="main_navbar_profileSectionBody">
        <div className="main_navbar_user_name">{get(me, 'name')}</div>
        <div className="main_navbar_user_grade">{get(gradeOptions.find(grade => get(me, 'grade') === grade.value), 'label')}</div>
      </div>
      <div className="main_navbar_profileSectiondownArrow">
        <svg fill="none" viewBox="0 0 12 7" {...props}>
          <path
            d="M5.341 6.247L1.145 1.451C.649.886 1.052 0 1.804 0h8.393a.875.875 0 01.658 1.452L6.66 6.247a.875.875 0 01-1.318 0z"
            fill="#403F3F"
          />
        </svg>
      </div>
      <Dropdown {...props} isVisible={isActive} />
    </motion.div>
  )
};

export default withRouter(ProfileIcon);
