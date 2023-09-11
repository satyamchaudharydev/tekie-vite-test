import React from 'react'
import '../SplitScreen.scss'



const UserDetails = (props) => {
    return <div className='user-details'>
        {props.children}
    </div>
}

export default UserDetails
