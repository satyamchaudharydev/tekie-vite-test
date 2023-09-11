import React from 'react'
import '../../components/EventDescOverview/style.scss'
import './DescriptionSkeletons.scss'
import '../../components/EventDescPrizes/style.scss'
import '../../components/Carousel/MainCarousel'
import ContentLoader, { List } from 'react-content-loader'

const DescriptionsSkeleton = ({ forSection }) => {
    if (forSection === 'eventName') {
        return (
            <ContentLoader
                className="eventName-loader"
                speed={2}
                style = {{
                    borderRadius: '5px',
                }}
                backgroundColor={'#00ade6'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
        )
    }
    if (forSection === 'eventSummary') {
        return (
            <ContentLoader
                className="eventSummary-loader"
                speed={2}
                style = {{
                    borderRadius: '5px',
                }}
                backgroundColor={'#00171e'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
        )
    }
    if (forSection === 'eventDetails') {
        return (
            <ContentLoader
                className="eventDetails-loader"
                speed={2}
                style = {{
                    borderRadius: '5px',
                }}
                backgroundColor={'#00171e'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
        )
    }
    if (forSection === 'registerButton') {
        return (
            <div className="eventRegisterButton-loader">
                <ContentLoader
                    speed={2}
                    backgroundColor={'#00ade6'}
                    foregroundColor={'#dbdbdb'}
                >
                    <rect x='0' y='0' width='100%' height='100%' />
                </ContentLoader>
            </div>
        )
    }
    if (forSection === 'overviewDetails') {
        return (
            <List
                speed={2}
                className='eventOverview-details'
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </List>
        )
    }
    if (forSection === 'eventDetails-text') {
        return (
            <ContentLoader
                speed={2}
                className='eventDetails-text'
                height={30}
                style={{borderRadius: '10px'}}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
        )
    }
    if (forSection === 'eventDetails-prizes') {
        return (
            <ContentLoader
                speed={2}
                className='eventDetails-giftCard'
                style={{borderRadius: '10px'}}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
        )
    }
    if (forSection === 'speakerSection') {
        return (
            <ContentLoader
                speed={2}
                className='eventDetails-speakerSection'
                style={{ borderRadius: '10px', margin: '10px auto' }}
                height={150}
                width={400}
                backgroundColor={'#f5f5f5'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
        )
    }
    if (forSection === 'eventDetails-joinReason') {
        return (
            <ContentLoader
                className="eventDetails-joinReason-loader"
                speed={2}
                style = {{
                    borderRadius: '5px',
                }}
                backgroundColor={'#00171e'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
        )
    }
    if (forSection === 'eventDetails-joinReasonBox') {
        return (
            <ContentLoader
                className="eventDetails-joinReason-boxLoader"
                speed={2}
                style = {{
                    borderRadius: '5px',
                }}
                backgroundColor={'#00171e'}
                foregroundColor={'#dbdbdb'}
            >
                <rect x='0' y='0' width='100%' height='100%' />
            </ContentLoader>
        )
    }
    return (
        <>
            <div 
                className="EventOverview_base"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }}
            >
                <ContentLoader
                    className="titles"
                    speed={2}
                    style = {{
                        borderRadius: '10px',
                    }}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    <rect x='0' y='0' width='100%' height='100%' />
                </ContentLoader>
                <ContentLoader
                    className="EventOverview_Desc"
                    speed={2}
                    style = {{
                        borderRadius: '10px',
                    }}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    <rect x='0' y='0' width='100%' height='100%' />
                </ContentLoader>
            </div>
            <div 
                className="EventOverview_base"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }}
            >
                <ContentLoader
                    className="titles"
                    speed={2}
                    style = {{
                        borderRadius: '10px',
                    }}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    <rect x='0' y='0' width='100%' height='100%' />
                </ContentLoader>
            </div>
            <div className="row EventPrize_stack">
                <ContentLoader 
                    className="gift-card"
                    speed={4}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    {
                        <rect x="0" y="0"  width="100%" height="100%" />
                    }   
                </ContentLoader>
                <ContentLoader 
                    
                    className="gift-card"
                    speed={4}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    {
                        
                        <rect x="0" y="0"  width="100%" height="100%" />
                    }   
                </ContentLoader>
                <ContentLoader 
                    
                    className="gift-card"
                    speed={4}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    {
                        
                        <rect x="0" y="0"  width="100%" height="100%" />
                    }   
                </ContentLoader>
            </div>
            <div 
                className="EventOverview_base"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }}
            >
                <ContentLoader
                    className="titles"
                    speed={2}
                    style = {{
                        borderRadius: '10px',
                    }}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    <rect x='0' y='0' width='100%' height='100%' />
                </ContentLoader>
            </div>
            <div className="row EventPrize_stack">
                <ContentLoader 
                    className="gift_card__speakers_1"
                    speed={4}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    {
                        <rect x="0" y="0"  width="100%" height="100%" />
                    }   
                </ContentLoader>
                <ContentLoader 
                    
                    className="gift_card__speakers_2"
                    speed={4}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                >
                    {
                        <rect x="0" y="0"  width="100%" height="100%" />
                    }   
                </ContentLoader>
            </div>
        </>
    )
}

export default DescriptionsSkeleton
