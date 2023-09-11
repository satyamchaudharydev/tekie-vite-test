import { get } from "lodash";
import React from "react";
import Blockly from 'blockly';
import '../../../../../Editor/editor.scss';
import { Expand, PlayButtonBlue } from "../../../../../../constants/icons";
import { useEvaluationContext } from "./contexts/EvaluationContext";
import styles from './EvaluationModal.module.scss'
import Badge from "../../../../../../components/Badges";
import './aceEditorStyles.scss'
import PracticeSubmission from "../../../../../UpdatedSessions/Practice/component/PracticeSubmission";
import Button from "../../../../components/Button/Button";
import { hsFor1280 } from "../../../../../../utils/scale";
import { DownArrowSvg, ExternalLinkSvg, ViewSubmissionSvg } from "../../../../components/svg";
import { convertTimeEvaluation } from "../../../../../UpdatedSessions/Practice/utils/convertTime";
import { BlocklyWorkspace } from "tekie-blockly";
import { blocklyWorkspaceConfig } from "../../../../../../components/QuestionTypes/Mcq/Mcq";
import { decodeBase64, isBase64 } from "../../../../../../utils/base64Utility";
import 'blockly/python';
import { evaluationTypes } from "../../../../utils";

const StudentAnswer = ({ fromRight, setIsOutputModalOpen, setOpenedFromRun, viewFile, openedFromStudentPerformance, setBlocklyPythonStudentCode }) => {

    const { state: { currentQuesNos, questions, practices, evaluationType, currentPracticeNos, presentStudents, currentStudentNos } } = useEvaluationContext()
    const styleObj = {
        transform: `translateX(${fromRight})`
    };

    const renderStudentAnswerCodingEvaluation = () => {
        let answerSnippet = null
        let editorMode = null
        if (openedFromStudentPerformance) {
            answerSnippet = get(questions[currentQuesNos], 'userAnswerCodeSnippet')
            editorMode = get(questions[currentQuesNos], 'assignmentQuestion.editorMode', '')
        } else {
            answerSnippet = get(presentStudents[currentStudentNos], 'question.userAnswerCodeSnippet')
            editorMode = get(presentStudents[currentStudentNos], 'question.assignmentQuestion.editorMode', '')
        }

        return (
            <div style={styleObj} className={`${styles.box} ${styles.studAnsBox}`}>
                {editorMode === 'blockly' ? null :
                    <div
                        onClick={() => {
                            setIsOutputModalOpen(true)
                            setOpenedFromRun(false)
                        }}
                        className={styles.maximizeIconContainer}
                    >
                        <Expand />
                    </div>
                }
                {editorMode !== 'java' && <div
                    className={styles.playBtnContainer}
                    onClick={() => {
                        setIsOutputModalOpen(true)
                        setOpenedFromRun(true)
                    }}
                >
                    <PlayButtonBlue />
                </div>}
                <div style={{ height: '100%' }} className={`${styles.aceEditorContainer} ${editorMode === 'blockly' ? '' : styles.blackBg}`}>
                    {editorMode === 'blockly' ? null : <div className={styles.badgeContainer}>
                        <Badge customStyles={{ width: 'max-content' }} rounded text='Student Answer' type='purple' />
                    </div>}
                    {editorMode === 'blockly' ? (
                        <BlocklyWorkspace
                            workspaceConfiguration={{ ...blocklyWorkspaceConfig, grid: { spacing: 30, length: 3 } }}
                            initialXml={
                                isBase64(answerSnippet) ? decodeBase64(answerSnippet) : answerSnippet
                            }
                            customTheme={Blockly.Theme.TekiePlayground}
                            onWorkspaceChange={(workspace) => {
                                Blockly.Python.INFINITE_LOOP_TRAP = null;
                                setBlocklyPythonStudentCode(Blockly.Python.workspaceToCode(workspace))
                            }}
                        />
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        )
    }

    const showSubmitButtonText = (obj) => {
        if (get(obj, 'answerLink')) {
            return 'Open Link'
        } else if (get(obj, 'attachments[0].id')) {
            if (get(obj, 'attachments[0].type') === 'pdf') {
                return 'Download Submission'
            } else {
                return 'View Submission'
            }
        }
    }

    const renderSubmissionButtonIcon = (obj) => {
        if (get(obj, 'answerLink')) {
            return <ExternalLinkSvg color="#8C61CB" height={hsFor1280(18)} width={hsFor1280(18)} />
        } else if (get(obj, 'attachments[0].id')) {
            if (get(obj, 'attachments[0].type') === 'pdf') {
                return <DownArrowSvg color="#8C61CB" height={hsFor1280(18)} width={hsFor1280(18)} />
            } else {
                return <ViewSubmissionSvg color="#8C61CB" height={hsFor1280(18)} width={hsFor1280(18)} />
            }
        }
    }

    const getFileTitle = (obj) => {
        const name = get(obj, 'attachments[0].name')
        return name && name.length > 30 ? name.substring(0, 30) + '...' : name
    }

    const renderStudentAnswerPracticeEvaluation = () => {
        let currentPracticeObj = null
        if (openedFromStudentPerformance) {
            currentPracticeObj = practices[currentPracticeNos]
        } else {
            currentPracticeObj = presentStudents[currentStudentNos]
        }
        const withHttps = (url) => url ? url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => schemma ? match : `https://${nonSchemmaUrl}`) : '';
        return (
            <div style={styleObj} className={`${styles.box} ${styles.studentPracBoxContainer}`}>
                <div className={styles.answerPracticeBoxTypeContainer}>
                    {get(currentPracticeObj, 'id') ? (
                        <PracticeSubmission
                            withHttps={withHttps}
                            layout={get(currentPracticeObj, 'blockBasedPractice.layout')}
                            projectLink={get(currentPracticeObj, 'answerLink')}
                            userBlockBasedPractices={[currentPracticeObj]}
                            id={get(currentPracticeObj, 'id')}
                            fromEvaluation
                        >
                        </PracticeSubmission>
                    ) : null}
                    {get(currentPracticeObj, 'id') ? (
                        <div className={styles.studentPracBoxFooterContainer}>
                            <div className={styles.logoTitleContainer}>
                                {/* <FigmaIconSvg /> */}
                                <div className={styles.titleDescriptionContainer}>
                                    <p>{get(currentPracticeObj, 'answerLink') ? 'Submission Link' : getFileTitle(currentPracticeObj)}</p>
                                    <span>{get(currentPracticeObj, 'updatedAt') ? convertTimeEvaluation(get(currentPracticeObj, 'updatedAt')) : convertTimeEvaluation(get(currentPracticeObj, 'createdAt'))}</span>
                                </div>
                            </div>
                            <Button
                                onBtnClick={() => viewFile()}
                                text={showSubmitButtonText(currentPracticeObj)}
                                rightIcon
                                type="secondary"
                            >
                                {renderSubmissionButtonIcon(currentPracticeObj)}
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        )
    }

    return (
        <>
            {(evaluationType === evaluationTypes.PRACTICE || evaluationType === evaluationTypes.HW_PRACTICE) ? (
                renderStudentAnswerPracticeEvaluation()
            ) : (
                renderStudentAnswerCodingEvaluation()
            )}
        </>
    )
};


export default StudentAnswer