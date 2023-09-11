import React,{useEffect, useState} from 'react'
import document from '../../../../../../../assets/teacherApp/classDetail/document.svg'
import getPath from '../../../../../../../utils/getPath'
import {get} from 'lodash'
import styles from './NoticeBoard.module.scss'
import { DocumentIcon } from '../../../../../../../constants/icons'

const Announcement = ({notice}) => {
    const[type, setType] = useState('-')
    const[message, setMessage] = useState('-')
    useEffect(()=>{
        if(notice !== undefined){
            if(notice.type !== undefined){
                setType(notice.type)
            }
            if(notice.messageText !== undefined){
                setMessage(notice.messageText)
            }
        }
    })
    const getProfilePic = () => {
        if(notice.sentBy && notice.sentBy.profilePic && notice.sentBy.profilePic.uri){
            return getPath(notice.sentBy.profilePic.uri)
        }else{
            return get(notice, 'sentBy.name','').charAt(0).toUpperCase()
        }
    }
    const openDoc = (url) => {
        window.open(getPath(url))
    }
    const renderFiles = () => {
        if(notice.attachedFiles && notice.attachedFiles.length>0) {
            return(
                <>
                    {notice.attachedFiles.map((file) => (
                        <>
                            {file && file.attachedFile && file.attachedFile.uri && (
                                <button className={styles.doc} onClick={() => openDoc(file.attachedFile.uri)}>
                                <DocumentIcon/>
                                View Doc
                            </button>
                            )}
                        </>
                    ))}
                </>
            )
        }
    }
    return(
        <div className={styles.announcement}>
            <div className={styles.flexbox2}>
                {get(notice, 'sentBy.profilePic.uri', '') !== '' ? (
                    <img className={styles.announcementImg} src={ getProfilePic()} alt='img' />
                ) : (
                    <div className={styles.announcementImg} >{ get(notice, 'sentBy.name','').charAt(0).toUpperCase()}</div>
                )}
             
                <div className={styles.heading1}>{type.charAt(0).toUpperCase()+type.slice(1)}</div>
            </div>
            <p className={styles.paragraph}>{message}</p>
            {
                <div className={styles.docContainer}>
                    { notice.attachedFiles && notice.attachedFiles.length>0 && renderFiles()}
                </div>
            }
        </div>
    )
}

export default Announcement