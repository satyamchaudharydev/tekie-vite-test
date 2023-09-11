import React from "react";
import { get } from "lodash";
import '../../../../../Editor/editor.scss';
import Badge from "../../../../../../components/Badges";
import { useEvaluationContext } from "./contexts/EvaluationContext";
import styles from './EvaluationModal.module.scss'
import './aceEditorStyles.scss'
import { Expand } from "../../../../../../constants/icons";
import TekieCEParser from "../../../../../../components/Preview/Preview";
import IframeContent from "../../../../../../components/IframeContent/IframeContent";
import { BlocklyWorkspace } from "tekie-blockly";
import { decodeBase64, isBase64 } from "../../../../../../utils/base64Utility";
import { blocklyWorkspaceConfig } from "../../../../../../components/QuestionTypes/Mcq/Mcq";
import parseMetaTags from "../../../../../../utils/parseMetaTags";
import Blockly from 'blockly'
import 'blockly/python';
import { evaluationTypes } from "../../../../utils";

const CorrectAnswer = ({ setIsOutputModalOpen, setOpenedFromRun, openedFromStudentPerformance, setBlocklyPythonCorrectCode }) => {
  const { state: { questions, currentQuesNos, practices, evaluationType, currentPracticeNos, presentStudents, currentStudentNos } } = useEvaluationContext()

  const renderCorrectCodingAssignment = () => {
    let answerCodeSnippet = null
    let editorMode = null
    if (openedFromStudentPerformance) {
      answerCodeSnippet = get(questions[currentQuesNos], 'assignmentQuestion.answerCodeSnippet', '')
      editorMode = get(questions[currentQuesNos], 'assignmentQuestion.editorMode', '')
    } else {
      answerCodeSnippet = get(presentStudents[currentStudentNos], 'question.assignmentQuestion.answerCodeSnippet', '')
      editorMode = get(presentStudents[currentStudentNos], 'question.assignmentQuestion.editorMode', '')
    }

    return (
      <>
        {editorMode === 'blockly' ? null : <div
          onClick={() => {
            setIsOutputModalOpen(true)
            setOpenedFromRun(false)
          }}
          className={styles.maximizeIconContainer}
        >
          <Expand />
        </div>}
        <div className={styles.aceEditorContainer}>
          {editorMode === 'blockly' ? (
            <BlocklyWorkspace
              workspaceConfiguration={{ ...blocklyWorkspaceConfig, grid: { spacing: 30, length: 3 } }}
              initialXml={
                isBase64(answerCodeSnippet) ? decodeBase64(answerCodeSnippet) : answerCodeSnippet
              }
              onWorkspaceChange={(workspace) => {
                Blockly.Python.INFINITE_LOOP_TRAP = null;
                setBlocklyPythonCorrectCode(Blockly.Python.workspaceToCode(workspace))
              }}
            />
          ) : (
            <div></div>
          )}
        </div>
      </>
    )
  }

  const renderCorrectAnswerBasedOnFormat = () => {
    let currentPractice = null
    if (openedFromStudentPerformance) {
      currentPractice = practices[currentPracticeNos]
    } else {
      currentPractice = presentStudents[currentStudentNos]
    }
    const answerFormat = get(currentPractice, 'blockBasedPractice.answerFormat')
    if (answerFormat === "answerContent") {
      return (
        <div style={{ height: answerFormat === "answerGoogleEmbedLink" ? '100%' : 'auto' }}>
          <TekieCEParser
            value={get(currentPractice, 'blockBasedPractice.answerFormatDescription', '')}
            init={{ selector: `EV-Question_${get(currentPractice, 'blockBasedPractice.answerFormatDescription', '')}` }}
            legacyParser={(statement) => {
              return parseMetaTags({ statement, removeCodeTag: true });
            }}
          />
        </div>
      )
    } else if (answerFormat === "answerGoogleEmbedLink") {
      return (
        <div style={{ height: answerFormat === "answerGoogleEmbedLink" ? '100%' : 'auto' }}>
          <IframeContent
            projectDescription={get(currentPractice, 'blockBasedPractice.answerFormatDescription')}
            forAnswerLink
          />
        </div>
      )
    }
  }

  return <div className={`${styles.box} ${styles.correctAnsBox}`} style={{ marginTop: '16px' }}>
    <div className={styles.badgeContainer} style={{ marginBottom: (evaluationType === evaluationTypes.CODING_ASSIGNMENT || evaluationType === evaluationTypes.HW_ASSIGNMENT) ? '20px' : null }}>
      <Badge customStyles={{ width: 'max-content' }} rounded text='Correct Answer' type='green' />
    </div>
    {(evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) ? (
      renderCorrectAnswerBasedOnFormat()
    ) : (
      renderCorrectCodingAssignment()
    )}
  </div>;
};

export default CorrectAnswer