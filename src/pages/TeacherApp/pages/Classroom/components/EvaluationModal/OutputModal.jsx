import React, { useEffect, useRef } from 'react'
import '../../../../../Editor/editor.scss';
import { CopyOutlineIcon, LeftArrow } from '../../../../../../constants/icons'
import { get } from 'lodash'
import { useEvaluationContext } from './contexts/EvaluationContext'
import styles from './EvaluationModal.module.scss'
import { useState } from 'react'
import cx from 'classnames'
import Output from '../../../../../Editor/Output'
import isMobile from '../../../../../../utils/isMobile'
import is32BitArch from '../../../../../../utils/is32BitArch'
import './aceEditorStyles.scss'
import hs, { hsFor1280 } from '../../../../../../utils/scale'
import { blocklyWorkspaceConfig } from '../../../../../../components/QuestionTypes/Mcq/Mcq'
import useOnClickOutside from '../../../../../../hooks/useOnClickOutside';
import PyodideInterpreter from '../../../../../Editor/PyodideInterpreter';
import BlocklyPreview from '../../../../../Editor/components/BlocklyPreview';

const isWASMSupported = (isMobile = false) => {
  if (is32BitArch()) return false
  try {
    if (
      typeof WebAssembly === "object" &&
      typeof WebAssembly.instantiate === "function"
    ) {
      if ((typeof SharedArrayBuffer === 'undefined') && !isMobile) return false
      const module = new WebAssembly.Module(
        Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      if (module instanceof WebAssembly.Module)
        return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
    }
  } catch (e) {
    return false;
  }
};

const editorStyle = {
  boxSizing: 'border-box',
  borderRadius: '12px',
  padding: '0 10px 10px 10px',
  width: '100%',
  height: '100%',
  overflowX: 'auto',
  overflowY: 'auto',
}

const OutputModal = ({ setIsOutputModalOpen, openedFromRun, openedFromStudentPerformance, blocklyPythonCorrectCode, blocklyPythonStudentCode }) => {
  const [isCompareOutputActive, setIsCompareOutputActive] = useState(openedFromRun)
  const [correctAnswerLoading, setcorrectAnswerLoading] = useState(false)
  const [studentAnswerLoading, setStudentAnswerLoading] = useState(false)

  const correctAnswerRef = useRef()
  const studentAnswerRef = useRef()
  const closeOutputModalRef = useRef()

  const outputRef = useRef()
  const correctOutputRef = useRef();

  useOnClickOutside(closeOutputModalRef, () => closeOutputModal())

  const { state: { currentQuesNos, questions, presentStudents, currentStudentNos } } = useEvaluationContext()

  let answerSnippet = null
  let correctAnswerCodeSnippet = null
  let editorMode = null
  if (openedFromStudentPerformance) {
    answerSnippet = get(questions[currentQuesNos], 'userAnswerCodeSnippet')
    correctAnswerCodeSnippet = get(questions[currentQuesNos], 'assignmentQuestion.answerCodeSnippet', '')
    editorMode = get(questions[currentQuesNos], 'assignmentQuestion.editorMode', '')
  } else {
    answerSnippet = get(presentStudents[currentStudentNos], 'question.userAnswerCodeSnippet', '')
    correctAnswerCodeSnippet = get(presentStudents[currentStudentNos], 'question.assignmentQuestion.answerCodeSnippet', '')
    editorMode = get(presentStudents[currentStudentNos], 'question.assignmentQuestion.editorMode', '')
  }

  useEffect(() => {
    if (isCompareOutputActive) {
      setStudentAnswerLoading(false);
      setcorrectAnswerLoading(false);
    }
  }, [isCompareOutputActive])

  const clearInterpretor = () => {
    outputRef.current.clear()
  }

  const clearInterpretorCorrect = () => {
    correctOutputRef.current.clear()
  }

  const getString = string => {
    try {
      if (!string) return ''
      return decodeURIComponent(
        string
      )
    } catch (e) {
      try {
        return decodeURIComponent(string.replace('%', '~~~~percent~~~~')).replace('~~~~percent~~~~', '%')
      } catch (e) {
        return string
      }
    }
  }

  const renderCorrectCodeOuput = () => {
    if (editorMode === 'python' || editorMode === 'blockly') {
      return (
        <div id='correctCodeOutput' className={`${styles.aceEditorContainer} ${styles.blackBg}`} style={{ background: 'rgb(5, 39, 50)', }}>
          {(isMobile() || is32BitArch() || isWASMSupported()) && (
            <PyodideInterpreter
              key={5678}
              id={5678}
              clearInterpretor={clearInterpretorCorrect}
              pythonCode={getString(editorMode === 'blockly' ? blocklyPythonCorrectCode : correctAnswerCodeSnippet) || ""}
              outputRef={correctOutputRef.current}
              clearLoading={() => {
                setcorrectAnswerLoading(false);
              }}
              ref={correctAnswerRef}
              timeout={0}
              fromEvaluation
            />
          )}
          <Output
            ref={correctOutputRef}
            clearInterpreter={clearInterpretorCorrect}
            isWASMSupported={isMobile() || isWASMSupported()}
            id={5678}
            fromEvaluation
            loading={correctAnswerLoading}
          />
        </div>
      )
    } else if (editorMode === 'markup') {
      return (
        <iframe
          srcDoc={decodeURIComponent(correctAnswerCodeSnippet)}
          className={styles.previewWebEditor}
          title="Preview Editor"
        />
      )
    }
  }

  const renderStudentCodeOuput = () => {
    if (editorMode === 'python' || editorMode === 'blockly') {
      return (
        <div id='studentCodeOutput' className={`${styles.aceEditorContainer} ${styles.blackBg}`} style={{ background: 'rgb(5, 39, 50)' }}>
          {(isMobile() || is32BitArch() || isWASMSupported()) && (
            <PyodideInterpreter
              key={1234}
              id={1234}
              clearInterpretor={clearInterpretor}
              pythonCode={getString(editorMode === 'blockly' ? blocklyPythonStudentCode : answerSnippet) || ""}
              outputRef={outputRef.current}
              clearLoading={() => {
                setStudentAnswerLoading(false);
              }}
              ref={studentAnswerRef}
              timeout={200}
              fromEvaluation
            />
          )}
          <Output
            ref={outputRef}
            clearInterpreter={clearInterpretor}
            isWASMSupported={isMobile() || isWASMSupported()}
            id={1234}
            fromEvaluation
            loading={studentAnswerLoading}
          />
        </div>
      )
    } else if (editorMode === 'markup') {
      return (
        <iframe
          srcDoc={decodeURIComponent(answerSnippet)}
          className={styles.previewWebEditor}
          title="Preview Editor"
        />
      )
    }
  }

  const renderCorrectCodeQuestion = () => (
    <>
      {editorMode === 'blockly' ? (
        <div className={styles.aceEditorContainer}>
          <BlocklyPreview
            code={correctAnswerCodeSnippet}
            workspaceConfiguration={{ ...blocklyWorkspaceConfig, grid: { spacing: 30, length: 3 } }}
          />
        </div>
      ) : (
        <div className={`${styles.aceEditorContainer} ${styles.correctAnswerOutput}`}>
          {/* <AceEditor
            mode="python"
            theme="clouds"
            name="editor"
            readOnly={true}
            value={correctAnswerCodeSnippet ? decodeURIComponent(correctAnswerCodeSnippet) : ''}
            className={`${styles.aceEditor} correctAnswerOutput noselection`}
            editorProps={{ $blockScrolling: true }}
          /> */}
        </div>
      )}
    </>
  )

  const renderStudentCodeQuestion = () => (
    <>
      {editorMode === 'blockly' ? (
        <div className={styles.aceEditorContainer}>
          <BlocklyPreview
            code={answerSnippet}
            workspaceConfiguration={{ ...blocklyWorkspaceConfig, grid: { spacing: 30, length: 3 } }}
          />
        </div>
      ) : (
        <div className={`${styles.aceEditorContainer} ${styles.blackBg}`}>
          <div>

          </div>
        </div>
      )}
    </>
  )

  const closeOutputModal = () => {
    setIsOutputModalOpen(false)
    setIsCompareOutputActive(null)
  }

  const onCopyCodeButtonClick = async (answerSnippet) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(decodeURIComponent(answerSnippet));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = decodeURIComponent(answerSnippet);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
  }

  return (
    <div className={styles.outputModalContainerBackdrop}>
      <div className={styles.outputModalContainer} ref={closeOutputModalRef}>
        <div className={styles.verticalLine}></div>
        <div className={styles.backToQuestionContainer} onClick={() => closeOutputModal()}>
          <LeftArrow color={"#333333"} height={hsFor1280(14)} width={hsFor1280(14)} />
          <p>Back to question</p>
        </div>
        {editorMode !== 'java' && <div className={styles.outputModalHeadContainer}>
          <div className={styles.compareButtonContainer}>
            <div
              className={cx(styles.compareButtonContainerStyles, !isCompareOutputActive ? styles.primaryButtonStyle : styles.secButtonStyle)}
              onClick={() => {
                setIsCompareOutputActive(false)
              }}
            >{editorMode === 'blockly' ? 'Compare Blocks' : 'Compare Code'}</div>
            <div
              className={cx(styles.compareButtonContainerStyles, isCompareOutputActive ? styles.primaryButtonStyle : styles.secButtonStyle)}
              onClick={() => {
                setIsCompareOutputActive(true)
              }}
            >Compare Output</div>
          </div>
        </div>}
        <div className={styles.outputsContainer}>
          <div className={styles.correctOutput} style={{ marginTop: hs(24) }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
              <h4>{isCompareOutputActive ? "Correct Output" : "Correct Code"} </h4>
              {editorMode === 'java' && <div style={{ display: 'flex', flexDirection: 'row', marginBottom: hs(24), cursor: 'pointer' }} onClick={() => onCopyCodeButtonClick(correctAnswerCodeSnippet)} >
                <CopyOutlineIcon height='16' width='16' />
                <p className={styles.copyText}>Copy Code</p>
              </div>}
            </div>
            {isCompareOutputActive ? renderCorrectCodeOuput() : renderCorrectCodeQuestion()}
          </div>
          <div className={styles.studentOutput} style={{ marginTop: hs(24) }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
              <h4>{isCompareOutputActive ? "Student Output" : "Student Code"}</h4>
              {editorMode === 'java' && <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: hs(24), cursor: 'pointer' }} onClick={() => onCopyCodeButtonClick(answerSnippet)}>
                <CopyOutlineIcon height='16' width='16' />
                <p className={styles.copyText}>Copy Code</p>
              </div>}
            </div>
            {isCompareOutputActive ? renderStudentCodeOuput() : renderStudentCodeQuestion()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutputModal