import React from 'react'
import { get } from 'lodash'
import SyntaxHighlighter from 'react-syntax-highlighter'
// import ImageZoom from 'react-medium-image-zoom'
// import 'react-medium-image-zoom/dist/styles.css'
import FibBlock from '../../../../../components/QuestionTypes/FibBlock'
import Arrange from '../../../../../components/QuestionTypes/Arrange'
import FibInput from '../../../../../components/QuestionTypes/FibInput'
import Mcq from '../../../../../components/QuestionTypes/Mcq'
import isMobile from '../../../../../utils/isMobile'
import { ImageLoadingSVG } from '../../../../../assets/learningSlides/svg'
import './gridStyles.scss'
import getPath from '../../../../../utils/getPath'
import { isBase64 } from '../../../../../utils/base64Utility'
import GridVideo from './GridVideo'
import { gridLayoutType, learningSlideType, slideContentType } from '../../../../../utils/constants/learningSlideConstants'
import hs from '../../../../../utils/scale'
import CodeView from '../CodeView/CodeView'
import { motion } from 'framer-motion'
import TekieContentEditorParser from '../../../../../components/Preview/Preview'
import parseMetaTags from '../../../../../utils/parseMetaTags'

const MCQ = 'mcq'
const FIBBLOCK = 'fibBlock'
const FIBINPUT = 'fibInput'
const ARRANGE = 'arrange'


const terminalStyles = {
  fontFamily: 'Monaco',
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontStyle: 'normal',
  letterSpacing: 'normal',
  whiteSpace: 'pre-wrap',
  padding: hs(20),
  margin: '0'
}


const getBlockHeight = (layoutType) => {
  if (layoutType === gridLayoutType.nRowSpan) return hs(307)
  else return hs(638)
}

const checkOverview = (value = '', gridId) => {
  if (value) {
    const isBase64Str = isBase64(value)
    if (isBase64Str) {
      // return ReactHtmlParser(decodeBase64(value))
      return <TekieContentEditorParser
              id={`CA-learningSlide${gridId}`}
              value={value}
              init={{ selector: `CA-learningSlide${gridId}` }}
              legacyParser={(statement) => {
                  return parseMetaTags({ statement })
              }}
          />
    } else {
      return value
    }
  }
}

const getGridClass = (layoutType, rowsLength) => {
  if (layoutType === gridLayoutType.gridTwoByTwo) return 'twoByTwoGrid'
  if (layoutType === gridLayoutType.gridTwoByTwoMergeLeft) return 'twoGridMergeLeft'
  if (layoutType !== gridLayoutType.gridOneByOne && layoutType !== gridLayoutType.nRowSpan) return 'twoGrid'
  if (layoutType === gridLayoutType.nRowSpan) return 'nRowSpan'
  else return ''
}

const getGridContent = (gridPlacement, slideContents = []) => {
  const foundSlide = slideContents.find(slide => get(slide, 'gridPlacement') === gridPlacement)
  if (foundSlide) return foundSlide
  return null
}

