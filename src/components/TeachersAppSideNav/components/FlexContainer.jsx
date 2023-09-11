import React from 'react'
import '../SplitScreen.scss'



const FlexContainer = (props) => {
    return <div className='flex-container'>
        {props.children}
    </div>
}

export default FlexContainer
