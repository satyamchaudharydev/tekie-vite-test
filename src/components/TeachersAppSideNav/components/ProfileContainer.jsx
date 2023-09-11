import React from 'react'
import '../SplitScreen.scss'



const ProfileContainer = (props) => {
    return <div className='profile-container'>
        {props.children}
    </div>
}

export default ProfileContainer