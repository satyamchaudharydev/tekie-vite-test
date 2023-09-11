import React from 'react'
import TeacherAppTimeGridDayHeader from '../../../../../../components/FullCalendar/components/TeacherAppTimeGridDayHeader'
import { CloseIcon } from '../../../../../../constants/icons'
import { COURSE, GRADES, SESSION_STATUS } from '../../../../constants/timeTable/filterBy'
import { sessionStatusMap } from '../../../../constants/timeTable/sessionStatusMap'
import styles from './AppliedFiltersList.module.scss'
import { ALL_SELECTED, QUERY_KEY_MAP } from '../../constants'

const AppliedFiltersList = ({ filterOptionsCollection, setFilterOptionsCollection, filterClassroomSessionQuery, setFilterClassroomSessionQuery }) => {

    const appliedLabels = []
    const getLabelsList = () => {
        for (let key in filterOptionsCollection) {
            filterOptionsCollection[key].slice(1).forEach((obj) => {
                if (obj.isChecked) {
                    appliedLabels.push({ label: obj.label, id: obj.id, typeKey: key })
                }
            });
        }
    }
    getLabelsList()

    //mapping query Value
    const getQueryValue = (label, value, id) => {
        if (label === GRADES) {
            return value.replaceAll(' ', '')
        }
        if(label === COURSE){
            return id
        }
        if(label === SESSION_STATUS){
            return sessionStatusMap[value]
        }
        return value
    }

    const removeFilterLabel = (filter) => {
        const filterKey = {
            [QUERY_KEY_MAP[filter.typeKey]]: []
        }
        const filterOptionsCollectionCopy = { ...filterOptionsCollection } 
        filterOptionsCollectionCopy[filter.typeKey].forEach(option => {
            if (option.id === filter.id) {
                option.isChecked = false
            }

            if (option.isChecked) {
                if (option.label === ALL_SELECTED) {
                    option.isChecked = false;
                    return null
                }
                filterKey[QUERY_KEY_MAP[filter.typeKey]].push(getQueryValue(filter.typeKey, option.label, option.id)) //pushing the value when we encounter a applied filter
            }
        })
        setFilterOptionsCollection(filterOptionsCollectionCopy)
        setFilterClassroomSessionQuery(prev => ({ ...prev, ...filterKey }))
    }

    //Logic for clearing all filters at one go
    const clearFilters = () => {
        const filterOptionsCollectionCopy = { ...filterOptionsCollection }
        for (const key in filterOptionsCollectionCopy) {
            filterOptionsCollectionCopy[key].forEach(option => option.isChecked = false)
            setFilterOptionsCollection(filterOptionsCollectionCopy)
        }
        setFilterClassroomSessionQuery(prev => ({ ...prev, grades: [], sections: [], courses: [], sessionStatus: [] }))
    }

    //checking if any of the filters are applied
    const ifFilterApplied = () => {
        for (const key in filterOptionsCollection) {
            let filterAppliedFlag
            filterOptionsCollection[key].forEach(option => {
                if (option.isChecked === true) filterAppliedFlag = true
            })
            if (filterAppliedFlag) return true
        }
        return false
    }

    return <div className={styles.filterLabelsAndClassStatusContainer}>
        <div className={styles.filterLabelsContainer}>
            {ifFilterApplied() && <span style={{ fontSize: '14px' }}>Filters</span>}
            <ul className={styles.labelListContainer}>
                {
                    appliedLabels.map(filter => <li onClick={() => removeFilterLabel(filter)} className={styles.filterLabel}>{filter.label} <CloseIcon /></li>)
                }
            </ul>

            {
                appliedLabels && appliedLabels.length > 0 && <div onClick={clearFilters} className={styles.clearAll} role='button'>Clear All</div>
            }
        </div>
        <TeacherAppTimeGridDayHeader
        />
    </div>
}

export default AppliedFiltersList
