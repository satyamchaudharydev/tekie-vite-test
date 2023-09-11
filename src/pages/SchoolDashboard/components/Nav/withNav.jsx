import React from 'react'
import SideNav from './SideNav'
import Header from './Header'
import './withNav.scss'

const withNav = WrappedComponent =>
  ({ title }) => props => {
    const [isMobileSidebarOpened, setIsMobileSidebarOpened] = React.useState(false)
    return (
      <div>
        <Header position='relative' />
        <div className='screen'>
          <SideNav
            activeNav={title}
          />
          <div className='sideWrapper'>
            <div className='main'>
              <div className='hambugerMenu' onClick={() => {
                setIsMobileSidebarOpened(!isMobileSidebarOpened)
              }}
              >
                <div /> <div /> <div />
              </div>
              <WrappedComponent
                {...props}
                // headerHeight={dimensions.headerHeight}
                // sideNavWidth={dimensions.updatedSideNavWidth}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

export default withNav
