import React from 'react'
import styles from '../style.module.scss'
import Dropdown from '../../TeacherApp/components/Dropdowns/Dropdown'
import { videoFiltersOptions } from '../utils'
import bannerBg from '../../../assets/learn/banner.png'
import melAndConji from '../../../assets/learn/melAndConji.png'

console.log(Object.keys(videoFiltersOptions), "filter")
export const Banner = ({onChangeFilter = () => {}}) => {
  return (
        
    <div className={styles.banner} style={{
        background: `url(${bannerBg})`
    }}>
        <div className={styles.banner__content} >
            <img src={melAndConji} className={styles.banner__img} alt='banner' />
            <h1 className={styles.banner__title}>Learning Videos</h1>
        </div>
        <div className={styles.filterDropdown}>
            <Dropdown
                components={{ IndicatorSeparator: () => null }}
                isMulti={false}
                placeholder={'All Videos'}
                className='classHome-select'
                classNamePrefix='classHome-select'
                isSearchable={false}
                defaultValue={{label:'All Videos',value:'video'}}
                options={Object.values(videoFiltersOptions)}
                onChange={
                    (option) => {
                        onChangeFilter(option.value)
                    }
                }
                
                />
        </div>
    </div>
  )
}
