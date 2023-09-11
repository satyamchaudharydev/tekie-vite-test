import React from 'react'
import uploadFile from '../../../../../../../queries/utils/uploadFile'
import LoadingSpinner from '../../../../Loader/LoadingSpinner'
import addNoticeAttachment from '../../../../../../../queries/teacherApp/classDetailPage/addNoticeAttachment'
import addNotice from '../../../../../../../queries/teacherApp/classDetailPage/addNotice'
import { AttachmentIcon, CloseIcon, PingIcon } from '../../../../../../../constants/icons'
import { Toaster, getToasterBasedOnType } from '../../../../../../../components/Toaster'
import DropDown from '../../../../../../../assets/chevron-forward-down.svg'
import styles from './ClassModal.module.scss'
import getThemeColor from '../../../../../../../utils/teacherApp/getThemeColor'



const NoticeModal = ({students=[], setOpenModal, batchId, loggedInUser, openModal}) => {
    const [headingType, setHeadingType] = React.useState('announcement')
    const [docs, setDocs] = React.useState([])
    const [showOptions, setShowOptions] = React.useState(false)
    const [showOptions2, setShowOptions2] = React.useState(false)
    const [message, setMessage] = React.useState("")
    const [utilMap, setUtilMap] = React.useState(new Map())
    const [isSending, setIsSending] = React.useState(false)
    const [selectedStudents, setSelectedStudents] = React.useState([])
    const options = ['Announcement', 'Update', 'Notice']

    const clickHandler = (option) => {
        setShowOptions(!showOptions)
        setHeadingType(option.toLowerCase())
        setShowOptions2(false)
    }
    React.useEffect(() => {
        let list = []
        if(students){
            for(let i=0;i<students.length;i++){
                list.push(students[i].user.id)
            }
            setSelectedStudents(list)
        }
    },[openModal, students.length])

    const removeFile = (key) => {
        let newDocs = [] 
        for(let i=0;i<docs.length;i++){
            if(key !== i){
                newDocs.push(docs[i])
            }
        }
        setDocs(newDocs)
    }
    const FileContainer = ({doc, idx}) => {
        return(
            <div className={styles.Modal_FileContainer}><span className={styles.Modal_fileName}>{doc.name}</span><span className={styles.Modal_FileClose} onClick={() => removeFile(idx)} ><CloseIcon  /></span></div>
        )
    }
    const handleMessage = (e) => {
        setMessage(e.target.value)
        setShowOptions2(false)
    }

    const showToaster = () => {
        getToasterBasedOnType({
            type: 'error',
            message: 'Message should not be empty'
        })
    }
      

    const handleUtilMap = (e, id) => {
        if(id === 'all'){
            if(students.length === selectedStudents.length){
                setSelectedStudents([])
            }else{
                let list = []
            if(students){
                for(let i=0;i<students.length;i++){
                    list.push(students[i].user.id)
                }
                setSelectedStudents(list)
            }
            }
        }else{
            if(selectedStudents.includes(id)){
                const filteredItems = selectedStudents.filter(item => item !== id)
                setSelectedStudents(filteredItems)
            }else{
                setSelectedStudents([...selectedStudents,id])
            }
        }
        const status = e.target.checked
        const tempMap = utilMap
        tempMap.set(id, status)
        setUtilMap(tempMap)
    }

    const handleDrop = () => {
        setShowOptions2(!showOptions2)
    }

    const fileUploader = (e) => {
        let filesUploaded = document.getElementById('inputFile').files
        let files = [...docs,...filesUploaded]
        setDocs(files)
    }

    const closeDropDowns = () => {
    setShowOptions(false)
    setShowOptions2(false)
}
    const sendNotice = async() => {
        setIsSending(true)
        let files = docs
        let attachedfilesIds = []
        const input = {
            type: headingType,
            message: message.trim(),
            scheduledAt: new Date(),                                   
        }
        const receiverIds = selectedStudents
        if( receiverIds && receiverIds.length === 0){
            getToasterBasedOnType({
                type: 'error',
                message: 'No Student Selected'
            })
            setIsSending(false)
        }else{
            if(files.length > 0){
                const fileInfo = {
                    fileBucket: 'python'
                }
                for(let i=0;i<files.length;i++){
                    const file = files[i]
                    const noticeAttachmentObj = {}
                    noticeAttachmentObj["fileName"] = file.name
                    await addNoticeAttachment(noticeAttachmentObj).call().then(async(res) => {
                        const mappingInfo = file && {
                            typeId: res.addNoticeAttachment.id || '',
                            type: 'NoticeAttachment',
                            typeField: 'attachedFile'
                        }
                        attachedfilesIds.push(res.addNoticeAttachment.id)
                        await uploadFile(file, fileInfo, mappingInfo)
                    })
                }
                if(attachedfilesIds.length > 0){
                    addNotice(input, loggedInUser, receiverIds, attachedfilesIds, batchId).then(res => {
                        setIsSending(false)
                        setOpenModal(false)
                    })
                }
            }else{
                addNotice(input, loggedInUser, receiverIds, attachedfilesIds, batchId).then(res => {
                    setIsSending(false)
                    setOpenModal(false)
                })
            }
            files=[]
            setDocs([])
        }
    }
    return(
        <div className={styles.Modal_main}>
            
            <div className={styles.Modal_body}>
                <div className={styles.Modal_header}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <div className={styles.Modal_imageContainer}>
                            {/* <img src={ping} alt='notice' className={styles.Modal_HeaderImage2} /> */}
                            <PingIcon/>
                        </div>
                        <div className={styles.Modal_HeaderTitle}>Send Notice</div>
                    </div>
                    <div onClick={() => setOpenModal(false)} className={styles.Modal_HeaderCross2} >
                        <CloseIcon style={{height: '11px', width: '11px'}} />
                    </div>
                </div>
                <div className={styles.Modal_mid}>
                    <div className={styles.Modal_DropDowns}>
                        <div style={{position: 'relative'}}>
                            <div>
                                <div className={styles.Modal_Label}>Heading Type<span className={styles.Modal_Star}>*</span></div>
                            </div>
                            <div className={styles.Modal_Select} onClick={() => setShowOptions(!showOptions)}>
                                <span>{headingType.charAt(0).toUpperCase()+headingType.slice(1)}</span>
                                <img src={DropDown}  alt='dropdown' className={styles.Module_DropDown} />
                            </div>
                            {showOptions &&
                                <div className={styles.Modal_Options1}>
                                    {options.map((option) => (
                                        <div className={styles.Modal_Option} onClick={() =>clickHandler(option)}>{option}</div>
                                    ))}
                                </div>
                            }             
                        </div>
                        <div style={{position: 'relative'}}>
                            <div>
                                <div className={styles.Modal_Label}>Send To<span className={styles.Modal_Star}>*</span></div>
                            </div>
                            <div className={styles.Modal_Select} onClick={() => handleDrop()}>
                                <span>{selectedStudents.length === students.length ?'All Students' : `${selectedStudents.length} Students` }</span>
                                <img src={DropDown} alt='dropdown' className={styles.Module_DropDown} />
                            </div>
                            {showOptions2 && students && students.length > 0 &&
                                <div className={styles.Modal_Options}>
                                    <div className={styles.Modal_Option} ><input className='checkbox' checked={selectedStudents.length === students.length} name="All" id="All" style={{marginRight: '10px',accentColor:`${getThemeColor()}`}} type="checkbox" onClick={(e) =>handleUtilMap(e,'all')}/>
                                    <label for="All">All Students</label></div>
                                    {students.map((student) => (
                                        <div className={styles.Modal_Option} >
                                        <input onChange={(e) => handleUtilMap(e,student.user.id)} className='checkbox' checked={selectedStudents.includes(student.user.id)} name={student.user.id} id={student.user.id} style={{marginRight: '10px',accentColor:`${getThemeColor()}`}} type="checkbox" />
                                        <label for={student.user.id}>{student.user.name}</label>
                                    </div>
                                    ))}
                                </div>
                            }             
                        </div>
                    </div>
                    <div style={{paddingTop: '21px', paddingBottom: '11px'}}>
                        <input onChange={(e) => fileUploader(e)} type="file" id="inputFile" className={styles.Modal_inputFile} multiple/>
                        <label className={styles.Modal_label} for="inputFile">
                         <div style={{marginLeft: '10px', marginRight: '10px'}} ><AttachmentIcon/></div>Attach Supporting File</label>
                    </div>
                    <div className={styles.Modal_Files}>
                        {docs.map((doc,idx) => (
                            <FileContainer doc={doc} idx={idx} />
                        ))}
                    </div>
                    <div className={styles.Modal_Label} style={{marginTop: '10px'}}>Message<span className={styles.Modal_Star}>*</span></div>
                    <textarea placeholder='Type here' onClick={() => closeDropDowns()} value={message} onChange={(e) => handleMessage(e)} className={styles.Modal_inputMessage1}></textarea>
                </div>
                <div className={styles.Modal_footer}>
                    <button className={styles.Modal_footerButton} onClick={() => message.trim() !== '' ? sendNotice() : showToaster()}>
                    {
                    isSending && (
                      <LoadingSpinner
                        width={'14px'}
                        height={'14px'}
                        color={'white'}
                      />
                    )
                  }
                    <span  style={{marginLeft: '10px'}}>{isSending ? 'Sending':'Send Now'}</span>                 
                </button>
                </div>
            </div>
        </div>
    )
}

export default NoticeModal