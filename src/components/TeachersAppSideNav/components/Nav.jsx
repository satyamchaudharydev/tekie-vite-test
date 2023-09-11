import React from 'react'
import '../SplitScreen.scss'


const Nav = (props) => {

    return <div className="sidenav">
        {props.children}
    </div>
}

export default Nav