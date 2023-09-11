import React from 'react'
import styles from './main.module.scss'
import Searchbar from './Searchbar'
import VideoComponent from './VideoComponent'
import ChatComponent from './ChatComponent'
import PracticeComponent from './PracticeComponent'
import QuizComponent from './QuizComponent'
import { LEARNING_VIDEOS, CHATS, } from '../../../../utils/constants'
import CardSkeleton from "../cardskeleton";
import { ReactComponent as TriangleBG } from '../../../../assets/triangleBG.svg'
import {takeSessionMsg, uhohMessage} from '../../../../constants/memory/messages'

const MainContent = (props) => {
  const [data, setData] = React.useState(props.data)
  React.useEffect(() => {
    setData(props.data);
}, [props.data])
  let CurrentComponent;
  const { pathname: path } = props.location;
  let isRewatch = path.replace('/memory/', '').match(/rewatch/g);
  const currentSection = isRewatch ? 'rewatch' : 'bookmarks'
  let bookmarkSection,sectionInRewatch;
  if (isRewatch) {
    sectionInRewatch = path.replace('/memory/rewatch/', '');
    switch (sectionInRewatch) {
      case 'Videos':
        CurrentComponent = VideoComponent;
        break;
      case 'Chats':
        CurrentComponent = ChatComponent;
        break;
      case 'Practice Questions':
        CurrentComponent = PracticeComponent;
        break;
      case 'Quizzes':
        CurrentComponent = QuizComponent;
        break;
      default:
        break;
    }
  }else{
    bookmarkSection = path.replace('/memory/bookmarks/','');
    switch(bookmarkSection){
      case 'Video':
        bookmarkSection = LEARNING_VIDEOS;
        break;
      case 'Chats':
        bookmarkSection = CHATS
        break;
      default:
        return <div className={styles.wrapper}></div>;
    }
  }
  const handleNavigation = (e,cardData) => {
    const userRoleType = props.user.get('role')
    const sessionPrefix = userRoleType === 'mentee' ? '/revisit/sessions': ''
    switch (sectionInRewatch) {
      case 'Videos':
        props.history.push(`${sessionPrefix}/video/${cardData.id}`)
        break;
      case 'Chats':
        props.history.push(`${sessionPrefix}/chat/${cardData.topics[0].id}/${cardData.id}`)
        break;
      case 'Practice Questions':
        if(cardData.navigateToPQReport){
          props.history.push(`${sessionPrefix}/practice-report/${cardData.topics[0].id}/${cardData.id}`)
        }else{
          props.history.push(`${sessionPrefix}/practice/${cardData.topics[0].id}/${cardData.id}`)
        }
        break;
      case 'Quizzes':
        if(cardData.navigateToQuizReport){
          if(userRoleType === 'mentee'){
            /**
             * @todo handle quiz report routing for mentee role
             */
          }else{
            props.history.push(`${sessionPrefix}/quiz-report-latest/${cardData.id}`) 
          }
        }else{
          if(userRoleType === 'mentee'){
            props.history.push(`/revisit/homework/${cardData.id}/quiz`)
          }else{
            props.history.push(`${sessionPrefix}/quiz/${cardData.id}`)
          }
        }
        break;
      default:
        break;
    }
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.triangleBGContainer}>
        <TriangleBG />
      </div>
      {
        props.isLoading && (
          <div className={styles.section}>
            {/* <div className={styles.mainTitle}>{section.mainTitle}</div> */}
            {
              [...Array(5)].map((_,index) => {
                return <CardSkeleton key={index}/>
              })
            }
          </div>
        )
      }
      {
        !props.isLoading && (props.data.length ? (
          <React.Fragment>
            <Searchbar data={props.data} setData={setData} currentSection={currentSection} />
            {Array.isArray(data) && data.map(section => {
              return (
                <div key={section.mainTitle} className={styles.section}>
                  <div className={styles.mainTitle}>{section.mainTitle}</div>
                  {
                    section.body.map(card => {
                      return <CurrentComponent currentSection={currentSection} {...card} key={card.title} onClick={handleNavigation}/>
                    })
                  }
                </div>
              )
            })}
          </React.Fragment>
        ):(
            <div className={styles.messageContainer}>
              <div className={styles.uhohMsgContainer}>
                {uhohMessage}
              </div>
              <div className={styles.emptyMsgContainer}>
                {takeSessionMsg}
              </div>
            </div>
        ))
      }
    </div>
  )
}

export default MainContent
