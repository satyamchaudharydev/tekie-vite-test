import React,{useState, useEffect} from "react"
import "./InviteLink.scss"
import { Toaster,getToasterBasedOnType } from '../../../../../../components/Toaster/Toaster'
import CopyIcon from "../../../../../../assets/teacherApp/classroom/file-copy-line.svg"
import EditIcon from "../../../../../../assets/teacherApp/classroom/edit.svg"
import SaveIcon from "../../../../../../assets/save.svg"
import updateSessionLink from "../../../../../../queries/teacherApp/courseDetailPage/updateSessionLink"


const  InviteLink = ({customSessionLink, batchId, setCustomSessionLink, selectedSession}) =>{
    const[link, setLink] = useState('');
    const[disable,setDisable] = useState(true)
    useEffect(() => {
        if(customSessionLink !== ''){
            setLink(customSessionLink)
        }
    },[customSessionLink])

    const handleLink = (e) => {
        setLink(e.target.value)
    }
    const  copyText = () => {
        var copyText = document.getElementById("myInput");
        copyText.select();
        document.execCommand("copy");
        getToasterBasedOnType({
            type: 'success',
            message: 'Session Link Copied',
            className: 'teacher-app-theme'
        })
      }

    const saveLink = async() => {
        if(link === '' || link.trim() ===''){
            getToasterBasedOnType({
                type: 'error',
                message: 'Provide a valid link'
            })
            setLink('')
        }else{
            await updateSessionLink(batchId, link).then(res => {
                if(res.updateBatch && res.updateBatch.customSessionLink){
                    setCustomSessionLink(res.updateBatch.customSessionLink)
                    getToasterBasedOnType({
                        type: 'success',
                        message: 'Session Link Saved',
                        className: 'teacher-app-theme'
                    })
                    setDisable(true)
                }else{
                    getToasterBasedOnType({
                        type: 'error',
                        message: 'Failed'
                    })
                }
            })
        }
    }
    const editLink = async() => {
        setDisable(false)
    }
    return <div className={selectedSession.sessionStatus === 'started'  ?'' :"invite_link_main"}>

        <div class="invite_link_heading">Invite Link</div>
        <section className="Invite_link_container">
           <div className={disable ? "link_container" : "link_container_able" }>
           <input id="myInput" className={disable ? "input_invite_link" : "input_invite_link" } value={link} onChange={(e) => handleLink(e)} disabled={disable} />  
            <button onClick={() => copyText()} className="copy_link_button"><img style={{marginRight:"6px"}} src={CopyIcon}/>Copy link</button>
           </div>

           <button onClick={() => disable ? editLink() : saveLink()} className="Invite_link_edit_button">
               {disable === true ? (
                   <>
                    <span style={{paddingTop: '2px'}}><img style={{marginRight:"6px"}} src={EditIcon}/></span> <span className="video_detail_button_text">Edit</span>
                   </>
               ):(
                <>
                    <span style={{paddingTop: '2px'}}><img style={{marginRight:"6px"}} src={SaveIcon}/></span> <span className="video_detail_button_text">Save</span>
                </>
               )}
            </button>
           
        </section>
    
    </div>
}
export default InviteLink