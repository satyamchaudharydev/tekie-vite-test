import React from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import {
    ContactUs, Monitor, Outlined, StudentSvg, CalendarSvg, CourseSvg,
    Reports, Settings, TrainingDashboardIcon, BookOutlineIcon, ArrowIconUpdated, PaperIcon
} from '../../../constants/icons'
import '../SplitScreen.scss'
import cx from 'classnames'
import getThemeColor from '../../../utils/teacherApp/getThemeColor'
import { fireGtmEvent } from '../../../utils/analytics/gtmActions'
import { gtmEvents } from '../../../utils/analytics/gtmEvents'
import getMe from '../../../utils/getMe'
import { getUserParams } from '../../../utils/getUserParams'

const triggerGTMEvent = (props) => {
    const me = getMe()
    const userParams = getUserParams()
    if(props.to === '/teacher/classrooms'){
        fireGtmEvent(gtmEvents.classroomCtaClicked,{userParams})
    }else{
        fireGtmEvent(gtmEvents.reportsCtaClicked,{userParams})
    }
}

const Item = ({ onNavClick = () => {}, ...props }) => {
    return !props.isLink ?
        <div className={cx('navitem-link', props.isActive ? `navitem-link-active` : '')} onClick={onNavClick}>{props.children}</div> :
        <Link onClick={() => triggerGTMEvent(props)} to={props.to} className={cx('navitem-link', props.isActive ? `navitem-link-active` : '')}>{props.children}</Link>
}


const renderItem = ({ title, isActive, iconType, route, icon, style, toggleMobileSidebarOpened, comingSoon, componentToDisplay: Component, newestLaunch, noLink = false,props, isLink = true, onNavClick = () => {} }) => noLink ? (
    <div>Inactive</div>
) : (
    <Item
        isActive={isActive}
        to={route}
        originalProps={props}
        isLink={isLink}
        onNavClick={onNavClick}
    >
        {
            <div 
                className='navitem-link-image' 
                // style={{ marginRight: '12px', position: 'relative', top: '2px', fontFamily: 'Inter' }}
            >
                <Component color={isActive?getThemeColor():'#333333'} />
            </div>
        }
        <span 
            className='navitem-link-title'
            // style={{ fontSize: '15px' }}
        >
            {title}
        </span>
        {!isLink ? <ArrowIconUpdated className={`navitem-parent-link ${isActive && 'navitem-parent-link-active'}`} /> : ''}
        {newestLaunch && (
            <Item.NewTag>
                New
            </Item.NewTag>
        )}
    </Item>
)

const NavItem = ({ title, isActive, iconType, route, icon, style, toggleMobileSidebarOpened, comingSoon, newestLaunch, noLink,props, isLink, onNavClick = () => {}}) => {
    let componentToDisplay = null
    switch (iconType) {
        case 'dashboard':
            componentToDisplay = Outlined
            break
        case 'classroom':
            componentToDisplay = Monitor
            break
        case 'student':
            componentToDisplay = StudentSvg
            break
        case 'timeTable':
            componentToDisplay = CalendarSvg
            break
        case 'course':
            componentToDisplay = CourseSvg
            break
        case 'reports':
            componentToDisplay = Reports
            break
        case 'settings':
            componentToDisplay = Settings
            break
        case 'contact':
            componentToDisplay = ContactUs
            break
        case 'trainingClassrooms':
            componentToDisplay = TrainingDashboardIcon
            break
        case 'notebookIcon':
            componentToDisplay = BookOutlineIcon
            break
        case 'questionPaper':
            componentToDisplay = PaperIcon
            break
        default:
            componentToDisplay = null
            break
    }
    if (comingSoon) {
        return (
            <div className=''>
                ToolTip component
            </div>
        )
    }
    return renderItem({ title, isActive, iconType, route, icon, style, toggleMobileSidebarOpened, comingSoon, componentToDisplay, newestLaunch, noLink,props, isLink, onNavClick })
}

export default withRouter(NavItem)
