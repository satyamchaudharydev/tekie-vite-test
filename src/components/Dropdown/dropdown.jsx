import React from 'react'
import './dropdown.scss'
import {motion} from 'framer-motion'
import { Link, useHistory } from 'react-router-dom'
import { get } from 'lodash'
import getPath from '../../utils/getPath'
import { useEffect } from 'react'
import LanguageIcon from '../../pages/Editor/components/LanguageIcon'
import cx from "classnames";
import '../NavBar/NavBar.scss'
import { hs } from '../../utils/size'
import { CODE_PLAYGROUND } from '../../constants/routes/routesPaths'

const editorsData = {
    Python : {
        logo: <LanguageIcon mode={'python'} height={20} width={20} />,
        text: 'Python',
        link: `${CODE_PLAYGROUND}?language=python`,
    },
    JavaScript: {
        logo: <LanguageIcon mode={'markup'} height={20} width={20} />,
        text: 'Web Playground',
        link: `${CODE_PLAYGROUND}?language=markup`,
    },
    Blockly: {
        logo: <LanguageIcon mode={'blockly'} height={20} width={20} />,
        text: 'Blockly',
        link: `${CODE_PLAYGROUND}?language=blockly`,
    },
    CodeOrg: {
        logo: <LanguageIcon mode={'CodeOrg'} height={20} width={20} />,
        text: 'Code.org',
        link: `https://studio.code.org/projects/spritelab/`,
    }
  }

function TabDropdown({list,onChange = () => {},visible,itemIcon = false,direction = 'down',size='default',currentRoute, code}) {

    const selectItem = (item) => {
        const {id} = item
        onChange(id)
    }
  
    
  return (
     <>
     {list.length > 0 && 
         <motion.div
            data-direction={direction}
            data-size={size}
            initial={{
                opacity: visible ? 1 : 0,
                y: visible ? 0 : 10,
                pointerEvents: visible ? "all" : "none"
            }}
            animate={{
                opacity: visible ? 1 : 0,
                y: visible ? 0 : 10,
                pointerEvents: visible ? "all" : "none"
            }}
            transition={{
                delay: visible ? 0 : 0.3
            }}
            className={`dd-list`}>
            {
            list.map((item,index) => {
                if (code) {
                    return <DropdownItemCode
                        index={index} 
                        item={item}
                        list={list}
                        itemIcon={itemIcon}
                        />
                } else {
                    return <DropdownItem
                            index={index} 
                            item={item}
                            list={list}
                            itemIcon={itemIcon}
                            onItemClick={selectItem}
                            />
                }
                })
            }
    </motion.div>
        
     
     }
     
     
     </>
            
        
       
  )
}
function DropdownItem ({item,list,itemIcon,index,onItemClick}){
    
    const thumbnail = getPath(get(item,'thumbnail.uri',''))
    return <>
    <Link 
                to={`/book/${item.id}`}
                style={{cursor: 'pointer',textDecoration: 'unset'}}
                className={`dd-list-item`} 
                key={item.id}
                onClick={() => onItemClick(item)
            }
            >
            {
                thumbnail &&
                <img className='dd-list-icon' src={thumbnail} alt="" />
            }
            {item.title}    
        </Link >
    </> 
}

const dropdownLogoAndText = (editorData) => {
    return (
        <div className='dropdown-item'>
            <div>
                {get(editorData, 'logo')}
            </div>
            <div className='dropdown-item-text'
            >
                {get(editorData, 'text')}
            </div>
        </div>
    )
}

function DropdownItemCode ({item,list,itemIcon,index,onItemClick}){
    const key = get(item, 'title')
    const editorData = editorsData[key]
    const history = useHistory()
    return <>
        <div
            style={{
                display:'flex',
                justifyContent:'flex-start',
                alignItems:'center',
                paddingRight: '15px',
            }}
            onClick={(e) => {
                e.stopPropagation()
                if (key === 'CodeOrg') {
                    if (window && window.open) {
                        window.open(`${get(editorData, 'link')}`, '_blank')
                    }
                } else {
                    history.push(get(editorData, 'link'))
                }
            }}
        >
            {dropdownLogoAndText(editorData)}
        </div>
    </> 
}
export default TabDropdown