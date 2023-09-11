
import { get } from 'lodash'
import React from 'react'
import config from '../config'
function BookEmbed({bookUrl}) {  
  if(bookUrl){
    const {backgroundColor,backgroundColorFullscreen,hideIssuuLogo,hideShareButton} = config
    const newUrl = `${bookUrl}&backgroundColor=${backgroundColor}&backgroundColorFullscreen=${backgroundColorFullscreen}&hideIssuuLogo=${hideIssuuLogo}&hideShareButton=${hideShareButton}`
    return (
      <iframe
          title='Iframe'
          allow='clipboard-write'
          sandbox='allow-top-navigation allow-top-navigation-by-user-activation allow-downloads allow-scripts allow-same-origin allow-popups allow-modals allow-popups-to-escape-sandbox'
          allowfullscreen='true'
          style={{ width: '100%', height: '100%', border: 'none'}}
          src={newUrl}>    
      </iframe>
    )
  }
  return <div style={{
            width: '100%',
            height: '100%', 
            background: '#efefef', 
          }}
        ></div>
 
}

export default BookEmbed
