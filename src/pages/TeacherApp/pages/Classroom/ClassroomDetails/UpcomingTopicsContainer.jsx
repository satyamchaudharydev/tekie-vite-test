import { get } from 'lodash'
import React from 'react'
import styles from './classroomDetails.module.scss'
import CompletedSessionCard from './CompletedSessionCard'
import UpcomingTopicCard from './UpcomingTopicCard'

const Header = () => {
    return <div className={styles.headerContainer}>
        <h3>Next up</h3>
        {/* <button className={styles.viewCourseBtn}>View Course</button> */}
    </div>
}
const UpcomingTopicsContainer = (props) => {
    const { upcomingSessions, scrollRef, completedSessions } = props
    const allSessions = [...(completedSessions || []).reverse(), ...upcomingSessions]
    return <div className={styles.upcomingTopicsCarouselContainer}>
        {/* <Header />
        <div style={{ overflowX: 'scroll' }} ref={scrollRef} className={styles.scrollableContainer}>
            {
                allSessions
                    .filter(session => 
                        get(session, 'topicData.classType') !== 'theory' &&
                        get(session, 'classType') !== 'theory'
                    )
                    .map((session, i) => get(session, 'sessionStatus') === 'completed'
                        ? <CompletedSessionCard
                            classType={get(session,'topicData.classType')}
                            session={session}
                            order={i + 1}
                            /> 
                        : <UpcomingTopicCard session={session} order={i + 1} />
                    )
            }
        </div> */}
    </div>
}

export default UpcomingTopicsContainer