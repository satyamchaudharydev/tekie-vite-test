import React from 'react'
import cx from 'classnames'
import styles from './WindowTopBar.module.scss'

// system icons stack
import min10 from './assets/system_icons/min-k-10.png'
import min12 from './assets/system_icons/min-k-12.png'
import min15 from './assets/system_icons/min-k-15.png'
import min20 from './assets/system_icons/min-k-20.png'
import min24 from './assets/system_icons/min-k-24.png'
import min30 from './assets/system_icons/min-k-30.png'
import max10 from './assets/system_icons/max-k-10.png'
import max12 from './assets/system_icons/max-k-12.png'
import max15 from './assets/system_icons/max-k-15.png'
import max20 from './assets/system_icons/max-k-20.png'
import max24 from './assets/system_icons/max-k-24.png'
import max30 from './assets/system_icons/max-k-30.png'
import close10 from './assets/system_icons/close-k-10.png'
import close12 from './assets/system_icons/close-k-12.png'
import close15 from './assets/system_icons/close-k-15.png'
import close20 from './assets/system_icons/close-k-20.png'
import close24 from './assets/system_icons/close-k-24.png'
import close30 from './assets/system_icons/close-k-30.png'
import restore10 from './assets/system_icons/restore-k-10.png'
import restore12 from './assets/system_icons/restore-k-12.png'
import restore15 from './assets/system_icons/restore-k-15.png'
import restore20 from './assets/system_icons/restore-k-20.png'
import restore24 from './assets/system_icons/restore-k-24.png'
import restore30 from './assets/system_icons/restore-k-30.png'
class WindowTopBar extends React.Component {
  state = {
    canGoBack: false,
    canGoForward: false,
    maximize: true,
  }
  componentDidMount() {
    window.native.onNavigation(data => {
      this.setState({
        canGoBack: data.canGoBack,
        canGoForward: data.canGoForward,
      })
    })
    window.native.onWindowChange(console.log)
  }
  render() {
    return (
      <>
        <div className={styles.container}>
          <div className={styles.toolbarActions}>
            <div
              className={styles.arrowLeft} 
              style={{
                opacity: this.state.canGoBack ? 1 : 0.3,
              }}
              draggable="false"
              onClick={() => {
                window.native.goBack()
              }}></div>
            <div
              className={styles.arrowRight}
              style={{
                opacity: this.state.canGoForward ? 1 : 0.3,
              }}
              draggable="false"
              onClick={() => {
              window.native.goForward()
            }}></div>
            <div 
              draggable="false"
              className={styles.reload}
              onClick={() => {
                window.native.reload()
              }}
            ></div>
          </div>
          <div className={cx(styles.toolbarActions, styles.systemButtons)}>
            <div 
              className={cx(styles.systemAction, styles.minimize)}
              onClick={() => {
                window.native.minimize()
              }}
            >
              <img 
                className={styles.icon} 
                srcset={`${min10} 1x, ${min12} 1.25x, ${min15} 1.5x, ${min15} 1.75x, ${min20} 2x, ${min20} 2.25x, ${min24} 2.5x, ${min30} 3x, ${min30} 3.5x`}
                draggable="false"
                alt="window minmize"
              />
            </div>
            {this.state.maximize ? (
              <div
                className={cx(styles.systemAction, styles.restore)}
                onClick={() => {
                  window.native.restore()
                }}
              >
                <img
                  className={styles.icon}
                  srcset={`${restore10} 1x, ${restore12} 1.25x, ${restore15} 1.5x, ${restore15} 1.75x, ${restore20} 2x, ${restore20} 2.25x, ${restore24} 2.5x, ${restore30} 3x, ${restore30} 3.5x`}
                  draggable="false"
                  alt="window restore"
                />
              </div>
            ) : (
              <div 
                className={cx(styles.systemAction, styles.maximize)}
                onClick={() => {
                  window.native.maximize()
                }}
              >
                <img
                  className={styles.icon}
                  srcset={`${max10} 1x, ${max12} 1.25x, ${max15} 1.5x, ${max15} 1.75x, ${max20} 2x, ${max20} 2.25x, ${max24} 2.5x, ${max30} 3x, ${max30} 3.5x`}
                  draggable="false"
                  alt="window maximize"
                />
              </div>
            )}
            <div
              className={cx(styles.systemAction, styles.close)}
              onClick={() => {
                window.native.close()
              }}
            >
              <img
                className={styles.icon}
                srcset={`${close10} 1x, ${close12} 1.25x, ${close15} 1.5x, ${close15} 1.75x, ${close20} 2x, ${close20} 2.25x, ${close24} 2.5x, ${close30} 3x, ${close30} 3.5x`}
                draggable="false"
                alt="window close"
              />
            </div>
          </div>
        </div>
        <div className={styles.emptySpace}>
        </div>
      </>
    )
  }
}

export default WindowTopBar;