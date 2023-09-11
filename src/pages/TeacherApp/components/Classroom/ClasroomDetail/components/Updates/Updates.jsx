import React,{useState, useEffect} from 'react'
import { get } from 'lodash'
import styles from './Updates.module.scss'
import LoadingSpinner from '../../../../Loader/LoadingSpinner'
import Icon from '../../../../../../../assets/studentsvg.svg'
import ClassImg from '../../../../../../../assets/b2bLandingPage/CodersJourney/class1-2.png'
import Update from './Update'
import ContentLoader from 'react-content-loader'

const Updates = ({upcomingSessions, upcomingSessionStatus}) => {
    const upcomingSessionsCard = () => {
        if(upcomingSessions.length > 0){
            return(
                <>
                    {upcomingSessions.map((session) => <Update session={session} />)}
                </>
            )
        }
    }
    if(get(upcomingSessionStatus, 'loading', true)){
        return(
            <div className={styles.Updates_main}>
                <LoadingSpinner left='40px' top='7%' height={'24px'} width={'24px'}/>
                <ContentLoader
                    speed={2}
                    width={1340}
                    height={394}
                    viewBox="0 0 340 84"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    >
                    <rect x="10" y="0" rx="3" ry="3" width="117" height="31" />
                    <rect x="136" y="0" rx="3" ry="3" width="117" height="31" />
                </ContentLoader>
            </div>
        )
    }else{
        if(get(upcomingSessionStatus, 'success', true)){
            return(
                <div className={styles.Updates_main}>
                    {upcomingSessions.length === 0 ? (
                        <div className={styles.Updates_noUpdates}>No New Updates</div>
                    ) : (
                        <>
                            <div className={styles.Updates_heading}>Upcoming Sessions</div>
                            <div className={styles.Updates_updates}>
                                {upcomingSessionsCard() }
                            </div>
                        </>
                    )}
                </div>
            )
        }
    }
   
}

export default Updates