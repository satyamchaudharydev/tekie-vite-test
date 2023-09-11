import React from 'react';
import styles from "./qrCodePreview.module.scss"
import qrCodePreviewImg from '../../assets/qrCodePreview.svg'
import extractSubdomain, { isSubDomainActive } from '../../utils/extractSubdomain';
import { teacherAppSubDomains } from '../../constants';
import { get } from 'lodash';
import { Redirect } from 'react-router';

class QRCodePreview extends React.Component{
    constructor(props) {
        super(props);
        this.state = {}
    }
    
    render() {
     
        return (
            <div className={styles.mainContainer}>
                <img
                    src={qrCodePreviewImg}
                    class={styles.responsiveImage}
                    alt='Tekie Responsive'
                ></img>
                <h2 className={styles.somethingCooking}>Coming Soon...</h2>
                <h4 className={styles.stayTunned}>Stay tuned for something Amazing.</h4>
            </div>
        )
    }
}

export default QRCodePreview;