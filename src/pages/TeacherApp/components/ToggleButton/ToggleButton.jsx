import React from 'react'
import './toggleButtonStyles.scss'

const ToggleButton = (props) => {
  
  const handleToggleClick = () => {
    props.toggleClickHandler(props.elemData)
  }

  return (
    <div 
      class={props.className ? props.className : 'modal__teacher-admin-toggle-container'}
      onChange={() => handleToggleClick()}>
      <label class="toggle-control">
        <input type="checkbox" checked={props.checked ? true: false}></input>
        <span class="control"></span>
      </label>
    </div>
  )
}

export default ToggleButton