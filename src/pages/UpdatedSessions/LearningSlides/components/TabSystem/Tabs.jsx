import { get } from 'lodash'
import React, { useState, useEffect } from 'react'

import { BackSVG, NextSVG } from '../../../../../assets/learningSlides/svg'
import './tabSystemStyles.scss'

const Tabs = (props) => {
  const [disableClick, setDisableClick] = useState(false)

  const getClassForTab = (status) => {
    return status === 'active' ? 'tab-grid-type-active': status === 'complete' ? 'tab-grid-type-completed' : 'tab-grid-type'
  }

  const getClassForPracticeQuestion = (status) => {
    return status === 'active' ? 'tab-pq-type-active':
      status === 'complete' ? 'tab-pq-type-correct' :
      'tab-pq-type'
  }

  useEffect(() => {
    if (!props.loading) {
      setDisableClick(false)
    }
  }, [props.loading])
  return (
    <div className='tabs-container'>
      <div
        className={`tabs-back-icon ${get(props, 'currentLearningSlide', 0) === 0 && 'arrow-disabled'}`}
        onClick={() => {
          if (props.currentLearningSlide > 0 && !disableClick) {
            setDisableClick(true)
            props.handleLearningSlideChange(props.currentLearningSlide - 1, 'back')
          }
        }}
      >
        <BackSVG />
      </div>
      <div className='tabs-content'>
        {
          props.tabArr.map((tab, idx) => {
            if (get(tab, 'learningSlide.type') === 'grid') {
                return (
                  <div 
                    className={idx === props.currentLearningSlide ? getClassForTab('active') : getClassForTab(tab.status)}
                    key={tab.learningSlide.id}
                    onClick={() => {
                      if (tab.status === 'complete' && !disableClick) {
                        setDisableClick(true)
                        props.handleLearningSlideChange(idx, null)
                      }
                    }}
                  >
                    {idx === props.currentLearningSlide ? (<div className='tab-grid-type-active-inner'></div>) : (<></>)}
                  </div>
                )
            }
            if (get(tab, 'learningSlide.type') === 'practiceQuestion') {
              return (
                <div className={idx === props.currentLearningSlide ? getClassForPracticeQuestion('active') : getClassForPracticeQuestion(tab.status)} 
                  key={tab.learningSlide.id}
                  onClick={() => {
                    if ((tab.status === 'complete') && !disableClick) {
                      setDisableClick(true)
                      props.handleLearningSlideChange(idx, null)
                    }
                  }}
                >
                  {idx === props.currentLearningSlide ? (<div className='tab-pq-type-inner'>?</div>) : '?'}
                </div>
              )
            }
            return null;
          })
        }
      </div>
      <div 
        className={`tabs-next-icon ${get(props, 'currentLearningSlide', 0) === (get(props, 'tabArr', []).length - 1) && 'arrow-disabled'}`}
        onClick={() => {
          const currentTab = props.tabArr[props.currentLearningSlide]
          if (get(currentTab, 'learningSlide.type') === 'practiceQuestion') {
            if (props.isCheckButtonActive) {
              if (currentTab.status === 'complete') {
                props.handleAnswerCheck()
              } else {
                props.handleAnswerCheck()
              } 
            }
          } else {
            if (currentTab.status === 'complete') {
              if ((props.currentLearningSlide < props.tabArr.length - 1) && !disableClick) { // Put anser status change here!!!!
                setDisableClick(true)
                props.handleLearningSlideChange(props.currentLearningSlide + 1, 'next')
              }
            } else {
              props.updateLearningSlideList()
            }
          }
        }}
      >
        <NextSVG />
      </div>
    </div>
  )
}

export default Tabs