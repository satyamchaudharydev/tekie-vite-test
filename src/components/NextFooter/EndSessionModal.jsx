import React from 'react'
import ReactDOM from "react-dom"; 
import { useState } from 'react'
import { get } from 'lodash';
import CredentialsPopup from '../../pages/Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup'
import FeedBackModal from '../StudentFeedback/FeedBackModal'
import { feedbackTypes, getCredentialModalDetails, getLogout } from './utils'

function EndSessionModal(
    {
        visible,
        topicId,
        onSubmit = () => {},
        onCancel = () => {},
        loggedInUser = [],
        dispatch,
        currentTopicComponents,
        ...props
    }
) {
    const [showCredentialModal,setShowCredentialModal] = useState(true)
    const {
        shouldShowCredentialModal,
        getEmail,
        getPassword
        } = getCredentialModalDetails(topicId)

    const renderModal = () => {
        if(shouldShowCredentialModal){
            if(showCredentialModal)
            {
                return <CredentialsPopup
                            email = {getEmail}
                            password = {getPassword}
                            onClickFn = { () => 
                                getLogout()
                            }
                        />
            }
             else{
                   return <FeedBackModal
                                components={currentTopicComponents}
                                topicId={topicId}
                                onSubmit={() => setShowCredentialModal(true)}
                            />
             }     
        }
        else{
            return <FeedBackModal
                        type={feedbackTypes.HOMEWORK}
                        components={currentTopicComponents}
                        topicId={topicId}
                        onSubmit = {() => {
                            getLogout()
                            }
                        }
                >
                </FeedBackModal>
        }
          
    }
    return ReactDOM.createPortal(
        <>
            {visible && renderModal()}        
        </>,
        document.getElementById('root')
    )
    
}

export default EndSessionModal