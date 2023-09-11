import React, { useState, useEffect } from 'react'
import { GRADES, COURSE, SESSION_STATUS, SECTIONS } from '../../../../constants/timeTable/filterBy'
import { CalenderSvg, CloseSvg } from '../../../../components/svg'
import styles from './FilterModal.module.scss'
import FilterOption from './FilterOption'
import getCourses from '../../../../../../queries/teacherApp/getCourses'
import { sessionStatusMap } from '../../../../constants/timeTable/sessionStatusMap'

const FilterModal = ({ filterOptions, setIsFilterModalVisible, filterOptionsCollection, setFilterOptionsCollection, fetchedCourses, filterClassroomSessionQuery, setFilterClassroomSessionQuery ,students}) => {
    const [filterBy, setFilterBy] = useState(GRADES)
    const [sessionStatusSelected, setSessionStatusSelected] = useState(false)
    const [filterOptionsCollectionCopy, setFilterOptionsCollectionCopy] = useState(filterOptionsCollection)
    const setFilterByAndItsList = (option) => {
        setFilterBy(option)
    }


    
    const applyFilters = () => {
        setFilterOptionsCollection(filterOptionsCollectionCopy)
        let filterQueryObject = {
            grades: [],
            sections: [],
            courses: [],
            sessionStatus: []
        }
        for (const key in filterOptionsCollectionCopy) {
            if (key === GRADES || key === SECTIONS) {
                if(students){
                    filterOptionsCollectionCopy[key].slice(0).forEach((option) => {
                        if (option.isChecked) {
                            key === GRADES ? filterQueryObject.grades.push(option.label.replaceAll(' ', '')) : filterQueryObject.sections.push(option.label)
                        }
                    })
                }else{
                    filterOptionsCollectionCopy[key].slice(1).forEach((option) => {
                        if (option.isChecked) {
                            key === GRADES ? filterQueryObject.grades.push(option.label.replaceAll(' ', '')) : filterQueryObject.sections.push(option.label)
                        }
                    })
                }
               
            }
            if (key === COURSE) {
                filterOptionsCollectionCopy[key].slice(1).forEach((option) => {
                    if (option.isChecked) {
                        filterQueryObject.courses.push(option.id)
                    }
                })
            }
            if (key === SESSION_STATUS) {
                filterOptionsCollectionCopy[key].slice(1).forEach((option) => {
                    if (option.isChecked) {
                        setSessionStatusSelected(true)
                        filterQueryObject.sessionStatus.push(sessionStatusMap[option.label])
                    }
                })
            }

        }

        setFilterClassroomSessionQuery((prev) => ({ ...prev, ...filterQueryObject }))
        setIsFilterModalVisible(false)
    

    }
    const clearAllFilters = () => {
        for (const key in filterOptionsCollectionCopy) {
            const updatedList = filterOptionsCollectionCopy[key].map(obj => ({ ...obj, isChecked: false }))
            
            setFilterOptionsCollectionCopy(prev => ({ ...prev, [key]: updatedList }))
        }
    }

    
    fetchedCourses = fetchedCourses && fetchedCourses.toJS()
    useEffect(() => {
        (async function () {
            try {
                await getCourses()
                if (fetchedCourses) {

                    const modifiedCoursesList = fetchedCourses.map(course => ({ ...course, label: course.title, isChecked: false, key: course.id, id: course.id }))
                    modifiedCoursesList.unshift({ label: 'Select all', isChecked: false })

                    setFilterOptionsCollectionCopy(prev => ({ ...prev, [COURSE]: modifiedCoursesList }))
                }

            } catch (err) {
                console.log(err)
            }
        })()
    }, [fetchedCourses.length])

    const renderOptionTag = (option) => {
        switch (option) {
            case GRADES:
                if(!students) return ' - (1-3),5, (6-8)'
                if(students) return '- (1-12)'

                break
            case SECTIONS:
                if(!students) return '- A-C' 
                if(students) return '-A-F'
                
                break
            case SESSION_STATUS:
                return (<div className={styles.sessionStatusOptionTag}></div>)
            default:
                return
        }
    }

    return <div className={styles.filterModalContainer}>
        <div className={styles.filterModal}>
            <div className={styles.header}>
                <div className={styles.header_headingContainer}>
                    <div className={styles.filterIcon}> <CalenderSvg /></div>
                    <span>Select filter</span>
                </div>
                <div className={styles.closeModalIcon} onClick={() => setIsFilterModalVisible(false)}>
                    <CloseSvg />
                </div>
            </div>
            <div className={styles.body}>
                <div className={styles.body_filterBy}>
                    <ul className={styles.body_filterByListWrapper}>
                        {
                            filterOptions.map(option => <li key={option} onClick={() => setFilterByAndItsList(option)} className={filterBy === option ? `${styles.isActive}` : ` ${styles.filterValue}`}>{option} {renderOptionTag(option)}</li>)
                        }
                    </ul>
                </div>
                <div className={styles.body_filterByOptions}>
                    {filterOptionsCollectionCopy[filterBy].map(option => {
                        return <FilterOption key={option.id} filterBy={filterBy} option={option}
                            filterOptionsCollectionCopy={filterOptionsCollectionCopy} setFilterOptionsCollectionCopy={setFilterOptionsCollectionCopy} />
                    })}
                </div>
            </div>
            <div className={styles.footer}>
                <button className={styles.secBtn} onClick={clearAllFilters}>Clear filters</button>
                <button className={styles.priBtn} onClick={applyFilters}>Apply</button>
            </div>
        </div>

    </div>
}

export default FilterModal