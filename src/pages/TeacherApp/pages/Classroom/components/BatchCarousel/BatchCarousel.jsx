import { get } from 'lodash';
import React, { useRef } from 'react'
import ClassroomCard from '../../../Classrooms/ClassroomCard';
import BatchCarouselHeader from './BatchCaouselHeader';
import BatchCard from './BatchCard';
import styles from './batchCarousel.module.scss';


const BatchCarousel = (props) => {

    const scrollableContainerRef = useRef(null)
    const { batchList, isClassNextSessionsLoading, isClassroomDetailsLoading, usingFor } = props

    const batchListSortedByGrades = batchList && batchList.slice().sort((a, b) => {
    const nameA = a.classroomTitle.toUpperCase()
    const nameB = b.classroomTitle.toUpperCase()
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
   });
    const isAccessingTraingClasses = get(props, 'isAccessingTraingClasses', false);
    return <div className={`${styles.batchCarouselContainer} ${usingFor==='classroomsPage' && styles.forClassroomsPage}`}>
        <BatchCarouselHeader usingFor={usingFor} scrollableContainerRef={scrollableContainerRef} batchListLength={batchList.length} grade={batchList[0].uniqueGrade} isAccessingTraingClasses={isAccessingTraingClasses} />
        <div className={styles.carouselCardsContainer}>
            <div ref={scrollableContainerRef} className={`carouselContainer ${styles.scrollableContainer}`}>
            {
                batchListSortedByGrades && batchListSortedByGrades.map(batch =>    usingFor==='reportsPage'?<BatchCard key={batch.id} batch={batch} isClassNextSessionsLoading={isClassNextSessionsLoading} isClassroomDetailsLoading={isClassroomDetailsLoading} />:<ClassroomCard batch={batch} batchesLength={batchListSortedByGrades.length} isAccessingTraingClasses={isAccessingTraingClasses}/> )
            }
            </div>
           
        </div>
    </div>
}

export default BatchCarousel