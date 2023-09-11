import { get } from 'lodash';
import React, { useState } from 'react'
import Select, { components } from "react-select"
import hs from '../../../../../../utils/scale';
import getThemeColor from '../../../../../../utils/teacherApp/getThemeColor';
import Button from '../../../../components/Button/Button';
import { customStyles } from '../../../../components/Dropdowns/Dropdown'
import { getUniqueGrades } from '../../Home/Homepage.helpers';
import styles from './header.module.scss'

const FORCE_ADMIN_PRIV_COUNT = 5

const newStyles = {
    ...customStyles,
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        cursor: 'pointer',
        backgroundColor: isSelected ? getThemeColor() : null,
        '&:hover': {
            backgroundColor: '#f5f5f5',
            color: '#000',
        },
        display: 'block',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    }),
    control: (styles) => ({
        ...styles,
        cursor: "pointer",
        fontFamily: "Inter",
        minHeight: "36px",
        maxHeight: "36px",
        border: "1.4px solid #AAAAAA !important",
        boxShadow: "0 0 0 0px black",
        borderRadius: "8px",
        "&:hover": {
            border: `1.4px solid ${getThemeColor()}`,
            boxShadow: "0 0 0 0px black",
        },
    }),
    placeholder: (styles) => ({
        ...styles,
        fontSize: `${hs(16)}!important`,
        color: "#333333 !important",
        fontWeight: "400",
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        paddingTop: '3.5px',
        paddingLeft: '8px',
        paddingRight: '0',
        color: "#AAA",
        position: 'relative',
        transform: 'translateX(-5px)',
        "&:hover": {
            color: "#AAA",
        },
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        backgroundColor: 'transparent'
    }),
    input: (styles) => ({
        ...styles,
        color: "transparent",
    }),
};

//check box options for multi select filter
const Option = props => {
    return (
        <>
            <div>
                <components.Option {...props}>
                    <div className={styles.optionContainer} style={{ display: 'flex', alignItems: 'center' }}>
                        <input checked={props.selectProps.filterByBatches.includes(props.value)} className={styles.checkbox} id={props.data.value} type={'checkbox'} value={props.data.value} />
                        <label htmlFor={props.data.value} >{props.data.label}</label>
                    </div>
                </components.Option>
            </div>
        </>
    );
};

const Header = ({ fetchedClassrooms, filterByBatches, setFilterByBatches, setShowAddClassModal = () => { } }) => {
    const [forceAllowCount, setForceAllowCount] = useState(0)
    let modifiedfetchedClassrooms = []
    const uniqueGrades = getUniqueGrades(fetchedClassrooms)
    if (uniqueGrades && uniqueGrades.size) {
       uniqueGrades.forEach(grade => modifiedfetchedClassrooms.push({ label: 'Grade ' + grade, value: grade, key: grade }))
    }
    const filterTeacherBatchesData = (gradeNumber) => {
        if(!gradeNumber) return setFilterByBatches([])
        if (gradeNumber) {
           const allBatchIdsOfSelectedGradeNumber = fetchedClassrooms.filter(classroom => {
                
                if (classroom.grade === gradeNumber) return classroom
                return false
           }).map(classroom => get(classroom, 'groupId'))
            
            if (allBatchIdsOfSelectedGradeNumber.length) {
                setFilterByBatches(allBatchIdsOfSelectedGradeNumber)
            }
        }
    }
   //Code for multi select filter
    // const modifiedfetchedClassrooms = fetchedClassrooms.map(classroom => ({ label: get(classroom, 'classroomTitle'), value: classroom.id, key: classroom.id }))

    // const filterTeacherBatchesData=(batch=[])=>{
    //     if(batch.length){
    //         if(filterByBatches.includes(get(batch[0],'value'))){
    //             const filteredBatches = filterByBatches.filter(batchId=>batchId!==get(batch[0],'value'))
    //             setFilterByBatches(filteredBatches)
    //         }else{
    //             setFilterByBatches([...filterByBatches,get(batch[0],'value')])
    //         }
    //     }
    // }
    return <div className={styles.headerContainer}>
        <div className={styles.classroomHeaderTitle}>
            <h1 className={styles.heading}
                // onClick={() => forceAllowCount >= FORCE_ADMIN_PRIV_COUNT ? null : setForceAllowCount(forceAllowCount + 1)}
            >Class-wise Reports</h1>
            {/* {forceAllowCount >= FORCE_ADMIN_PRIV_COUNT ?
                <Button text={'Add Classroom'} onBtnClick={() => setShowAddClassModal()} />
                : null} */}
        </div>
        <div className={styles.filterContainer}>
            <p>Filter by</p>
            <div className={styles.dropDownContainer}>
                <Select
                    // components={{ Option }}
                    components={{ IndicatorSeparator: () => null }}
                    placeholder='All Classrooms'
                    isMulti={false}
                    className='classHome-select'
                    classNamePrefix='classHome-select'
                    styles={newStyles}
                    isSearchable={false}
                    isClearable
                    options={modifiedfetchedClassrooms}
                    onChange={(batch, action) => {
                        filterTeacherBatchesData(get(batch, 'value'))
                    }}
                ></Select>
            </div>
        </div>
    </div>
}

export default Header