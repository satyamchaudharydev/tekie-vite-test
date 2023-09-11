/* eslint-disable no-useless-escape */
import { useState, useEffect, useRef } from "react";
import React from "react";
import gql from "graphql-tag";
import { debounce, get } from "lodash";
import { useDropzone } from "react-dropzone";
import Lottie from "react-lottie";
import { ReactComponent as Send } from "../assets/send.svg";
import { ReactComponent as QuestionIcon } from "../assets/questionIco.svg";
import { ReactComponent as InstructionIcon } from "../assets/instruction.svg";
import addPracticeFile from "../addPracticeFile";
import file from "../assets/file.png";
import linkThumbnail from "../assets/linkThumbnail.png";
import { turncate } from "../utils/turncate";
import getPath from "../../../../utils/getFullPath";
import removeFromUserBlockBasedPracticeAttachment from "../removeFromUserBlockBased";
import { convertTime, convertTimeEvaluation, convertTimeGSuit } from "../utils/convertTime";
import { convertFileName } from "../utils/convertFileName";
import FileMaxPopup from "./FileMaxPopup";
import requestToGraphql from "../../../../utils/requestToGraphql";
import PreviewSubmission from "./PreviewSubmission";
import { motion } from "framer-motion";
import loader from "./loader.json";
import tick from './tick.json'
import DeleteButton from "./DeleteButton";
import "../Practice.scss";
import { updateHomeworkAttempted } from "../../../../components/NextFooter/utils";
import Button from "../../../TeacherApp/components/Button/Button";
import { DownArrowSvg, ExternalLinkSvg, ViewSubmissionSvg } from "../../../TeacherApp/components/svg";
import { hsFor1280 } from "../../../../utils/scale";
import { HOMEWORK_COMPONENTS_CONFIG, TOPIC_COMPONENTS } from "../../../../constants/topicComponentConstants";
import sheetsLogo from '../assets/sheetsLogo.png'
import slidesLogo from '../assets/slidesLogo.png'
import documentLogo from '../assets/documentLogo.png'
import getMe from "../../../../utils/getMe";
import duck from "../../../../duck";
import gsuiteQueries, { updateGsuiteLastRevision } from "../utils/gsuiteQueries";
import buddyQueriesCaller from "../../../../queries/utils/buddyQueriesCaller";
import { gsuiteQueriesVariables } from "../../../../constants/gsuite";
import Tooltip from "../../../../components/Tooltip/Tooltip";
import practiceAttachmentQueries from "../utils/practiceAttachmentQueries";
import { practiceAttachmentVariables } from "../../../../constants/practiceAttechment";


const turncateLength = 35;
const maxFileSize = 20 * 1024 * 1024;
const maxAPKFileSize = 55 * 1024 * 1024;
// remove query
const removeQuery = (id) => gql`
    mutation {
      updateUserBlockBasedPractice(id: "${id}", input: { answerLink: "" }) {
      id
    }
    }
  `;
const deleteQuery = (id) => gql`
    query{
      deleteGsuiteFileOrFolder(id: "${id}"){
        result
      }
    }
`;
// progress Component -- when uploading
const Progress = ({ label }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((value) => {
        let newValue = value + 6;
        if (newValue >= 60) {
          newValue = value + 1;
        }
        if (newValue === 90) {
          clearInterval(interval);
        }

        return newValue;
      });
    }, 100);
  }, []);
  return (
    <>
      <div className="practice-file-preview-loading-status loading-status">
        <div className="loading-status-top">
          <div>
            {label} <span className="loading-status-top--count">{((progress / 100) * 100).toFixed()}%</span>
          </div>
        </div>
        <div className="practice-file-upload-progress">
          <div className="practice-file-upload-progress-done" style={{ width: `${(progress / 100) * 100}%` }}></div>
        </div>
      </div>
    </>
  );
};
// loader Component -- when uploaded / deleting 
export const Loader = ({size}) => {
  return <div className="practice-uploading-loader" data-size={size}>
    <Lottie options={{
                    autoplay: true,
                    animationData: loader,
                    loop: true,
                    isClickToPauseDisabled: true,
                    rendererSettings: {
                      preserveAspectRatio: "xMidYMid slice"
                    }
                  }}
                  ></Lottie>
   </div>
  
  
}
const validationChecks = {
  'blockly': [
    'blockly-demo.appspot.com',
    '#'
  ],
  'canva': [
    'canva.com'
  ],
  'figma': [
    'figma.com'
  ],
  'code': [
    'code.org',
  ]
}
const checkValidationUrl = (url, type) => {
  if (validationChecks[type]) {
    return validationChecks[type].every((check) => url.includes(check))
  }
  return false
}

