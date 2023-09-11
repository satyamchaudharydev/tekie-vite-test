import React from 'react'
import { sessionStatusMap } from '../../../../constants/timeTable/sessionStatusMap';
import styles from './FilterModal.module.scss'

const FilterOption = ({ option, filterBy, filterOptionsCollectionCopy, setFilterOptionsCollectionCopy }) => {

    let filterOptionsListToUpdate;
    let statusTagStyles = {
        backgroundColor: option.tagColor
    }
    const areAllOptionsCheckedExceptSelectAll = (filterOptionsListToUpdate) => {
        const areSomeUnchecked = filterOptionsListToUpdate.find(option => {
            return !option.isChecked && option.label !== 'Select all'
        })
        if (areSomeUnchecked) return false
        return true
    }

    const isSelectAllChecked = (filterOptionsListToUpdate) => {
        return filterOptionsListToUpdate[0].isChecked
    }

    const areAllOptionsChecked = (filterOptionsListToUpdate) => {
        const areSomeUnchecked = filterOptionsListToUpdate.find(option => !option.isChecked)
        if (areSomeUnchecked) return false
        return true
    }

    const selectFilter = (label) => {

        filterOptionsListToUpdate = filterOptionsCollectionCopy[filterBy]

        if (isSelectAllChecked(filterOptionsListToUpdate) && label !== 'Select all') {
            const updatedOptionsList = filterOptionsListToUpdate.map(option => {
                if (option.label === 'Select all') {
                    return { ...option, isChecked: false }
                } else {
                    if (option.label === label) return { ...option, isChecked: !option.isChecked }
                    return option
                }

            })
            setFilterOptionsCollectionCopy({ ...filterOptionsCollectionCopy, [filterBy]: updatedOptionsList })
            return
        }

        if (label === 'Select all') {

            if (areAllOptionsChecked(filterOptionsListToUpdate)) {
                const updatedOptionsList = filterOptionsListToUpdate.map(option => ({ ...option, isChecked: false }))
                setFilterOptionsCollectionCopy({ ...filterOptionsCollectionCopy, [filterBy]: updatedOptionsList })
                return
            }
            const updatedOptionsList = filterOptionsListToUpdate.map(option => ({ ...option, isChecked: true }))
            setFilterOptionsCollectionCopy({ ...filterOptionsCollectionCopy, [filterBy]: updatedOptionsList })
            return
        }

        const updatedOptionsList = filterOptionsListToUpdate.map(option => {
            if (option.label === label) return { ...option, isChecked: !option.isChecked }
            return option
        })

        if (areAllOptionsCheckedExceptSelectAll(updatedOptionsList)) {
            const updatedOptionsList = filterOptionsListToUpdate.map(option => ({ ...option, isChecked: true }))
            return setFilterOptionsCollectionCopy({ ...filterOptionsCollectionCopy, [filterBy]: updatedOptionsList })
        }
        setFilterOptionsCollectionCopy({ ...filterOptionsCollectionCopy, [filterBy]: updatedOptionsList })
    }

    const getOptionValue = (option) => {
        if (filterBy === 'Grades' || filterBy === 'Sections') {
            return option.value
        }
        if (filterBy === 'Course') {
            return option.id
        }
        if (filterBy === 'Session status') {
            return sessionStatusMap[option.label]
        }
    }

    const isSessionStatusActiveOption = () => {
        return filterBy === 'Session status' && option.label !== 'Select all'
    }

    return <label className={styles.filterOptionWrapper} style={{ display: 'block' }}>
        <input value={getOptionValue(option)} checked={option.isChecked} type='checkbox' onChange={(e) => selectFilter(option.label)} className={styles.filterByOptionCheckbox} id={option.id} />
        {option.label}
        {isSessionStatusActiveOption(option) && <div className={styles.statusTag} style={statusTagStyles}></div>}
        
    </label>
}

export default FilterOption