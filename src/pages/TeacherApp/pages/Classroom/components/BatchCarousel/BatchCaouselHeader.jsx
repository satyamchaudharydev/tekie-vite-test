import { get } from 'lodash';
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from '../../../../../../constants/icons';
import Button from '../../../../components/Button/Button';
import { getGrade } from './BatchCarousel.helpers';
import styles from './batchCarousel.module.scss';

const BatchCarouselHeader = (props) => {
    const [counter, setCounter] = useState(1);
    const { batchListLength, grade, scrollableContainerRef,usingFor } = props;
    
    const scrollCarousel = (direction) => {
        const WIDTH_OF_ONE_CARD = props.scrollableContainerRef.current.scrollWidth / batchListLength //px

        if (direction === 'left') {
            if (counter > 1) {
                setCounter(prev => prev - 1)
            }
            if (counter === 1) {
                return
            } else {
                scrollableContainerRef.current.scrollTo({ left: 1 * (counter - 3) * WIDTH_OF_ONE_CARD, behavior: 'smooth' })
                // console.log('hmm..')
                // scrollableContainerRef.current.style.transform = `translateX(${-1*(counter-2)*WIDTH_OF_ONE_CARD}px)`
            }
        } else {
            if (counter < batchListLength) {
                setCounter(prev => prev + 1)
            }
            scrollableContainerRef.current.scrollTo({ left: 1 * counter * WIDTH_OF_ONE_CARD, behavior: 'smooth' })
            // console.log(-1*counter*WIDTH_OF_ONE_CARD)
            // scrollableContainerRef.current.style.transform = `translateX(${-1*counter*WIDTH_OF_ONE_CARD}px)`
        }
    }
    const navButton = (action) => {
        const sliderHolder = scrollableContainerRef.current
        const eventCards = batchListLength
        let direction = 0
        if (action === 'left') {
            direction = -1
            if (counter > 1) {
                setCounter(prev => prev - 1)
            }
            if (counter === 1) {
                
                return
            }
        } else {
            direction = 1
            if (counter < eventCards) {
                setCounter(prev => prev + 1)
            }
        }

        if (eventCards) {
            let far = sliderHolder.clientWidth / 3 * direction;
            let pos = sliderHolder.scrollLeft + far;
           
            sliderHolder.scrollTo({ left: pos, behavior: 'smooth' })
        }
    }

    const shouldBeDisabled = () => {
        const sliderHolder = scrollableContainerRef.current
        if (sliderHolder) {
            if (sliderHolder.scrollLeft >= sliderHolder.clientWidth / 3) return true
            return false
        }
    }
    const renderSectionHeader = () => {
        if (get(props, 'isAccessingTraingClasses', false)) {
            return grade
        }
        return `Grade ${getGrade(grade)}`
    }

    return <div className={`${styles.batchCarouselHeaderContainer} ${usingFor==='classroomsPage' && styles.forClassrooms}`}>
        <h3 className={`${styles.batchGrade} ${usingFor === 'classroomsPage' && styles.batchGradeForClassroom}`}>{renderSectionHeader()}</h3>
        {batchListLength > 2 && usingFor!=='classroomsPage' && <div className={styles.scrollBtnsContainer}>
            <Button type={'ghost'} onBtnClick={() => scrollCarousel('left')} isDisabled={counter === 1} leftIcon>
                <ChevronLeft color={counter === 1 ? 'grey' : '#504F4F'} />
            </Button>
            <Button type={'ghost'} onBtnClick={() => scrollCarousel('right')} isDisabled={counter === batchListLength} leftIcon>
                <ChevronRight color={counter === batchListLength ? 'grey' : '#504F4F'} />
            </Button>
        </div>}
    </div>
}

export default BatchCarouselHeader

// get(scrollableContainerRef,'current.scrollLeft')===0
// const   navButton = (action) => {
//     let direction = 0
//     if (action === 'right') {
//       direction = 1
//     } else {
//       direction = -1
//     }
//       const sliderHolder = document.querySelector(`.carouselContainer`)
//       const eventCards = batchListLength
//       if (eventCards) {
//         let far = sliderHolder.clientWidth / 3*direction;
//         let pos = sliderHolder.scrollLeft + far;
//         console.log({pos})
//         sliderHolder.scrollTo({ left: pos, behavior: 'smooth' })
//       }
//   }