const Grid = (props) => {
  const getVariants = () => {
    return {
      initial: {
        x: props.direction?'20%':'-20%'
      },
      animate: {
        x: 0,
        transition: {
          duration: 0.3,
          ease: [0.43, 0.13, 0.23, 0.9]
        }
      }
    }
  
  }
  const getContainerInnerDivs = (gridType, gridContentType, height) => {
    if (get(gridContentType, 'type') === slideContentType.text) {
      return <div className='grid-container-textarea-box' style={{ height: height || '100%', paddingLeft: hs(10), paddingRight: hs(10) }}>{checkOverview(get(gridContentType, 'statement'), get(gridContentType,'id'))}</div>
    }
    if (get(gridContentType, 'type') === slideContentType.image) {
      return (
        <>
          {
            get(gridContentType, 'media.id') ? (
              <div className='grid-container-image' style={{ backgroundImage: `url(${getPath(get(gridContentType, 'media.uri'))})`, height: height || hs(400) }}/>
              // <div className='grid-container-image'>
              //   <ImageZoom>
              //     <div className='grid-container-image' style={{ backgroundImage: `url(${getPath(get(gridContentType, 'media.uri'))})`, height: height || '100%' }}/>
              //   </ImageZoom>
              // </div>
            ) : (<ImageLoadingSVG />)
          }
        </>
      )
    }

    if (get(gridContentType, 'type') === slideContentType.video) {
      return (
        <>
          <GridVideo videoId={`jwPlayer-${get(gridContentType, 'gridPlacement')}`} contents={gridContentType} height={height} />
        </>
      )
    }
    if (get(gridContentType, 'type') === slideContentType.iFrame && get(gridContentType, 'url')) {
      return <div style={{ height: height || '100%' }}>
        <iframe className='learningSlide-iframe-content' src={get(gridContentType, 'url')} title='learningSlide-iframe' />
      </div>
    }
    if (get(gridContentType, 'type') === slideContentType.codeSyntax && get(gridContentType, 'codeInput')) {
      return (
        <div style={{ height: height || '100%' }} className='grid-container-codeSyntax-box'>
          <SyntaxHighlighter
            language={get(gridContentType, 'codeInput') ? 'python' : 'text'} // Through props
            customStyle={{...terminalStyles, backgroundColor:'transparent'}}
            className={(gridType === 'grid2X1' || gridType === 'grid2X2') ? 'grid-container-grid2x-codeSyntax' :
              gridType === 'grid2X2' ? 'grid-container-grid1X1-codeSyntax' : 'grid-container-grid1x-codeSyntax'}
          >
            {get(gridContentType, 'codeInput')}
          </SyntaxHighlighter>
        </div>
      )
    }
    if (get(gridContentType, 'type') === slideContentType.code) {
      return (
        <CodeView
          layout={get(gridContentType, 'codeEditorConfig.layout')}
          editorMode={get(gridContentType, 'codeEditorConfig.editorMode')}
          executionAccess={get(gridContentType, 'codeEditorConfig.executionAccess')}
          codeInput={get(gridContentType, 'codeInput')}
          codeOutput={get(gridContentType, 'codeOutput')}
          codeId={get(gridContentType, 'id')}
          marginBottom={gridType === 'nRowspan'}
        />
      )
    }
  }

  const getQuestionsContainer = (gridQuestions) => {
    const keyId = get(gridQuestions[0], 'id')
    const solutionToggle = () => props.solutionToggle()
    const questionProps = {
      activeQuestionIndex: 0,
      question: gridQuestions[0],
      updateAnswers: props.updateAnswers,
      answers: props.answers,
      isSeeAnswers: props.isSeeAnswers,
      onCheckButtonClick: props.onCheckButtonClick,
      answerType: props.answerType
    }
    if (get(gridQuestions[0], 'questionType') === FIBBLOCK) {
      return <>{solutionToggle()}<FibBlock key={keyId} {...questionProps} withUpdatedDesign isMobile={isMobile()} /></>
    }
    else if (get(gridQuestions[0], 'questionType') === ARRANGE) {
      return <>{solutionToggle()}<Arrange key={keyId} {...questionProps} withUpdatedDesign isMobile={isMobile()} isLearningSlide={true} /></>
    }
    else if (get(gridQuestions[0], 'questionType') === FIBINPUT) {
      return <>{solutionToggle()}<FibInput key={keyId} {...questionProps} withUpdatedDesign isMobile={isMobile()} /></>
    }
    else if (get(gridQuestions[0], 'questionType') === MCQ) {
      return <>{solutionToggle()}<Mcq key={keyId} {...questionProps} withUpdatedDesign isMobile={isMobile()} /></>
    }
    else {
      return <></>
    }
  }
 
  return (
    <>
      {
        get(props, 'type') === learningSlideType.grid ? (
          <motion.div className='learningSlide-grid-main-container' initial={"initial"} animate={"animate"} variants={getVariants()}>
            <div className={`learningSlide-grid-container ${getGridClass(get(props, 'gridType'))}`}>
              {get(props, 'gridType') === gridLayoutType.gridOneByOne && <div>{getContainerInnerDivs(get(props, 'gridType'), get(props, 'gridContentType[0]'), getBlockHeight(gridLayoutType.gridOneByOne))}</div>}
              {
                get(props, 'gridType') === gridLayoutType.gridTwoByTwo && (
                  <>
                    <div className='grid-container-col'>
                      {getContainerInnerDivs(get(props, 'gridType'), getGridContent('00', get(props, 'gridContentType', [])), getBlockHeight(gridLayoutType.gridTwoByTwo))}
                      {getContainerInnerDivs(get(props, 'gridType'), getGridContent('01', get(props, 'gridContentType', [])), getBlockHeight(gridLayoutType.gridTwoByTwo))}
                    </div>
                    <div className='grid-container-col'>
                      {getContainerInnerDivs(get(props, 'gridType'), getGridContent('10', get(props, 'gridContentType', [])), getBlockHeight(gridLayoutType.gridTwoByTwo))}
                      {getContainerInnerDivs(get(props, 'gridType'), getGridContent('11', get(props, 'gridContentType', [])), getBlockHeight(gridLayoutType.gridTwoByTwo))}
                    </div>
                  </>
                )
              }
              {
                get(props, 'gridType') === gridLayoutType.gridOneByTwo && (
                  <>
                    <div>{getContainerInnerDivs(get(props, 'gridType'), getGridContent('00', props.gridContentType), getBlockHeight(gridLayoutType.gridOneByTwo))}</div>
                    <div>{getContainerInnerDivs(get(props, 'gridType'), getGridContent('01', props.gridContentType), getBlockHeight(gridLayoutType.gridOneByTwo))}</div>
                  </>
                )
              }
              {
                get(props, 'gridType') === gridLayoutType.nRowSpan && (
                  get(props, 'gridContentType') && get(props, 'gridContentType', []).length > 0
                  && get(props, 'gridContentType').map((row, idx) => {
                    return (
                      getContainerInnerDivs(get(props, 'gridType'), getGridContent(`${idx}0`, get(props, 'gridContentType', [])), getBlockHeight(gridLayoutType.nRowSpan))
                    )
                  })
                )
              }
              {
                get(props, 'gridType') === gridLayoutType.gridTwoByTwoMergeLeft && (
                  <>
                    <div style={{ height: getBlockHeight(gridLayoutType.gridTwoByTwoMergeLeft) }}>
                      {getContainerInnerDivs(get(props, 'gridType'), getGridContent('00', get(props, 'gridContentType', [])))}
                    </div>
                    <div className='grid-container-col-merge-left' style={{ height: getBlockHeight(gridLayoutType.gridTwoByTwoMergeLeft) }}>
                      {getContainerInnerDivs(get(props, 'gridType'), getGridContent('01', get(props, 'gridContentType', [])))}
                      {getContainerInnerDivs(get(props, 'gridType'), getGridContent('10', get(props, 'gridContentType', [])))}
                    </div>
                  </>
                )
              }
            </div>
          </motion.div>
        ) : (
          <>
            {
              get(props, 'gridQuestions') && get(props, 'gridQuestions', []).length > 0 &&
              (
                <motion.div className='grid-question-container' initial={"initial"} animate={"animate"} variants={getVariants()}>
                  {
                    getQuestionsContainer(get(props, 'gridQuestions'))
                  }
                </motion.div>
              )
            }
          </>
        )
      }

    </>
  )
}

export default Grid