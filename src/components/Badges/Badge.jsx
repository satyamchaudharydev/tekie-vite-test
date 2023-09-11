import React from 'react';
import styles from './Badge.module.scss'

const Badge=({type,text,tag,rounded,customStyles,isSelectable,isSelected,onSelection})=>{
   
    const getClass=(type)=>{
        if(type==='red') return styles.red
        if(type==='green') return styles.green
        if(type==='yellow') return styles.yellow
        if(type==='purple') return styles.purple
        if(type==='outline') return styles.outline
        if(type==='greenSec') return styles.greenSec
        return styles.outline
    }

    return <div onClick={()=>isSelectable?onSelection(tag):null} style={customStyles && customStyles} className={`${rounded && styles.rounded} ${styles.badge} ${getClass(type)} ${(isSelected && isSelectable) && styles.purple}`}>
            {text}
    </div>
}

export default Badge