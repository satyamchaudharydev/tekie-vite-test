import React from 'react'
import './CollapsibleTopics.scss'
import { SearchIcon } from '../../constants/icons'

const EmptyState = ({text}) => {
  return (
    <div className={'noSessionsEmptyStateContainer'}>
    <div>
        <div className={'noSessionsIconContainer'}>
            <SearchIcon height='36' width='36' color='#d6d6d6' />
        </div>
        <p className='noSessionsText'>{text}</p>
    </div>
</div>
  )
}

export default EmptyState