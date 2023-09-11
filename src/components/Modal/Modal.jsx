import React, { Component } from 'react'
import { get } from 'lodash'
import Select from 'react-select'
import { hs, hsm } from '../../utils/size'
import styles from './Modal.module.scss'
import { ActionButton, UnfilledButton } from '../Buttons'
import SimpleButtonLoader from "../SimpleButtonLoader";
import config from '../../config'
import cx from 'classnames'
import getTimezones from '../../utils/time-zones'
import './selectableInput.css'

const buttonTextProps = {
    hideIconContainer: true,
    buttonTextCenterAligned: true,
    hoverToCursor: true
}

const cancelButtonProps = {
    buttonText: 'Cancel',
    hoverAble: true
}


class Modal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: window.innerWidth,
            selectedTimezone: typeof localStorage === 'undefiend' ? 'Asia/Kolkata' : localStorage.getItem('timezone')
                ? {
                    value: typeof localStorage === 'undefiend' ? 'Asia/Kolkata' : localStorage.getItem('timezone'),
                    label: typeof localStorage === 'undefiend' ? 'Asia/Kolkata' : localStorage.getItem('timezone')
                }
                : {
                    value: 'Asia/Kolkata', label: 'Asia/Kolkata'
                }
        }
    }

    getResponseWidthHeight = () => {
        if (this.state.width < 300) {
            return {
                width: `${hsm(180)}px`,
                height: `${hsm(28)}px`,
                minHeight: `${hsm(20)}px`,
                top: `${hsm(3)}px`,
                borderRadius: `${hsm(4)}px`,
                fontSize: `${hsm(16)}px`,
                containerMarginLeft: `${hsm(3)}px`,
                containerMarginTop: `${hsm(10)}px`
            }
        } else if (this.state.width >= 300 && this.state.width < 350) {
            return {
                width: `${hsm(180)}px`,
                height: `${hsm(29)}px`,
                minHeight: `${hsm(18)}px`,
                top: `${hsm(5)}px`,
                borderRadius: `${hsm(4)}px`,
                fontSize: `${hsm(14)}px`,
                containerMarginLeft: `${hsm(5)}px`,
                containerMarginTop: `${hsm(10)}px`
            }
        } else if (this.state.width >= 350 && this.state.width < 400) {
            return {
                width: `${hsm(166)}px`,
                height: `${hsm(25)}px`,
                minHeight: `${hsm(18)}px`,
                top: this.state.width == 375 ? `${hsm(4)}px` : `${hsm(4)}px`,
                borderRadius: `${hsm(4)}px`,
                fontSize: `${hsm(13)}px`,
                containerMarginLeft: `${hsm(12)}px`,
                containerMarginTop: `${hsm(13)}px`
            }
        } else if (this.state.width >= 400 && this.state.width < 500) {
            return {
                width: `${hsm(167)}px`,
                height: `${hsm(25)}px`,
                minHeight: `${hsm(18)}px`,
                top: `${hsm(7)}px`,
                borderRadius: `${hsm(4)}px`,
                fontSize: `${hsm(13)}px`,
                containerMarginLeft: `${hsm(8)}px`,
                containerMarginTop: `${hsm(13)}px`
            }
        } else if (this.state.width >= 500 && this.state.width < 550) {
            return {
                width: `${hsm(147)}px`,
                height: `${hsm(23)}px`,
                minHeight: `${hsm(16)}px`,
                top: `${hsm(9)}px`,
                borderRadius: `${hsm(4)}px`,
                fontSize: `${hsm(12)}px`,
                containerMarginLeft: `${hsm(28)}px`,
                containerMarginTop: `${hsm(9)}px`
            }
        } else if (this.state.width >= 550 && this.state.width < 600) {
            return {
                width: `${hsm(138)}px`,
                height: `${hsm(20)}px`,
                minHeight: `${hsm(14)}px`,
                top: `${hsm(7.5)}px`,
                borderRadius: `${hsm(4)}px`,
                fontSize: `${hsm(11)}px`,
                containerMarginLeft: `${hsm(32)}px`,
                containerMarginTop: `${hsm(7)}px`
            }
        } else if (this.state.width >= 600 && this.state.width < 650) {
            return {
                width: `${hsm(130)}px`,
                height: `${hsm(18)}px`,
                minHeight: `${hsm(14)}px`,
                top: `${hsm(7.5)}px`,
                borderRadius: `${hsm(4)}px`,
                fontSize: `${hsm(10)}px`,
                containerMarginLeft: `${hsm(38)}px`,
                containerMarginTop: `${hsm(6)}px`
            }
        } else if (this.state.width >= 650 && this.state.width < 700) {
            return {
                width: `${hsm(122)}px`,
                height: `${hsm(16)}px`,
                minHeight: `${hsm(12)}px`,
                top: `${hsm(6.5)}px`,
                borderRadius: `${hsm(3)}px`,
                fontSize: `${hsm(9)}px`,
                containerMarginLeft: `${hsm(38)}px`,
                containerMarginTop: `${hsm(6)}px`
            }
        } else if (this.state.width >= 700 && this.state.width < 800) {
            return {
                width: `${hsm(100)}px`,
                height: `${hsm(14)}px`,
                minHeight: `${hsm(12)}px`,
                top: `${hsm(5)}px`,
                borderRadius: `${hs(12)}px`,
                fontSize: `${hsm(8)}px`,
                containerMarginLeft: `${hsm(42)}px`,
                containerMarginTop: `${hsm(6)}px`
            }
        } else  {
            return {
                width: `${hsm(88)}px`,
                height: `${hsm(13)}px`,
                minHeight: `${hsm(11)}px`,
                top: `${hsm(6.5)}px`,
                borderRadius: `${hs(10)}px`,
                fontSize: `${hsm(7)}px`,
                containerMarginLeft: `${hsm(40)}px`,
                containerMarginTop: `${hsm(5)}px`
            }
        }
    }

    getSelectColorStyles = () => {
        return {
            dropdownIndicator: styles => ({ ...styles,
                padding: `0px ${hsm(2)}px 0px 0px`,
                height: this.state.width < 300 ? '15px' : '20px',
                width: this.state.width < 300 ? '15px' : '20px',
                position: 'relative',
                top: this.state.width < 300 ? '-9px' : '-4px'
            }),
            input: styles => ({ ...styles,
                fontFamily: 'Nunito',
            }),
            indicatorSeparator: styles => ({ ...styles,
                display: 'none',
                padding: '0px'
            }),
            control: styles => ({ ...styles, backgroundColor: 'white',
                borderColor: '#00ade6',
                borderRadius: this.getResponseWidthHeight().borderRadius,
                width: this.getResponseWidthHeight().width,
                minHeight: this.getResponseWidthHeight().minHeight,
                height: this.getResponseWidthHeight().height,
                color: 'rgba(0, 0, 0, 0.6)',
                '&:hover': {
                    borderColor: '#00ade6'
                }}),
            singleValue: (provided) => ({
                ...provided,
                color: 'rgba(0, 0, 0, 0.6)',
                minHeight: this.getResponseWidthHeight().minHeight,
                position: 'relative',
                top: this.getResponseWidthHeight().top,
                fontSize: this.getResponseWidthHeight().fontSize
            }),
            valueContainer: styles => ({ ...styles,
                padding: '0px 0px 0px 2px'
            }),
            option: (styles, { isDisabled, isFocused, isSelected }) => {
                return {
                    ...styles,
                    fontSize: this.getResponseWidthHeight().fontSize,
                    position: 'relative',
                    left: this.state.width < 300 ? '-5px' : '0',
                    backgroundColor: isDisabled
                        ? null
                        : isSelected
                            ? '#ffffff'
                            : isFocused
                                ? '#e7fbfd'
                                : '#ffffff',
                    color: isDisabled
                        ? '#ccc'
                        : isSelected
                            ? 'rgba(0, 0, 0, 0.6)'
                            : 'rgba(0, 0, 0, 0.6)',
                    cursor: isDisabled ? 'not-allowed' : 'default',
                    '&:hover': {
                        backgroundColor: !isDisabled && '#e7fbfd',
                    },
                    ':active': {
                        ...styles[':active'],
                        backgroundColor: !isDisabled && (isSelected ? '#e7fbfd' : '#504f4f'),
                    },
                };
            },
        };
    }

    componentDidMount() {
        window.addEventListener('resize', () => {
          if (this.state.width !== window.innerWidth) {
              this.setState({
                  width: window.innerWidth
              })
          }
        })
    }

    render () {
        const {
            allottedMentor,
            title,
            topicOrder,
            loggedInUser,
            updateSelectedTimezone,
            topicsModal
        } = this.props
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        return (
            <div className={styles.modalContainer}>
                {
                    !topicsModal && (
                        <div className={styles.modalTitle}>
                            <div className={styles.titleText}>
                                {title}
                            </div>
                            {
                                this.state.width <= 900 && (allottedMentor && allottedMentor.length && topicOrder !== 1) && country === 'india'
                                    ? (
                                        <div className={styles.mentorName}>
                                            {`(${allottedMentor}'s availability)`}
                                        </div>
                                    ) : <div />
                            }
                            {
                                this.state.width <= 900 && country !== 'india'
                                    ? (
                                        <div className='searchableSelectInModal' style={{ 
                                            marginLeft: this.getResponseWidthHeight().containerMarginLeft,
                                            marginTop: this.getResponseWidthHeight().containerMarginTop
                                        }}>
                                            <Select
                                                options={getTimezones()}
                                                value={this.state.selectedTimezone}
                                                onChange={(value) => this.setState({selectedTimezone: value}, () => {
                                                    updateSelectedTimezone(this.state.selectedTimezone)
                                                })}
                                                isSearchable
                                                styles={this.getSelectColorStyles()}
                                            />
                                        </div>
                                    ) : <div />
                            }
                        </div>
                    )
                }
                <div className={cx(styles.modalBody, this.props.topicModalStyle)}>
                    {this.props.children}
                </div>
                {
                    !topicsModal && (
                        <div className={styles.modalFooter}>
                            <div className={styles.buttonContainer}>
                                <div
                                    onClick={this.props.onCancel}
                                >
                                    <UnfilledButton {...cancelButtonProps} />
                                </div>
                                <div onClick={this.props.onSave} className={styles.bookButton}>
                                    <div>{this.props.actionButtonTitle}</div>
                                    <SimpleButtonLoader
                                        showLoader={this.props.showLoader}
                                        rightPositioned
                                    />
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}

export default Modal
