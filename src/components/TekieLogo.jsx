import React from 'react'
import Logo from '../assets/tekieLogo.png'
import MobileLogo from '../assets/tekieSmallLogo.png'


export const TekieLogo = ({className}) => {
  return <>
    <picture className={className}>
        <source srcset={MobileLogo} media="(min-width: 1200px)" />
        <source srcset={Logo} />
        <img src={Logo} alt="Tekie Logo" />
    </picture>
    </>
  
}