function PracticeSubmission({
  userBlockBasedPractices = [],
  dumpBlockBasedPractice = () => {},
  loading,
  layout,
  withHttps,
  id,
  fromEvaluation,
  gsuiteFile,
  updatingIsGsuiteFileVisitedQuery = () => {},
  isGsuiteFileVisited,
  gsuitePopup,
  handleGsuitePopup = () => {},
  reAttemptGsuiteFile,
  handleNewSubmission,
  mimeType,
  updateConfirmNewSubmission,
  makingEmptyGsuiteFile,
  createNewFileIfNotExists = () => {},
  isButtonLoading,
  isReAttemptButtonLoading,
  newHTMLTABComponentRedirect,
  isHomework,
  activeQuestionIndex,
  projectId,
  setIsModalOpen = () => {},
  handlingCountingSecond,
  projectLink,
  fromStudentReport,
  updateAuthorsArray,
  handelIsSubmissionButtonClicked,
  props,
  gsuiteCorrectFileRepresentation,
  checkIfPracticeAttempted,
}) {
  const [link, setLink] = useState(get(userBlockBasedPractices, "[0].answerLink", ""));
  const [fileUploading, setFileUploading] = useState(false);
  const [fileLink, setFileLink] = useState(getPath(get(userBlockBasedPractices, "[0].attachments[0].uri", '')));
  const [fileDelete, setFileDelete] = useState(false);
  const [fileType, setFileType] = useState(get(userBlockBasedPractices, "[0].attachments[0].type", ''));
  const [linkSubmitted, setLinkSubmitted] = useState(false);
  const [showSaved,setShowSaved] = useState(false)
  const [fileName, setFileName] = useState(
          turncate(
            convertFileName(
              get(userBlockBasedPractices[0], "attachments[0].name",'')
            ),
            turncateLength
          )
        )
  const [fileId, setFileId] = useState("");
  const [edit, setEdit] = useState(false);
  const [isFilePreview, setIsFilePreview] = useState(false);
  const [fileUploadTime, setFileUploadTime] = useState("");
  const [linkUploadTime, setLinkUploadTime] = useState("");
  const [popup,setPopup] = useState(null)
  const [deleteGsuiteLoading,setDeleteGsuiteLoading] = useState(false)
  const [isKeepTheSameLoading,setIsKeepTheSameLoading] = useState(false)
  const [isGsuiteBuddyCalled,setIsGsuiteBuddyCalled] = useState(false)
  const checkIfAllBuddyAreLoggedIn = () => {
    const getMeBuddyData = get(getMe(),'buddyStudents','')
    const authorsData = get(userBlockBasedPractices,'[0].authors','')
    if(getMeBuddyData && authorsData && getMeBuddyData.every(buddyData => authorsData.some(author => author.id === buddyData.id))){
      return true
    }
    if(authorsData && !authorsData.length) {
      return true
    }
    return false
  }

  const [isShowInputValidation, setIsShowInputValidation] = useState(false);
  const isBlockly = get(userBlockBasedPractices, "[0].courseData.codingLanguages", [])
                  .map((item) => get(item, 'value', '').toLowerCase())
                  .includes("blockly");
  useEffect(() => {
    setPopup(null)
    handleGsuitePopup()
  },[activeQuestionIndex])

  useEffect(() => {
    if(showSaved){
      setTimeout(() => {
        setShowSaved(false)
      }, [1500])
    }
  }, [showSaved])
  
  const firstMount = useRef(true)
  useEffect(() => {
    if (firstMount.current) return;
      if(layout ==='gsuite' && isGsuiteFileVisited && !showSaved){
        setShowSaved(true)
      }
  } , [isGsuiteFileVisited])

  useEffect(() => {
        firstMount.current = false
        return () => firstMount.current = true
    }, [])

// on reattempt click fetch the gsuite file if cancel delete the new file

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      uploadFile(acceptedFiles[0]);
    },
  });

  // ref for file input
  const editRef = useRef(null);
  // for ESc key press close preview modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFilePreview(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [])

  const showInvalidePopup = (link,isShowInputValidation) => {
    if(link.length === 0) return setIsShowInputValidation(false)
     if(isInvalidLink(link)) return setIsShowInputValidation(true)
     else setIsShowInputValidation(false)
  }
  const debounceOnPersist = debounce((link,isShowInputValidation) => {
    showInvalidePopup(link,isShowInputValidation)
  }
  , 500);
  useEffect(() => {
    if (userBlockBasedPractices.length > 0) {
      if (layout === "externalPlatform" && userBlockBasedPractices[0].answerLink) {
        setLinkUploadTime(convertTime(get(userBlockBasedPractices[0], "updatedAt", "")));

        if (get(userBlockBasedPractices[0], "answerLink", "").length > 0) {
          setLinkSubmitted(true);
        }
      } else{
      if (get(userBlockBasedPractices[0], "attachments[0].id")) {
        setFileId(get(userBlockBasedPractices[0], "attachments[0].id"));
        setFileUploadTime(
          get(userBlockBasedPractices[0], "attachments[0].createdAt")
        );
      }
    }  
      
  
    }
  }, [userBlockBasedPractices]);
  // when file gets upload
  const uploadFile = async (file, edit = false) => {
    if (get(file, 'type') === 'application/vnd.android.package-archive') {
      if (file.size > maxAPKFileSize) {
        setPopup("apkFileMax");
        return;
      }
    } else if (file.size > maxFileSize) {
      setPopup("fileMax");
      return;
    }
    setFileLink(null);
    setIsFilePreview(false);
    setEdit(true);
    setFileUploading(true);
    if (edit) {
      await practiceAttachmentQueries(practiceAttachmentVariables.REMOVE_FROM_USER_BLOCK_BASED_PRACTICE_ATTACHMENT,{userBlockBasedId:id,fileId,activeQuestionIndex,props})
    }
    const res = await practiceAttachmentQueries(practiceAttachmentVariables.ADD_PRACTICE_FILE,{file,userBlockBasedId:id,fileId: edit ? "" : fileId,activeQuestionIndex,props})
    if (res) {
      setFileUploading(false);
      setFileId(res.id);
      setFileType(res.type);
      setFileName(turncate(convertFileName(res.name), turncateLength));
      setFileUploadTime((new Date(res.createdAt) !== new Date()) ? new Date() : res.createdAt );
      updateUserBlockBasedPracticesToDuck({
        attachments: [
          res
        ]
      })
      
      isHomework && updateHomeworkAttempted(projectId, HOMEWORK_COMPONENTS_CONFIG.homeworkPractice);
      setTimeout(() => {
        setFileLink(getPath(res.uri));
      }, 3000);
    checkIfPracticeAttempted()
  }
  };
  const onConfirmDeleteFile = async () => {
    if (fileId) {
      setFileDelete(true);
      const res = await practiceAttachmentQueries(practiceAttachmentVariables.REMOVE_FROM_USER_BLOCK_BASED_PRACTICE_ATTACHMENT,{userBlockBasedId: get(userBlockBasedPractices[0], "id"),fileId,activeQuestionIndex,props})
      if (res) {
        setFileLink(null);
        setFileName(null);
        setFileId(null);
        setEdit(false);
        setPopup(null);
        setFileDelete(false);
        updateUserBlockBasedPracticesToDuck({
          attachments: []
        })
        isHomework && updateHomeworkAttempted(projectId, HOMEWORK_COMPONENTS_CONFIG.homeworkPractice, true);
      }
    }
  };
  // when user deletes the file
  const onDeleteFile = async () => {
    setPopup("delete");
  };
  // when user view the file
  const viewFile = () => {
    // if fileType is not image or video then open in new tab
    if (fileType !== "image" && fileType !== "video") {
      window.open(withHttps(fileLink), "_blank");
    }
    // else open the modal
    else {
      setIsFilePreview(true);
    }
  };

  const pasteLink = async () => {
    if (navigator && navigator.clipboard) {
      const clipboardString = await navigator.clipboard.readText();
      if (clipboardString) {
        handleLink(clipboardString);
      }
    }
    checkIfPracticeAttempted()
  };
  // onChange handler for link input
  const handleLink = (url) => {
    setLink(url);
    
  };
  // wheb users dlt the link
  const onDeleteLink = () => {
    setPopup("link");
  };
  const onDeleteGsuiteData = () => {
    setPopup("gsuite");
  };
  const OnConfirmGsuiteDelete = async () => {
    setDeleteGsuiteLoading(true)
    const res = await gsuiteQueries('updateGsuiteLastRevision',{userBlockBasedId: get(userBlockBasedPractices[0], "id"),gsuiteFile,props: props})
    await updatingIsGsuiteFileVisitedQuery(get(userBlockBasedPractices[0], "id"),false,true)
    makingEmptyGsuiteFile()
    setDeleteGsuiteLoading(false)
  }
  const renderInstructionContent = (type) => {
    let heading = "Steps to copy the blockly link";
    let subText = "Follow the below steps to copy the correct link." 
    let icon = <InstructionIcon /> 
    if(type === 'invalid'){
      heading = "Invalid Link Pasted"
      subText = 'You have pasted a wrong blockly link. Follow the below steps to copy the correct link.'
    }
    return <>
      <div
       
       
       className="instruction-container">
                        <div className="instruction-container--heading">
                          {icon}
                          {heading}
                         </div>
                         {isBlockly ? <>
                          <div className="instruction-container--subText">{subText}</div>
                          <div className="instruction-video-container">                            
                            <video
                                  id='video' 
                                  autoplay="autoplay"
                                  loop
                                  controls="false"
                                  muted
                                  playsinline
                                  preload='none' 
                                  width={"100%"}
                                  height={'100%'}
                                  >
                            <source id='mp4' src="https://tekie-prod-bucket.uolo.co/blockly/comp_clbxo9yye0f4b0uokhsgiceyq_1671628211510.mp4" type='video/mp4' />
                              </video>
       
                          </div>
                         </> : null}
                          
                  </div>
    </>
  }
  const onConfirmDeleteLink = async () => {
    setFileDelete(true);
    const res = await requestToGraphql(removeQuery(get(userBlockBasedPractices[0], "id")));
    buddyQueriesCaller('removeSubmittedLink',{removeQuery,props,activeQuestionIndex})
    if (res) {
      setFileDelete(false);
      setPopup(null);
      handleLink("");
      onEditLink();
      updateUserBlockBasedPracticesToDuck({
        answerLink: ""
      })
      
      isHomework && updateHomeworkAttempted(projectId, HOMEWORK_COMPONENTS_CONFIG.homeworkPractice, true);
    }
  };
  // when user edit the link
  const onEditLink = () => {
    setEdit(false);
    setLinkSubmitted(false);
  };
  // when user submit the link
  const onSubmitLink = async () => {
    // setIsShowInputValidation(isInvalidLink(link))
    // if(isInvalidLink(link)) return 
    if (link.trim().length === 0) return;
    setEdit(true);
    setLinkUploadTime("");
    await dumpBlockBasedPractice(link);
    setShowSaved(true);
    isHomework && updateHomeworkAttempted(projectId, HOMEWORK_COMPONENTS_CONFIG.homeworkPractice)
    updateUserBlockBasedPracticesToDuck({
      answerLink:  link,
    })
    checkIfPracticeAttempted()
  };
  const updateUserBlockBasedPracticesToDuck = (data) => {
    let { allBlockBasedPractice, match } = props
    allBlockBasedPractice = (allBlockBasedPractice && allBlockBasedPractice.toJS()) || []
    const topicId = get(match, 'params.topicId')
    const practiceId = get(match, 'params.projectId')
    const type = isHomework ? HOMEWORK_COMPONENTS_CONFIG.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice
    
    const updateData =  allBlockBasedPractice.map((item) => {
      const blockBasedPracticeId = get(item, 'blockBasedPractice.id')
      if(blockBasedPracticeId === practiceId){
        return {
          ...item,
          ...data
        }
      }
      return item
    
  })
    duck.merge(() => ( {
      userBlockBasedPractices: updateData
  }), {
      key: `${topicId}/${type}/${props.userId}`
  }) 
  }

  const getFileTitle = (obj) => {
    const name = get(obj, 'attachments[0].name')
    return name && name.length > 30 ? name.substring(0, 30) + '...' : name
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

  const viewStudentSubmission = () => {
    if (get(userBlockBasedPractices[0], 'answerLink')) {
      window.open(withHttps(get(userBlockBasedPractices[0], 'answerLink')), "_blank");
    } else if (get(userBlockBasedPractices[0], 'attachments[0].id')) {
      if(get(userBlockBasedPractices[0], 'attachments[0].type') !== "image" && get(userBlockBasedPractices[0], 'attachments[0].type') !== "video"){
        window.open(withHttps(getPath(get(userBlockBasedPractices[0], 'attachments[0].uri'))), "_blank");
      } else {
        setIsFilePreview(true);
      }
    }
  }

  const renderSubmissionFooterForEvaluation = () => {
    return (
      <div className='studentPracBoxFooterContainer'>
        <div className='logoTitleContainer'>
          <div className='titleDescriptionContainer'>
            <p>{get(userBlockBasedPractices[0], "answerLink") ? 'Submission Link' : getFileTitle(userBlockBasedPractices[0])}</p>
            <span>{get(userBlockBasedPractices[0], 'updatedAt') ? convertTimeEvaluation(get(userBlockBasedPractices[0], 'updatedAt')) : convertTimeEvaluation(get(userBlockBasedPractices[0], 'createdAt'))}</span>
          </div>
        </div>
        <Button
          onBtnClick={() => viewStudentSubmission()}
          text={showSubmitButtonText(userBlockBasedPractices[0])}
          rightIcon
          type="secondary"
        >
          {renderSubmissionButtonIcon(userBlockBasedPractices[0])}
        </Button>
      </div>
    )
  }
  const openSubmissionHandle = async () => {
    handelIsSubmissionButtonClicked()
    await createNewFileIfNotExists(gsuiteFile.url)
    let { allBlockBasedPractice, match } = props
    allBlockBasedPractice = (allBlockBasedPractice && allBlockBasedPractice.toJS()) || []
    const topicId = get(match, 'params.topicId')
    const practiceId = get(match, 'params.projectId')
    const type = isHomework ? HOMEWORK_COMPONENTS_CONFIG.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice
    const currentBlockBasedPractice = allBlockBasedPractice.find(practice => get(practice, 'blockBasedPractice.id') === practiceId)
    const filteredBlockBasedPractices = allBlockBasedPractice.filter(practice => get(practice, 'blockBasedPractice.id') !== practiceId)
    if (currentBlockBasedPractice) {
        filteredBlockBasedPractices.push({ ...currentBlockBasedPractice, 
            gsuiteFile,
        })
        duck.merge(() => ( {
            userBlockBasedPractices: filteredBlockBasedPractices
        }), {
            key: `${topicId}/${type}/${props.userId}`
        })                
    }
    updateAuthorsArray()
    checkIfPracticeAttempted()
  }


  const isInvalidLink = (link) => {
    if(isBlockly) return !(checkValidationUrl(link,'blockly') && isUrlValid(link))
    return !isUrlValid(link)
  }
  function isUrlValid(str) {
    const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/
    return !!regex.test(str)
  }
  
  
   const renderSubmission = () => {
    if(layout === "externalPlatform"){
      
        if(linkSubmitted || edit){
          return (
            <>
              <div
                className={
                  fromEvaluation
                    ? "upload-container"
                    : "practice-top-upload-container upload-container"
                }
                style={{ height: fromEvaluation ? '100%' : null }}
              >
                {loading ? (
                  <>
                    <div className="practice-file-preview-container">
                      <div
                        className={
                          fromEvaluation
                            ? "practice-file-preview"
                            : "practice-file-preview practice-file-preview-height default-thumbnail center"
                        }
                      >
                        <Loader></Loader>
                      </div>
                      <Progress label={"Submitting link:"} />
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="practice-file-preview-container"
                    >
                      <div
                        className={
                          fromEvaluation
                            ? "practice-file-preview"
                            : "practice-file-preview practice-file-preview-height default-thumbnail"
                        }
                        style={{ backgroundImage: `url(${linkThumbnail})`, height: fromEvaluation ? '100%' : '' }}
                      >
                        {!fromEvaluation ? (
                          <DeleteButton
                            onDelete={onDeleteLink}
                            isDelete={false}
                          ></DeleteButton>
                        ) : null}
                      </div>
                      {!fromEvaluation ? (
                        <div className="practice-submission-file-details">
                          <>
                            <div className="practice-submission-file-details--file-info">
                              <div>Submission Link</div>
                              <span>
                                {!linkUploadTime && edit
                                  ? convertTime(new Date().toISOString())
                                  : linkUploadTime}
                              </span>
                            </div>
                            <div className="practice-submission-file-details--handles">
                              <div
                                className="practice-submission-file-details--handles-edit"
                                onClick={() => {
                                  onEditLink();
                                }}
                              >
                                Edit
                              </div>
                              <div
                                className="practice-submission-file-details--handles-view"
                                onClick={() => {
                                  window.open(withHttps(link), "_blank");
                                }}
                              >
                                View
                              </div>
                            </div>
                          </>
                        </div>
                      ) : null}
                    </motion.div>
                    {fromStudentReport &&
                    userBlockBasedPractices &&
                    userBlockBasedPractices.length
                      ? renderSubmissionFooterForEvaluation()
                      : null}
                  </>
                )}
              </div>
            </>
          );
        }
      
        else{
          return (
            <>
                <div className={fromEvaluation ? "upload-container" : "practice-top-upload-container upload-container"}>
              <div className={`practice-top-upload`}>
                <div className="practice-top-upload-image">
                  <img className="practice-file-icon" src={file} alt="" />
                </div>
                <div className="practice-top-upload-type">
                  <p className="practice-type-header">
                    Submit Your Link Below
                  </p>

                  <form
                    action=""
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSubmitLink();
                    }}
                    className="practice-submit-link-input-container"
                  >
                    {/* <Tooltip
                        overlay={true}
                        showFromProps={true}
                        show={isShowInputValidation}
                        direction={"bottom"}
                        delay={1}
                        onClose={() => setIsShowInputValidation(false)}
                        content={renderInstructionContent('invalid')}
                    > */}
                      <input
                        onChange={
                          (e) => {
                            handleLink(e.target.value)
                            // if(isShowInputValidation) setIsShowInputValidation(false)
                            // debounceOnPersist(e.target.value, isShowInputValidation)
                          }
                        }
                        value={link}
                        disabled={fromEvaluation}
                        type="text"
                        placeholder="Submit Link Here"
                      />
                  
                    {link && link.length > 0 ? (
                      <Send
                        onClick={() => onSubmitLink()}
                        className={`practice-send-icon cursor-pointer`}
                      />
                    ) : (
                      <div
                        className="practice-submit-text cursor-pointer"
                        onClick={() => pasteLink()}
                      >
                        Click to Paste
                      </div>
                    )}
                  </form>
                      {/* {isBlockly && (
                        <>
                          <Tooltip 
                            delay={1}
                            direction={"bottom"}
                            hide={isShowInputValidation}
                            content={renderInstructionContent()}
                            overlay={true}
                            >
                              <div 
                              className="practice-instruction-text">How to copy the Blockly link
                                <QuestionIcon ></QuestionIcon>
                              </div>
                          </Tooltip>
                        </>
                       )} */}
                 
                </div>
              </div>
            </div>
            </>
          )
        }
    }
    else if (layout === 'fileUpload'){
      if(fileId || edit){
        return (
          <>
            <div
              className={
                fromEvaluation
                  ? "upload-container"
                  : "practice-top-upload-container upload-container"
              }
              style={{ height: fromEvaluation ? '100%' : '0' }}
            >
              <div className="practice-file-preview-container">
                {!fileUploading && fileLink ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="practice-file-preview-container"
                  >
                    <PreviewSubmission
                      type={fileType}
                      fileLink={fileLink}
                      onDeleteFile={onDeleteFile}
                      fileDelete={fileDelete}
                      fromEvaluation={fromEvaluation}
                    ></PreviewSubmission>
                    {!fromEvaluation ? (
                      <div className="practice-submission-file-details">
                        <div className="practice-submission-file-details--file-info">
                          <div>{fileName}</div>
                          <span>{convertTime(fileUploadTime)}</span>
                        </div>
                        <div className="practice-submission-file-details--handles">
                          <div
                            className="practice-submission-file-details--handles-edit"
                            onClick={() => {
                              editRef.current.click();
                            }}
                          >
                            Edit
                            <input
                              type="file"
                              ref={editRef}
                              hidden
                              onChange={(e) => {
                                uploadFile(e.target.files[0], true);
                              }}
                            />
                          </div>
                          <div
                            className="practice-submission-file-details--handles-view"
                            onClick={() => viewFile()}
                          >
                            View
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {fromStudentReport &&
                    userBlockBasedPractices &&
                    userBlockBasedPractices.length
                      ? renderSubmissionFooterForEvaluation()
                      : null}
                  </motion.div>
                ) : (
                  <motion.div className="practice-file-preview-container">
                    <div
                      className={
                        fromEvaluation
                          ? "practice-file-preview"
                          : "practice-file-preview practice-file-preview-height default-thumbnail center"
                      }
                    >
                      <Loader></Loader>
                    </div>
                    <Progress label={"Uploading:"} />
                  </motion.div>
                )}
              </div>
            </div>
          </>
        );
      }
      else{
        return (
          <>
            <div className={fromEvaluation ? "upload-container" : "practice-top-upload-container upload-container"} {...getRootProps()}>
              {!fromEvaluation && <input {...getInputProps()} />}
              <div
                className={`practice-top-upload ${isDragActive &&
                  "practice-drag"}`}
              >
                <div className="practice-top-upload-image">
                  <img className="practice-file-icon" src={file} alt="" />
                </div>
                <div className="practice-top-upload-type">
                  <p className="practice-type-header">
                    Drop your file here or{" "}
                    <span className="upload-link">browse</span>
                  </p>
                  <p className="practice-top-upload-filesize">
                    Max. File Size = 20mb and 50mb for APK Files.
                  </p>
                </div>
              </div>
            </div>
          </>
        )
      }
    }
    else if ( layout === 'gsuite'){
      if(!isGsuiteFileVisited && !fromEvaluation){
        return (
          <>
             <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="practice-file-preview-container">
            <div className={fromEvaluation ? "upload-container" : "practice-top-upload-container upload-container start-container"} 
            onClick={async () =>{ 
              setIsModalOpen(true)
              var intervalId = setInterval(handlingCountingSecond,1000)
              const newTab =  get(gsuiteFile, 'url', '') && newHTMLTABComponentRedirect()
              const link = get(gsuiteFile, 'url','')
              if(link && newTab){
                newTab.location.href = link;
              } 
              if(!get(gsuiteFile, 'url', '') && !get(gsuiteFile, 'fileId', '')){
                await createNewFileIfNotExists()
              }
              setIsModalOpen(false, intervalId)
              await updatingIsGsuiteFileVisitedQuery(get(userBlockBasedPractices[0], "id"), true)
              updateAuthorsArray()
              checkIfPracticeAttempted()
              }
            }
            disabled={isButtonLoading}
            >
              <div className={`practice-top-upload`}>
                <div className="practice-top-upload-image">
                  <img className="practice-file-logo" src={mimeType === 'presentation' ? slidesLogo : 
                    mimeType === 'document' ? documentLogo :
                    mimeType === 'spreadsheet' ? sheetsLogo :
                    file
                  } alt="" />
                </div>
                <div className="practice-top-upload-type">
                  <p className="practice-type-header" style={{color:'#A8A7A7', lineHeight:'140%'}}>
                  Submission doesn’t exist. <br />
                  Click to start practicing.
                  </p>
                </div>
              </div>
            </div>
        </motion.div>
          </>
        )
      }
      else{
        return (
          <>
            <div
              className={
                fromEvaluation
                  ? "upload-container"
                  : "practice-top-upload-container upload-container"
              }
            >
              {loading ? (
                <>
                  <div className="practice-file-preview-container">
                    <div
                      className={
                        fromEvaluation
                          ? "practice-file-preview"
                          : "practice-file-preview practice-file-preview-height default-thumbnail center"
                      }
                    >
                      <Loader></Loader>
                    </div>
                    <Progress label={"Submitting link:"} />
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="practice-file-preview-container"
                  >
                    <div
                      className={
                        fromEvaluation
                          ? "practice-file-preview"
                          : "practice-file-preview practice-file-preview-height default-thumbnail"
                      }
                      onClick={async () => {
                        if (fromEvaluation) {
                          window.open(withHttps(projectLink), "_blank");
                        } else {
                          const authorsData = get(
                            userBlockBasedPractices,
                            "[0].authors"
                          );
                          if (!checkIfAllBuddyAreLoggedIn()) {
                            openSubmissionHandle();
                          } else {
                            const newTab =
                              get(gsuiteFile, "url", "") &&
                              newHTMLTABComponentRedirect();
                            const link = get(gsuiteFile, "url", "");
                            if (
                              get(getMe(), "buddyStudents", "") &&
                              !isGsuiteBuddyCalled
                            ) {
                              buddyQueriesCaller(
                                gsuiteQueriesVariables.UPDATE_GSUITE_NEW_FILE,
                                {
                                  newFile: gsuiteFile,
                                  props,
                                  activeQuestionIndex,
                                }
                              );
                              setIsGsuiteBuddyCalled(true);
                              buddyQueriesCaller(
                                gsuiteQueriesVariables.UPDATE_IS_GSUITE_FILE_VISITED,
                                {
                                  visitedBool: true,
                                  props,
                                  activeQuestionIndex,
                                }
                              );
                              updateAuthorsArray();
                            }
                            if (link && newTab) {
                              newTab.location.href = link;
                            }
                          }
                          checkIfPracticeAttempted()
                        }
                      }}
                      style={{ backgroundImage: `url(${linkThumbnail})` }}
                    >
                      {!fromEvaluation ? (
                        <DeleteButton
                          onDelete={onDeleteGsuiteData}
                          isDelete={false}
                        ></DeleteButton>
                      ) : null}
                    </div>
                    {!fromEvaluation ? (
                      <div className="practice-submission-file-details">
                        <>
                          {gsuiteFile && get(gsuiteFile, "name") ? (
                            <div className="practice-submission-file-details--file-info">
                              <div>
                                {gsuiteFile.name && gsuiteFile.name.length > 20
                                  ? gsuiteFile.name.substring(0, 20) + "..."
                                  : gsuiteFile.name}
                              </div>
                              <span>
                                {convertTimeGSuit(gsuiteFile.createdTime)}
                              </span>
                            </div>
                          ) : (
                            <div className="practice-submission-file-details--file-info">
                              <div>Submission Link</div>
                              <span>
                                {!linkUploadTime
                                  ? convertTime(new Date().toISOString())
                                  : linkUploadTime}
                              </span>
                            </div>
                          )}
                          <div className="practice-submission-file-details--handles">
                            <div
                              className="practice-submission-file-details--handles-view"
                              onClick={async () => {
                                const authorsData = get(
                                  userBlockBasedPractices,
                                  "[0].authors"
                                );
                                if (!checkIfAllBuddyAreLoggedIn()) {
                                  openSubmissionHandle();
                                } else {
                                  const newTab =
                                    get(gsuiteFile, "url", "") &&
                                    newHTMLTABComponentRedirect();
                                  const link = get(gsuiteFile, "url", "");
                                  if (
                                    get(getMe(), "buddyStudents", "") &&
                                    !isGsuiteBuddyCalled
                                  ) {
                                    buddyQueriesCaller(
                                      gsuiteQueriesVariables.UPDATE_GSUITE_NEW_FILE,
                                      {
                                        newFile: gsuiteFile,
                                        props,
                                        activeQuestionIndex,
                                      }
                                    );
                                    setIsGsuiteBuddyCalled(true);
                                    buddyQueriesCaller(
                                      gsuiteQueriesVariables.UPDATE_IS_GSUITE_FILE_VISITED,
                                      {
                                        visitedBool: true,
                                        props,
                                        activeQuestionIndex,
                                      }
                                    );
                                    updateAuthorsArray();
                                  }
                                  if (link && newTab) {
                                    newTab.location.href = link;
                                  }
                                }
                              }}
                            >
                              Open Submission
                            </div>
                          </div>
                        </>
                      </div>
                    ) : null}
                    {fromStudentReport &&
                    userBlockBasedPractices &&
                    userBlockBasedPractices.length
                      ? renderSubmissionFooterForEvaluation()
                      : null}
                  </motion.div>
                </>
              )}
            </div>
          </>
        );
      }
    }
  
  }

  if ((popup || gsuitePopup) && !isReAttemptButtonLoading) {
    // check for type
    // check for link/file
    if (popup === "delete" || popup === "link" || popup === "gsuite" || gsuitePopup) {
      const layoutType = layout === "externalPlatform" ? "externalPlatform" : layout === "gsuite" ? "gsuite" : "";
      return (
        <>
          <div className="upload-container">
            <FileMaxPopup
              type={gsuitePopup ? gsuitePopup : popup}
              onConfirm={layoutType ? onConfirmDeleteLink : onConfirmDeleteFile}
              onCancel={() => {
                setLinkSubmitted(true);
                setFileUploading(false);
                setPopup(null);
              }}
              deleteLoading={fileDelete}
              onCancelGsuiteDelete={() => {
                setPopup(null);
              }}
              onConfirmGsuiteDelete={async () => {
                await OnConfirmGsuiteDelete();
                setPopup(null);
              }}
              deleteGsuiteLoading={deleteGsuiteLoading}
              // isKeepTheSameLoading={isKeepTheSameLoading}
              // onKeepTheSame={() => {
              //   setPopup(null)
              //   onKeepTheSame()
              // }}
              // onConfirmReattempt={onConfirmNewSubmission}
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="upload-container">
            <FileMaxPopup type={popup} onCancel={() => setPopup(null)} />
          </div>
        </>
      );
    }
  }
  
  
  

    if ((popup || gsuitePopup) && !isReAttemptButtonLoading){
      // check for type
      // check for link/file
      if((popup === 'delete' || popup === 'link' || popup === 'gsuite' || gsuitePopup)){
        const layoutType = layout === 'externalPlatform' ? 
          'externalPlatform' : layout === 'gsuite' ? 
          'gsuite' : '';
        return (
          <>    
            <div className="upload-container"> 
              <FileMaxPopup
                  type={gsuitePopup ? gsuitePopup : popup}
                  onConfirm={layoutType ? onConfirmDeleteLink : onConfirmDeleteFile}
                  onCancel={() => {
                    setLinkSubmitted(true);  
                    setFileUploading(false)
                    setPopup(null)
                  }}
                  deleteLoading={fileDelete}
                  onCancelGsuiteDelete={() => {
                    setPopup(null)
                  }
                  }
                  onConfirmGsuiteDelete={async () => {
                    await OnConfirmGsuiteDelete()
                    setPopup(null)
                  }
                }
                deleteGsuiteLoading={deleteGsuiteLoading}
                // isKeepTheSameLoading={isKeepTheSameLoading}
                // onKeepTheSame={() => {
                //   setPopup(null)
                //   onKeepTheSame()
                // }}
                // onConfirmReattempt={onConfirmNewSubmission}
              />
            </div>
          </>
        )
        

      }
      else{
       return (
          <>   
           <div className="upload-container">       
              <FileMaxPopup
                   type={popup}
                   onCancel={() => setPopup(null)}
                />
            </div>
          </>
       )
      }
   

    }
    if(showSaved){
          return (
            <>
            <div className={'upload-container'}>
              <div className={'practice-top-upload-container practice-saved-container'}>
                <div className="practice-file-max-modal border">
                  <div className="practice-saved-container">
                      <div className="practice-saved-icon">
                        <Lottie options={{
                          autoplay: true,
                          animationData: tick,
                          loop: false,
                          isClickToPauseDisabled: true,
                          rendererSettings: {
                            preserveAspectRatio: "xMidYMid slice"
                          }
                        }}
                        ></Lottie>
                    </div>
                <div className="practice-saved-text">
                  Submission Saved
                </div>
                  </div>
                 
                </div>
                
              </div>
            </div>
            
            </>
          )
      }
    return (
      <>
        {isFilePreview && fileType === "image" && fileLink && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} 
            className="file-preview-modal"
            onClick={() => setIsFilePreview(false)}
          >
            <img onClick={(e) => e.stopPropagation()} src={fileLink} alt="" className="file-preview-modal-image" />
          </motion.div>
        )}
        {isFilePreview && fileType === "video" && fileLink && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="file-preview-modal"
            onClick={() => setIsFilePreview(false)}
          >
            <video src={fileLink} controls></video>
          </motion.div>
        )}

        {renderSubmission()}
      </>
    );
 
         
        }

export default PracticeSubmission;
