import React,{useState, useEffect} from "react"
import "./SessionDetails.scss"
import {get} from 'lodash'
import { withHttps } from "../../../../../EventLandingPage/constants"
import TotalStudentIcon from "../../../../../../assets/teacherApp/classroom/Ratio.svg"
import {CalendarIcon2,UploadIcon} from '../../../../../../constants/icons'
import TypeIcon from "../../../../../../assets/teacherApp/classroom/type.svg"
import RecordingIcon from "../../../../../../assets/teacherApp/classroom/recording.svg"
import Modal2 from '../../../Modal/Modal2'
import { Toaster, getToasterBasedOnType } from '../../../../../../components/Toaster'
import updateRecordingLink from '../../../../../../queries/teacherApp/courseDetailPage/uploadRecordingLink'


const SessionDetails = ({session, students, tags,getUpdatedBatchSession}) => {
    const[status, setStatus] = useState('')
    const[uploadModal, setUploadModal] = useState(false)
    const[link,setLink] = useState('')
    const[newTags, setnewTags] = useState([])
    useEffect(() => {
        setStatus(session.sessionStatus)

        // setNewTags([get(session, 'sessionMode'),...tags])
    })
    const Tag = ({value}) => {
        return(
            <div className={"Course_tag"}>
                {value}
            </div>
        )
    }

    const uploadLink = () => {
        if(link === '' || link.trim() === ''){
            blankLinkMessage()
        }else{
            updateRecordingLink(session.id,link.trim()).then(res => {
                getUpdatedBatchSession(res.updateBatchSession)
                setUploadModal(false)
            })
        }
    }
    const renderLinkDiv = () => {
            if(session){
                if(session.sessionRecordingLink  !== null && session.sessionRecordingLink  !== ''){
                    return(
                        <div className="sessions_recording" onClick={() => window.open(withHttps(get(session,'sessionRecordingLink',''), "_blank"))}>View Recording</div>
                    )
                }else if(session.sessionRecordingLink  === null || session.sessionRecordingLink !== ''){
                    return(
                        <div className="sessions_recording" onClick={() => setUploadModal(true)}>Upload Recording</div>
                    )
                }
            }
    }

    const renderInput = () => {
        return(
            <div>
                <div className="modal_Link_heading">Please add the link for the class recording.</div>
                <input className="modal_link_input" type='text' placeholder="Link..." value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
        )
    }

    const blankLinkMessage = () => {
        getToasterBasedOnType({
            type: 'error',
            message: 'Provide a valid link',
        })
    }
    return <>
        {uploadModal === true && (
            <Modal2
                heading="Upload Link"
                headerIcon={CalendarIcon2}
                setModalVisibility={setUploadModal}
                footerWithTwoBtns={true}
                secBtnText="Cancel"
                priBtnText="Upload Link"
                clickHandler={uploadLink}
                clickHandler2={()=> setUploadModal(false)}
                isLoading={false}
                loadingText='Uploading...'
                widthFull={true}
                children={renderInput()}
                type="2"
                footerBtnIcon={UploadIcon}
            />
        )}
        
        <section className="Session_details_container">
           <div className="session_details">Session Details</div>
           <div style={{display: 'flex'}}>
               <div style={{display: 'flex', marginRight: '61px'}}>
                    <img className="session_icon" style={{marginRight:"10px"}}src={TotalStudentIcon} />
                    <div>
                        <div className="sessions_heading1">Total Students</div>
                        <div className="sessions_heading2">{students}</div>
                    </div>
               </div>
               <div style={{display: 'flex', marginRight: '61px'}}>
                    <img className="session_icon"  style={{marginRight:"10px"}}src={TypeIcon} />
                    <div>
                        <div className="sessions_heading1">Type</div>
                        <div className={"Course_tags"}>
                            {get(session, 'sessionMode','') !== '' && <Tag value={get(session, 'sessionMode','')} />}
                            {newTags.map((tag) => <Tag value={tag} />)}
                        </div>
                    </div>
               </div>
               {status === 'completed' && (
                    <div style={{display: 'flex'}}>
                        <img className="session_icon"  style={{marginRight:"10px"}}src={RecordingIcon} />
                        <div>
                            <div className="sessions_heading1">Recording</div>
                            {renderLinkDiv()}
                        </div>
                     </div>
               )}
           </div>
        </section>
    
    </>
}
export default SessionDetails