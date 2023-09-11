import React from 'react'
import {ReactComponent as CheckIcon} from './checkIcon.svg'
import "./style.scss"
import {  motion } from 'framer-motion'
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import { get, isEqual } from 'lodash'
import '../../../../../assets/teacherApp/classDetail/close.svg'
import Button from '../../../components/Button/Button'
import { CloseCircle, LockIcon } from '../../../../../constants/icons'
import TekieContentEditorParser from '../../../../../components/Preview/Preview'
import { isBase64 } from '../../../../../utils/base64Utility'
import IframeContent from '../../../../../components/IframeContent/IframeContent'
import hs from '../../../../../utils/scale'
import Tooltip from '../../../../../components/Tooltip/Tooltip'
import useOnClickOutside from '../../../../../hooks/useOnClickOutside'
function ViewDetailsModal({title,body,visible,onClose,onSubmit,loading,showFooter,id,setLoaded=()=>{},viewModalLoading,topicStatus}) {
  const isEmbed = !isBase64(body)
  const [scrollYProgress,setScrollYProgress] = useState(0)
  const [iframeLoaded,setIframeLoaded] = useState(false)
  const isAllottedTopic = topicStatus === 'allotted' || !topicStatus
  const show = (isEmbed || isAllottedTopic) ? false : get(id, 'topicId') === viewModalLoading
  const scrollRef = useRef(null)
  const modalRef = useRef(null)

  useOnClickOutside(modalRef, () => {
    onClose()
  });

  const renderBody = () => {
  if( isAllottedTopic && !body ){
    return  <>
        <LockIcon color={'#A8A7A7'} height={hs(50)} width={hs(50)} />
        <div>To view future content please contact us.
        </div>                              
      </>
  }
  if(!body ){

    return <>
      <svg width="30" height="29" viewBox="0 0 30 29" fill="none">
                  <path d="M15 0.28125C7.15986 0.28125 0.78125 6.65986 0.78125 14.5C0.78125 22.3401 7.15986 28.7187 15 28.7187C22.8401 28.7187 29.2187 22.3401 29.2187 14.5C29.2187 6.65986 22.8401 0.28125 15 0.28125ZM22.3999 9.73467L13.2124 20.6722C13.1116 20.7922 12.9862 20.8892 12.8447 20.9565C12.7032 21.0239 12.5488 21.06 12.3921 21.0625H12.3736C12.2203 21.0624 12.0687 21.0302 11.9287 20.9677C11.7887 20.9053 11.6634 20.8142 11.5608 20.7002L7.62334 16.3252C7.52334 16.2191 7.44555 16.0942 7.39455 15.9576C7.34354 15.821 7.32034 15.6757 7.32632 15.53C7.3323 15.3844 7.36733 15.2414 7.42936 15.1095C7.49138 14.9776 7.57915 14.8594 7.68751 14.7619C7.79586 14.6644 7.92262 14.5895 8.06032 14.5417C8.19802 14.4938 8.34389 14.474 8.48936 14.4834C8.63483 14.4927 8.77696 14.5311 8.9074 14.5962C9.03784 14.6612 9.15396 14.7517 9.24892 14.8623L12.3449 18.3021L20.7251 8.32783C20.9131 8.1105 21.179 7.97588 21.4655 7.95305C21.7519 7.93023 22.0358 8.02104 22.2558 8.20585C22.4759 8.39067 22.6143 8.65465 22.6413 8.94073C22.6682 9.2268 22.5815 9.512 22.3999 9.73467V9.73467Z" fill="#D6D6D6"/>
                </svg>
                <div>You’ve already caught up with all the content!<br /> Refer to the textbook for this class.
                </div>
                {showFooter &&
                  <Button
                   isLoading={loading}
                   onBtnClick={() => onSubmit()}
                    className="classroom-details-modal__footer--complete-btn"
                    text="Mark as Complete" 
                    leftIcon>
                  <CheckIcon />
                </Button>
                }
                </>
  }
  else{
   if(isEmbed){
    return <IframeContent
         projectDescription={body} >
         </IframeContent>
   }else{
    return <TekieContentEditorParser         
            value={body}
            fitContent={true}
            id={"classroom-details-modal"}
            handleIframeLoaded={() => setIframeLoaded(true)}
            init={{ selector: `PQ-Arrange_300` }}
            setInit={(init) => setIframeLoaded(init)}          
          /> 
   }
  }}

  const handleScroll = () => {
    const scrollY = scrollRef.current.scrollTop
    const scrollHeight = scrollRef.current.scrollHeight
    const clientHeight = scrollRef.current.clientHeight    
    const scrollYProgress = scrollY / (scrollHeight - clientHeight) * 100

    setScrollYProgress(scrollYProgress)
  }
  useEffect(() => {
    if(scrollYProgress > 99) {
      localStorage.setItem('viewModal',JSON.stringify({id,progress:scrollYProgress}))
      return
    }
    
    if (scrollRef.current && iframeLoaded ) {
      // if scroll bar is not persent in the modal then set progress to 100
    if(scrollRef.current.scrollHeight === scrollRef.current.clientHeight) {
      setScrollYProgress(100)
    }
      scrollRef.current.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', handleScroll)
      }
    }
  } )
  //
  useEffect(() => {
    const sessionId = get(JSON.parse(localStorage.getItem('viewModal')),'id')
    const scrollYProgress = get(JSON.parse(localStorage.getItem('viewModal')),'progress',0)
    if(isEqual(sessionId,id)) {
      setScrollYProgress(scrollYProgress)
    }
   
  },[]) 
  useEffect(() => {
    if(scrollRef && iframeLoaded){
      setLoaded()
      const iframe = document.querySelector('#classroom-details-modal_ifr');
      const iframeBody = iframe.contentDocument.body;
      const contentWidth = iframeBody.clientWidth
      modalRef.current.style.width = 'fit-content'
      scrollRef.current.style.minWidth = `${contentWidth + 10}px`
    }
  },[scrollRef,iframeLoaded])
  return (
    <>
    {visible && (
      <div className="classroom-details-modal-container" style={{
        opacity: !show ? 1 : 0,
      }}>
        
      <motion.div 
      ref={modalRef}
      initial={{opacity:0.7}}
      animate={{opacity:1}}
      style={{
        opacity: !show ? 1 : 0,
        transition: 'opacity 0.3s ease',
        width: (!body || isAllottedTopic)&& 'fit-content',
      }}
      transition={{duration:0.2}}
       className={`classroom-details-modal ${isEmbed && 'modal-embed'}`}
       onClick={(e) => e.stopPropagation()}
        >
       
        <div className="classroom-details-modal__header">
          <div className='classroom-details-modal__header--title'>{title}</div>
        
          <div className='classroom-details-modal__header--close-btn'
           onClick={(e) => {
            e.stopPropagation()
            onClose()
           }}
           >
            <CloseCircle height='24' width='24' color='#a27fd5' />
          </div>
        </div>
         <div className="classroom-details-modal__hr-line"></div>
          <div className={`classroom-details-modal__body ${isEmbed && 'modal-embed'} ${!body && 'classroom-details-modal__body--empty'}`} ref={scrollRef}>
            {renderBody()}  
          </div>
          {(showFooter && !isAllottedTopic && body) && (
              <div className="classroom-details-modal__footer" data-disable={!isEmbed && scrollYProgress < 99} data-align={!body && 'center'}>
                {(!isEmbed && scrollYProgress < 99) ? <Tooltip
                delay={0.2}
                content={'Complete the above lesson plan to proceed'}
                tooltipClassName="classroom-complete-btn-tooltip"
                type='secondary'
                  direction="down">
                  <Button isLoading={loading} isDisabled={!isEmbed && scrollYProgress < 99}  onBtnClick={() => onSubmit()} className="classroom-details-modal__footer--complete-btn" text="Mark as Complete" leftIcon>
                      <CheckIcon />
                    </Button>
                </Tooltip> : <Button isLoading={loading} isDisabled={!isEmbed && scrollYProgress < 99}  onBtnClick={() => onSubmit()} className="classroom-details-modal__footer--complete-btn" text="Mark as Complete" leftIcon>
                      <CheckIcon />
                    </Button>   }       
              </div>
             )}

          
      </motion.div>
      
    </div>
    )}
    
    </>
  )
}

export default ViewDetailsModal