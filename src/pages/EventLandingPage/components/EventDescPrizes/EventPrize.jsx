import { get } from 'lodash';
import React from 'react';
import getPath from '../../../../utils/getPath';
import DescriptionsSkeleton from '../../pages/EventDescription/DescriptionsSkeletons';
import './style.scss'

const suffix = {
    1: 'st',
    2: 'nd',
    3: 'rd',
    all: 'th'
}

const EventPrize = (props) => {

    const getSuffix = (position) => {
        if ([1,2,3].includes(position)) return suffix[position]
        else return suffix['all']
    }
    if (!get(props, 'isEventDataFetching', false) && !get(props, 'data.prizes', []).length) return null
    return (
        <div className="EventPrize_base">
            {get(props, 'isEventDataFetching', false) ?
                <div className='EventPrize_Head'><DescriptionsSkeleton forSection='eventDetails-text' /></div> :
                <div className='EventPrize_Head'>Prizes</div>}
            <div className='row EventPrize_stack'>
                {get(props, 'isEventDataFetching', false) && (
                    Array(3).fill().map((_, i) => (
                        <DescriptionsSkeleton forSection='eventDetails-prizes' />
                    ))
                )}
                {!get(props, 'isEventDataFetching', false) && get(props, 'data.prizes', []).length > 0 && get(props, 'data.prizes', []).map((entry, index) => {
                    if (index > 2) return <></> 
                    if (index === 0 ) {
                        const { minRank, maxRank } = entry
                        return (
                            <div className='gift-card event-active'>
                                <div 
                                    className='gift-bg-1-event'
                                    style={{ 
                                        background: `url(${getPath(get(entry, 'image.uri'))})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                >
                                </div>
                                <div className='gift-card-number'>{maxRank === minRank ? index + 1: `${minRank}-${maxRank}`}
                                    <span>{maxRank === minRank ? getSuffix(index + 1): getSuffix(maxRank)}</span>
                                </div>
                                <div className='gift-bottom-text'>{get(entry, 'title')}</div>
                            </div>
                        )
                    } else if (index !== 0 ) {
                        const { minRank, maxRank } = entry
                        return (
                            <div className='gift-card'>
                                <div 
                                    className='gift-bg-2'
                                    style={{ 
                                        background: `url(${getPath(get(entry, 'image.uri'))})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                >
                                </div>
                                <div className='gift-card-number'>{maxRank === minRank ? index + 1: `${minRank}-${maxRank}`}
                                    <span>{maxRank === minRank ? getSuffix(index + 1): getSuffix(maxRank)}</span>
                                </div>
                                <div className='gift-bottom-text'>{get(entry, 'title')}</div>
                            </div>
                        )
                    }
                    return <></>
                })}
            </div>
            <div className='row EventPrize_stack'>
                {!get(props, 'isEventDataFetching', false) && get(props, 'data.prizes', []).length > 0 && get(props, 'data.prizes', []).map((entry, index) => {
                    if (index <= 2) return <></>
                    if (index === 0 ) {
                        const { minRank, maxRank } = entry
                        return (
                            <div className='gift-card event-active'>
                                <div 
                                    className='gift-bg-1'
                                    style={{ 
                                        background: `url(${getPath(get(entry, 'image.uri'))})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                >
                                </div>
                                <div className='gift-card-number'>{maxRank === minRank ? index + 1: `${minRank}-${maxRank}`}
                                    <span>{maxRank === minRank ? getSuffix(index + 1): getSuffix(maxRank)}</span>
                                </div>
                                <div className='gift-bottom-text'>{get(entry, 'title')}</div>
                            </div>
                        )
                    } else if (index !== 0 ) {
                        const { minRank, maxRank } = entry
                        return (
                            <div className='gift-card'>
                                <div 
                                    className='gift-bg-2'
                                    style={{ 
                                        background: `url(${getPath(get(entry, 'image.uri'))})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat'
                                    }}
                                >
                                </div>
                                <div className='gift-card-number'>{maxRank === minRank ? index + 1: `${minRank}-${maxRank}`}
                                    <span>{maxRank === minRank ? getSuffix(index + 1): getSuffix(maxRank)}</span>
                                </div>
                                <div className='gift-bottom-text'>{get(entry, 'title')}</div>
                            </div>
                        )
                    }
                    return <></>
                })}
            </div>
        </div>
    )
}

export default EventPrize;