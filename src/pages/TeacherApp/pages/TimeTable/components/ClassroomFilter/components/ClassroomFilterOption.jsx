import React from 'react'
import styles from '../ClassroomFilter.module.scss'
const ClassroomFilterOption=({option={}})=>{

    return <label className={styles.filterOptionWrapper} style={{ display: 'block' }}>
    <input value={option.value} checked={option.isChecked} type='checkbox' onChange={(e) => console.log('hmmm')} className={styles.filterByOptionCheckbox} id={option.id} />
    {option.label}
    
</label>
}

export default ClassroomFilterOption