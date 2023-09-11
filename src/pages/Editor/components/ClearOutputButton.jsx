import React from 'react'
function ClearOutputButton({clearInterpretor}) {
  return (
    <button className='output--clear-btn' onClick={() => clearInterpretor()}>
        Clear output
    </button>
  )
}

export default ClearOutputButton