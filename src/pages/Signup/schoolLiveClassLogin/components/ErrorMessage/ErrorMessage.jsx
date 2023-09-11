import React from 'react';
import { InformationCircle, XCircle } from '../../../../../constants/icons';
import classes from './ErrorMessage.module.scss'

export default function ErrorMessage({ message, informationCircle, withCrossIcon=false }){
    return <div className={classes['school-live-class-login-wrongCodeText']} style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:'8px',visibility: message ? 'visible' : 'hidden'}}>
        {informationCircle && <div style={{display:'flex',alignItems:'center',fill:'yellow'}} className={classes['school-live-class-login-warning']}>
        <InformationCircle/>
        </div>}
        {withCrossIcon && <div style={{display:'flex',alignItems:'center'}}>
        <XCircle/>
        </div>}
        <p style={{ visibility: message ? 'visible' : 'hidden', color:informationCircle?'#FAAD14':'' }}>{message}</p>
    </div>
}
