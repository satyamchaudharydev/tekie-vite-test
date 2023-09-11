import React, {useEffect } from 'react'
import { motion, AnimateSharedLayout } from 'framer-motion'
import { Link, useHistory, useLocation } from 'react-router-dom'
import fetchEbooks from '../../queries/sessions/fetchEbooks'

import styles from  './MainSideBar.module.scss'
import cx from 'classnames'
import {
  ArrowLeft,
  SessionPageIcon,
  HomeworkPageIcon, 
  CodePlaygroundPageIcon,
  CheatSheetPageIcon
} from './mainSideBarIcons'
import TabDropdown from '../Dropdown/dropdown'
import { get } from 'lodash'
import getMe from '../../utils/getMe'
import { getCodePlayground } from '../../utils/getCourseId'
import { CHEATSHEET_URL, CODE_PLAYGROUND, HOMEWORK_URL, SESSIONS_URL, STUDENT_BOOK_URL } from '../../constants/routes/routesPaths'

const SESSIONS = SESSIONS_URL
const HOMEWORK = HOMEWORK_URL
const CODEPLAYGROUND = CODE_PLAYGROUND
const BOOK = STUDENT_BOOK_URL
const CHEATSHEET = CHEATSHEET_URL

const AppSideSideNavBar = props => {
  const firstRender = React.useRef(true)
  const [shouldBeMounted, setShouldBeMounted] = React.useState(true)
  const [isEbookDropdownVisible, setIsEbookDropdownVisible] = React.useState(false)
  const [ebookDropdownList, setEbookDropdownList] = React.useState([])
  const [ebookIds, setEbookIds] = React.useState([])
  const [isMultipleLanguagesDropdownVisible, setIsMultipleLanguagesDropdownVisible] = React.useState(false)

  const history = useHistory();

  const { currentRoute, visible } = props
  const defaultBookId = ebookDropdownList.length > 0 && get(ebookDropdownList, '[0].id' , '')
  const shouldShowEbook = get(getMe(),'children[0].studentProfile.batch.shouldShowEbook',false)
  const courses =  get(props.coursePackages,'[0].courses',[])

  const programmingCourses = courses.filter(item => get(item, 'category') === 'programming' || get(item, 'category') === 'technology') || []

  const codingLanguages = []
  programmingCourses.length && programmingCourses.forEach(item => {
    const languages = get(item, 'codingLanguages', [])
    languages.forEach(language => {
      const title = get(language, 'value')
      if (title !== 'Java' && title !== 'Csharp' && title !== 'Swift' && title !== 'Cplusplus') {
        const obj = {
          title
        }
        const isAlreadyExist = codingLanguages.find(value => get(value, 'title') === title)
        if (!isAlreadyExist) {
          codingLanguages.push(obj)
        }
      }
    })
  })

  const sidebar = [
    { title: 'Sessions', icon: SessionPageIcon, iconType: 'stroke', link: SESSIONS  },
    { title: 'Homework', icon: HomeworkPageIcon, iconType: 'fill', link: HOMEWORK },
  ]
  if (codingLanguages.length) {
    sidebar.push(
      { title: <>Code <br/>Playground</>, icon: CodePlaygroundPageIcon, iconType: 'fill', link: CODEPLAYGROUND, dropdown: codingLanguages.length > 1 }
    )
  }
  if (ebookIds.length > 0) {
    sidebar.push(
      { title: 'E-book', icon: SessionPageIcon, iconType: 'stroke', link: BOOK,dropdown: true }
    )
  }

  const language = getCodePlayground()
  if (language === 'python') {
    sidebar.push(
      { title: 'Cheatsheet', icon: CheatSheetPageIcon, iconType: 'stroke', link: CHEATSHEET }
    )
  }

  useEffect(() => {
    if (visible && !shouldBeMounted) {
      setTimeout(() => {
        setShouldBeMounted(true)
      }, 100)
    } else if (!visible) {
      setShouldBeMounted(false)
    }
  }, [visible])
  
  const stripLastId = (url) => {
    const urlArray = url.split('/')
    urlArray.pop()
    return urlArray.join('/')
  }
   
  const isCurrentLink = (currentLink, link) => {
    if (currentLink === link) {
      return link
    }
    else return link === stripLastId(currentLink)
  }
  
  async function getEbooks () {
    const courses =  get(props.coursePackages,'[0].courses',[])
    const ebooksIds = []
    if(courses.length > 0){
      courses.forEach(course => {
          if(course.ebooks){
            const bookIds = course.ebooks.map(book => book.id)
            ebooksIds.push(...bookIds)
          }    
      })  
    }
    if(ebooksIds.length > 0){
      setEbookIds(ebooksIds)
      const data = await fetchEbooks(ebooksIds).call()
      const eBookCourses = get(data, 'eBookCourses', [])
      if(eBookCourses.length){
        const ebooks = eBookCourses.map(item => get(item, 'ebook'))
        const uniqueEbooks = [...new Set(ebooks.map(item => item.id))].map(id => {
          return ebooks.find(item => item.id === id)
        })
        setEbookDropdownList(uniqueEbooks)
      }
    } 
  }
  if(courses.length > 0 && !ebookIds.length && shouldShowEbook){
    getEbooks()
  }

  const redirectTo = (config) => {
    if (config.dropdown && get(config, 'link') === BOOK) {
      return history.push(`${config.link}/${defaultBookId}`)
    } else {
      if (codingLanguages.length === 1 && get(codingLanguages, '[0].title') === 'CodeOrg') {
        return window.open('https://studio.code.org/projects/spritelab/', '_blank')
      }
      return history.push(config.link)
    }
  }

  if (!visible) return <></>
  return (
    <motion.div 
      className={styles.flexColumn}
      style={{ justifyContent: 'space-between', alignItems: 'center' }}
      initial={{ opacity: firstRender.current ? 1  : 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: firstRender.current ? 0 : 0.1 }}
    >
      <AnimateSharedLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {/* <div className={styles.tekieLogoDrop}></div> */}
          {sidebar.map((config) => (
            <div
              onMouseEnter={() =>{
                if (get(config, 'dropdown' ,null) && get(config, 'link') === CODEPLAYGROUND) {
                  setIsMultipleLanguagesDropdownVisible(true)
                }
                if (get(config, 'dropdown' ,null) && get(config, 'link') === BOOK) {
                  setIsEbookDropdownVisible(true)
                }
              }}
              onMouseLeave={() =>{
                if (get(config, 'dropdown' ,null) && get(config, 'link') === CODEPLAYGROUND) {
                  setIsMultipleLanguagesDropdownVisible(false)
                }
                if (get(config, 'dropdown' ,null) && get(config, 'link') === BOOK) {
                  setIsEbookDropdownVisible(false)
                }
              }}
              onClick={() => redirectTo(config)}
              className={cx(
                styles.outSidenavItem,
                isCurrentLink(currentRoute,config.link) && styles.active
              )}
            >
              {get(config, 'dropdown' ,null) && ((get(config, 'link') === CODEPLAYGROUND && codingLanguages.length > 1) || get(config, 'link') === BOOK) &&
                <>
                    <TabDropdown 
                      visible={get(config, 'link') === CODEPLAYGROUND ? isMultipleLanguagesDropdownVisible : isEbookDropdownVisible}
                      list={get(config, 'link') === CODEPLAYGROUND ? codingLanguages : ebookDropdownList}
                      direction='right'
                      size='big'  
                      currentRoute={currentRoute}
                      onChange={() => {}}   
                      code={get(config, 'link') === CODEPLAYGROUND}            
                  ></TabDropdown>
                </>
              } 
              <div className={cx(
                styles.icon,
                config.iconType === 'fill' ? styles.fill : styles.stroke
              )}>
                <config.icon />
              </div>
              <div className={styles.titleOutSideNavBar}>{config.title}</div>
              {isCurrentLink(currentRoute,config.link) && (
                <motion.div 
                  className={styles.activeLineIndicator}
                  initial={{ right: 0 }}
                  layoutId="activeIndicatorOutSideNavBar"
                ></motion.div>
              )}
            </div>
          ))}
        </div>
      </AnimateSharedLayout>
    </motion.div>
  )
}

export default AppSideSideNavBar