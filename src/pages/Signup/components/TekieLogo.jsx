import React from 'react'
import Logo from "./../../../assets/tekieLogo.png"
import MobileLogo from "./../../../assets/tekieSmallLogo.png"
import '../schoolLiveClassLogin/schoolLiveClassLogin.scss'

export const TekieLogo = ({className}) => {
 
  return <picture>
        <source className={'tekie-logo'} srcset={MobileLogo} media="(max-width: 699px)" />
        <img className={'tekie-logo'} src={Logo} alt="Your Company Logo" />
    </picture>
  
}
