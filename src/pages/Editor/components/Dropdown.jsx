import React from 'react'
import { useState } from 'react'
import '../dropdown.scss'
import {motion} from 'framer-motion'
import { useEffect } from 'react'

function Dropdown({title,list,onChange,itemIcon = false}) {
    const [open, setOpen] = useState(false)
    const [headerTitle, setHeaderTitle] = useState("")
    const [currentSelectItem,setCurrentSelectItem] = useState(null)
    useEffect(() => {
        // for click outside
        const closeDropdown = (e) => {
            if (e.target.closest('.dd-select-container')) return
            setOpen(false)
        }
        document.addEventListener('click', closeDropdown)
        return () => document.removeEventListener('click', closeDropdown)
    }, [])

   
    // it's update the title with selcted item
    useEffect(() => {
        const selected = list.filter(item => item.selected)
        if(selected.length > 0){
            setHeaderTitle(selected[0].label)
            setCurrentSelectItem(selected[0])
        }
        else{

            setHeaderTitle(title)
        }
    }, [list])
    // toggles the show/hide of the dropdown
    const toggle = () => setOpen(!open)
    
    const selectItem = (item) => {
        const {value,label,id} = item
        onChange(value,id)
        setOpen(false)
    }
  return (
    <div className='dd-select-container'> 
        <div className="dd-select-header" onClick={() => toggle()}>
            <div className="dd-header-title">
                {(itemIcon && currentSelectItem) && currentSelectItem.icon}
                {headerTitle}</div>
            <div className={`dd-header-icon ${open && 'rotate'}`}>
                <svg fill="none" width={13} viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
        
        {open && <motion.div
            initial={{y: -4}}
            animate={{y: 0}} 
            transition={{duration: 0.2, type: 'ease'}}
            className={`dd-list`}>
        {list.map((item,index) => {
            let selectedSibling;
            if(index > 0 && list[index - 1].selected){
                selectedSibling = true
            }
            else if(index < list.length - 1 && list[index + 1].selected){
                selectedSibling = true
            }
            return <DropdownItem
                    index={index} 
                    item={item}
                    list={list}
                    itemIcon={itemIcon}
                    onItemClick={selectItem}
                    />
        })
        }
    </motion.div>
     }
    </div>
    </div>
  )
}
function DropdownItem ({item,list,itemIcon,index,onItemClick}){
    let selectedSibling;
    if(index > 0 && list[index - 1].selected){
        selectedSibling = true
    }
    if(index < list.length - 1 && list[index + 1].selected){
        selectedSibling = true
    }
    return <div
            style={{cursor: 'pointer'}}
            className={`dd-list-item ${item.selected ? 'selected' : ''} ${selectedSibling ? 'selected-sibling' : ''}`} 
            key={item.id}
            onClick={() => onItemClick(item)}
            >
            {itemIcon && item.icon}
            {item.label}    
        </div>
}
export default Dropdown