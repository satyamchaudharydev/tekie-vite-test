import React from 'react'
import styles from './style.module.scss'
import searchIcon from '../../../../../assets/memory-search-icon.svg'

const Searchbar = (props) => {
  /**
   * 
   * @param {Event} event 
   */
  const searchText = (event) => {
    const dataToSearch = props.data
    const searchText = event.target.value.toUpperCase()
    const foundItems = []
    if(props.currentSection === 'rewatch'){
      dataToSearch.forEach(object => {
        const objBody = []
        object.body.forEach(cardItem => {
          const titleText = cardItem.title.toUpperCase()
          const videoTitleText =
            cardItem.videoTitle && cardItem.videoTitle.toUpperCase()
          if (
            (cardItem.title && titleText.includes(searchText)) ||
            (cardItem.videoTitle && videoTitleText.includes(searchText))
          ) {
            objBody.push(cardItem)
          }
        })
        if (objBody.length > 0) {
          foundItems.push({
            mainTitle: object.mainTitle,
            body: objBody
          })
        }
      })
      props.setData(foundItems);
    }else{
      const results = props.data.map(cardItem => {
        const titleText = cardItem.title.toUpperCase()
        const videoTitleText =
          cardItem.videoTitle && cardItem.videoTitle.toUpperCase()
        if (
          !(
            (cardItem.title && titleText.includes(searchText)) ||
            (cardItem.videoTitle && videoTitleText.includes(searchText))
          )
        ) {
          return {
            ...cardItem,
            isCardVisible: false
          }
        }
        return { ...cardItem, isCardVisible: true }
      })

      props.setData(results);
    }
  }
    return(
        <div className={styles.container}>
            <img src={searchIcon} alt='' className={styles.searchIcon}></img>
            <input placeholder="Search" className={styles.input} onChange={searchText}></input>
        </div>
    )
}

export default Searchbar