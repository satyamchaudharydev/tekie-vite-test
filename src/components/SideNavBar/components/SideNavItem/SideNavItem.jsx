import React, { Component } from 'react'
import cx from 'classnames'
import { ReactComponent as Arrow } from '../../../../assets/arrow.svg'
import { ReactComponent as CheckUnlockSVG } from '../../../../assets/checkUnlocked.svg'
import { ReactComponent as Locked } from '../../../../assets/locked.svg'
import styles from './SideNavItem.module.scss'

class SideNavItem extends Component {
  render() {
    if (this.props.type  === 'dropdownParent') {
      return (
        <>
          <div 
            className={cx(
              styles.container,
              this.props.noBorder && styles.noBorder,
              this.props.active && styles.active,
              this.props.isLocked && styles.noClick,
              !(this.props.active || this.props.isLocked) && styles.parentHover,
            )}
            onClick={this.props.onClick}
            style={
              this.props.isOpen ? {
                borderBottom: '1px solid transparent',
                transition: '0.1s all ease-in-out',
                } : {}}
            >
              <div className={this.props.hideStatusIcon && styles.settingsLeftPadding}></div>
              {
                !this.props.hideStatusIcon && (
                  <div className={styles.statusContainer}>
                    {this.props.isUnlocked && <CheckUnlockSVG />}
                    {this.props.isLocked && <Locked />}
                  </div>
                )
              }
            <div className={styles.title}>{this.props.title}</div>
            <div className={cx(styles.dropdownContainer, this.props.isOpen && styles.dropdownContainerOpen )}>
              <Arrow className={styles.dropdownArrow} />
            </div>
          </div>
          {this.props.children}
        </>
      )
    }
    if (this.props.type  === 'dropdownChild') {
      return (
        <>
          <div
            className={
              cx(
                styles.childContainer, 
                this.props.active && styles.active,
                this.props.isLocked && styles.noClick,
                !(this.props.active || this.props.isLocked) && styles.childHover,
              )}
            onClick={this.props.onClick}
          >
            <div className={this.props.hideStatusIcon && styles.statusContainerChild}></div>
            {
              !this.props.hideStatusIcon && (
                <div className={cx(styles.statusContainer, styles.statusContainerChild)}>
                  {this.props.isUnlocked && <CheckUnlockSVG />}
                  {this.props.isLocked && <Locked />}
                </div>
              )
            }
            <div className={styles.title}>{this.props.title}</div>
          </div>
        </>
      )
    }
    return (
      <div
        className={cx(
          styles.container,
          this.props.active && styles.active,
          this.props.isLocked && styles.noClick,
          !(this.props.active || this.props.isLocked) && styles.parentHover,
        )}
        onClick={this.props.onClick}
      >
        <div className={this.props.hideStatusIcon && styles.settingsLeftPadding}></div>
        {
          !this.props.hideStatusIcon &&
            (
              <div className={styles.statusContainer}>
                {this.props.isUnlocked && <CheckUnlockSVG />}
                {this.props.isLocked && <Locked />}
              </div>
            )
        }
        <div className={styles.title}>{this.props.title}</div>
      </div>
    )
  }
}

export default SideNavItem
