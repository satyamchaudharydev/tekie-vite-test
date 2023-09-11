import React from 'react';
import FBLogo from '../../../../assets/fb-logo-new.png'
import whatsapp from '../testimonial/whatsapp.png'
import { facebook_link, whatsapp_link } from "../../../../config"
import './JoinTrib.styles.scss'

const JoinTrib = () => {
    return (
        <div className='JoinTrib-top'>
            <div className="JoinTrib_base">
                <div className='content-container-trib'>
                    <p className="JoinTrib_head">Join our Tribe </p>
                    <p className="JoinTrib_desc">Get the latest information about all courses and events at Tekie.</p>
                </div>
                <div className='button-container-trib'>
                    <a style={{ textDecoration: "none" }} rel="noopener noreferrer" target='_blank' href={whatsapp_link}>
                        <button className="JoinTrib_whatsapp">
                            <img src={whatsapp} alt='whatsapp' className='wa-image' />
                            <span className='WhatsApp'>WhatsApp</span>
                        </button>
                    </a>
                    <a style={{ textDecoration: "none" }} rel="noopener noreferrer" target='_blank' href={facebook_link}><button className="JoinTrib_discord"><img src={FBLogo} alt='Dis' className='fb-image' /><span className='FaceBook'>Facebook</span></button></a>
                </div>
            </div>
        </div>
    )
}

export default JoinTrib;