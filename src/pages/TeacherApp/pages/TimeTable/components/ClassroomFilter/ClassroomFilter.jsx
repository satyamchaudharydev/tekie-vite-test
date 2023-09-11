import React, { useState,useEffect } from 'react'
import getThemeColor from '../../../../../../utils/teacherApp/getThemeColor'
import ClassroomFilterOption from './components/ClassroomFilterOption'
import styles from './ClassroomFilter.module.scss'
import Dropdown from '../../../../components/Dropdowns/Dropdown'
import fetchClassroomBatches from '../../../../../../queries/teacherApp/fetchClassroomBatches'
import { get } from 'lodash'
import hs from '../../../../../../../src/utils/scale'
export const customStyles = {
  option: (styles) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    fontSize: '13px',
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    minHeight: '32px',
    maxHeight: '32px',
    border: '1px solid #EEEEEE',
    boxShadow: '0 0 0 0px black',
    borderRadius: '8px',
    '&:hover': {
      border: '1px solid #EEEEEE',
      boxShadow: '0 0 0 0px black',
    }
  }),
  placeholder: (styles) => ({
    ...styles,
    fontSize: '13px',
    top: '45%',
    color: 'black',
  }),
  singleValue: (styles) => ({
    ...styles,
    fontSize: '13px',
    top: '45%',
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    padding: '0px 8px 0px',
    // paddingTop:0,
    // paddingRight:hs(10),
    // paddingLeft:hs(10),
    // paddingBottom:0,
    color: '#757575',
    height: '12',
    width: '12',
    '&:hover': {
      color: '#0c0c0c'
    },
    'svg > path': {
      height: hs(20),
    }
  })
}
const newStyles = {
  ...customStyles,
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    fontSize: '14px',
    color: '#282828',
    backgroundColor: isSelected ? getThemeColor() : null,
    '&:hover': {
      backgroundColor: '#f5f5f5',
  },
  }),
  control: (styles) => ({
    ...styles,
    cursor: 'pointer',
    fontFamily: 'Inter',
    minHeight: hs(46),
    maxHeight: hs(46),
    border: '1px solid #EEEEEE',
    boxShadow: '0 0 0 0px black',
    borderRadius: hs(10),
    '&:hover': {
      border: '1px solid #EEEEEE',
      boxShadow: '0 0 0 0px black',
    }
  }),
  placeholder: (styles) => ({
    ...styles,
    fontSize: hs(16),
    top: '50%',
    color: '#282828',
    fontWeight: '400'
  }),
  singleValue: (styles) => ({
    ...styles,
    fontSize: '14px',
    top: '50%',
  }),
  valueContainer: (styles) => ({
    ...styles,
    padding: `0 0 0 ${hs(10)}`
  }),
  input: (styles) => ({
    ...styles,
    color: 'transparent'
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '140px',
    "::-webkit-scrollbar": {
      width: "4px"
    },
    "::-webkit-scrollbar-thumb": {
      background: "#8C61CB"
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#8C61CB"
    },
  })
}


const ClassroomFilter = (props) => {
    const {loggedInUser,fetchedClassrooms,setClassroomFilter}=props

    const modifiedLabel=(str='')=>{
    let section = str.replace('Grade', '').trim()
    if(section) return section
    return ''
  }
  const  modifiedfetchedClassrooms = fetchedClassrooms.map(classroom => ({label: modifiedLabel(get(classroom,'classroomTitle')), value: classroom.id, key: classroom.id }))
useEffect(()=>{
  (async function(){
    try{
      const res = await fetchClassroomBatches(get(loggedInUser, 'id')).call()
    }catch(error){
      console.log(error)
    }
  })()
},[])
  return <div className={styles.classroomFilterContainer}>
    <Dropdown
      components={{ IndicatorSeparator: () => null }}
      placeholder='All Classrooms'
      isMulti={false}
      styles={newStyles}
      options={modifiedfetchedClassrooms}
      isClearable
      isSearchable={false}
      onChange={(classroom) => {
          setClassroomFilter(get(classroom,'value'))
      }}
    ></Dropdown>
  </div>
}

// const ClassroomFilter = () => {
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false)
//   const [selectedClassrooms, setSelectedClassrooms] = useState([])
//   const [utilMap, setUtilMap] = useState(new Map())


//   const handleDrop = () => {
//     setIsDropdownVisible(!isDropdownVisible)
//   }
//   const handleUtilMap = (e, id) => {
//     if (id === 'all') {
//       if (filterOptions.length === selectedClassrooms.length) {
//         setSelectedClassrooms([])
//       } else {
//         let list = []
//         if (filterOptions) {
//           for (let i = 0; i < filterOptions.length; i++) {
//             list.push(filterOptions[i].user.id)
//           }
//           setSelectedClassrooms(list)
//         }
//       }
//     } else {
//       if (selectedClassrooms.includes(id)) {
//         const filteredItems = selectedClassrooms.filter(item => item !== id)
//         setSelectedClassrooms(filteredItems)
//       } else {
//         setSelectedClassrooms([...selectedClassrooms, id])
//       }
//     }
//     const status = e.target.checked
//     const tempMap = utilMap
//     tempMap.set(id, status)
//     setUtilMap(tempMap)
//   }
//   return <>
//     <div style={{ position: 'relative' }}>
//       <div className={styles.Modal_Select} onClick={() => handleDrop()}>
//         <span> All Classrooms </span>
//         {/* <img src={DropDown} alt='dropdown' className={styles.Module_DropDown} /> */}
//         <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
//           width="16" height="16" viewBox="0 0 1333.000000 1280.000000"
//           preserveAspectRatio="xMidYMid meet">
//           <g transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
//             fill="#000000" stroke="none">
//             <path d="M2791 8780 c-203 -60 -363 -228 -416 -435 -19 -76 -19 -214 0 -290 8
// -33 32 -94 51 -135 36 -74 72 -110 1908 -1947 1793 -1793 1874 -1873 1944
// -1907 106 -53 185 -69 317 -63 121 5 183 23 284 83 41 24 556 533 1922 1901
// 1752 1754 1867 1872 1896 1934 45 94 63 174 63 275 0 174 -52 305 -165 420
// -79 80 -120 108 -220 150 -66 27 -78 29 -215 29 -137 0 -149 -2 -215 -29 -38
// -16 -88 -40 -110 -54 -22 -13 -768 -751 -1658 -1640 l-1617 -1617 -1628 1626
// c-1514 1513 -1632 1628 -1692 1657 -36 17 -93 38 -126 46 -85 22 -241 20 -323
// -4z"/>
//           </g>
//         </svg>
//       </div>
//       {isDropdownVisible && filterOptions && filterOptions.length > 0 &&
//         <div className={styles.Modal_Options}>
//           <div className={styles.Modal_Option} ><input className='checkbox' checked={selectedClassrooms.length === filterOptions.length} name="All" id="All" style={{ marginRight: '10px', accentColor: `${getThemeColor()}` }} type="checkbox" onClick={(e) => handleUtilMap(e, 'all')} />
//             <label for="All">All classrooms</label></div>
//           {filterOptions.map((student) => (
//             <div className={styles.Modal_Option} >
//               <input onChange={(e) => handleUtilMap(e, student.user.id)} className='checkbox' checked={selectedClassrooms.includes(student.user.id)} name={student.user.id} id={student.user.id} style={{ marginRight: '10px', accentColor: `${getThemeColor()}` }} type="checkbox" />
//               <label for={student.user.id}>{student.user.label}</label>
//             </div>
//           ))}
//         </div>
//       }
//     </div>
//   </>
// }

export default ClassroomFilter