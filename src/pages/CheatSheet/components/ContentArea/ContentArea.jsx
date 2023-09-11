import { get, sortBy } from 'lodash'
import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { fetchCheatSheets, fetchFavouriteCheats } from '../../../../queries/cheatSheet'
import getPath from '../../../../utils/getPath'
import './ContentArea.scss'
import { dracula } from '../../../../utils/react-syntax-highlighter/dist/esm/styles/hljs'
import parseChatStatement from '../../../Chat/parseChatMessage'
import cx from 'classnames'
import ContentsSkeleton from './ContentsSkeleton'
import { motion } from 'framer-motion'
import { filterKey } from '../../../../utils/data-utils'
import StarFilled from '../../../../assets/stars/StarFilled'
import StarIcon from '../../../../assets/stars/StarIcon'
import Lottie from 'react-lottie'
import bookmark from '../../../../assets/emptyBookmarkScreen.json'
import { hs } from '../../../../utils/size'

const terminalStyles = {
  padding: 0,
  margin: 0,
  fontFamily: 'Monaco',
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontStyle: 'normal',
  letterSpacing: 'normal',
  whiteSpace: 'pre-wrap',
  backgroundColor: '#002f3e'
}
class ContentArea extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cheatSheetContents: this.getCheatSheetContents(this.props.selectedTopic),
    }
  }

  getCheatSheetContents = (id) => {
    if (id === 'favourites') {
      return []
    } else {
      if (this.props.cheatSheets && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${id}`) && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${id}`).toJS && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${id}`).toJS().length > 0) {
        return filterKey(this.props.cheatSheets, `cheatSheetConcepts/${id}`).toJS()
      }
      if (this.props.cheatSheets && filterKey(this.props.cheatSheets, `getCheatSheet/default`) && filterKey(this.props.cheatSheets, `getCheatSheet/default`).toJS) {
        return filterKey(this.props.cheatSheets, `getCheatSheet/default`).toJS()
      }
    }
    return []
  }

  fetchCheatSheet = async (id) => {
    if (id === 'favourites') {
      await fetchFavouriteCheats()
      this.setState({
        cheatSheetContents:
          this.props.favouritesCheats && filterKey(this.props.favouritesCheats, 'favouriteCheats')
          && filterKey(this.props.favouritesCheats, 'favouriteCheats').toJS()
      })
    } else {
      const data = filterKey(this.props.cheatSheets, `cheatSheetConcepts/${id}`)
      if (data && data.toJS().length === 0) {
        await fetchCheatSheets({ topicId: id, key: `cheatSheetConcepts/${id}` })
      }
      this.setState({
        cheatSheetContents:
          this.props.cheatSheets && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${id}`)
          && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${id}`).toJS()
      })
    }
  }
  componentDidUpdate = (prevProps) => {
    const { selectedTopic, ischeatSheetTopicsFetched,
      selectedCheatSheet } = this.props
    if (prevProps.selectedTopic !== selectedTopic) {
      this.fetchCheatSheet(selectedTopic)
    }
    if (!prevProps.ischeatSheetTopicsFetched && ischeatSheetTopicsFetched && selectedTopic !== 0) {
      if (!this.props.isCheatSheetFetching) {
        if (selectedTopic) {
          if (this.props.cheatSheets && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`) && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS().length > 0) {
            this.setState({
              cheatSheetContents: this.props.cheatSheets && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`)
                && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS()
            })
          } else {
            this.setState({
              cheatSheetContents: filterKey(this.props.cheatSheets, `getCheatSheet/default`)
                && filterKey(this.props.cheatSheets, `getCheatSheet/default`).toJS()
            })
          }
        } else {
          this.setState({
            cheatSheetContents: filterKey(this.props.cheatSheets, `getCheatSheet/default`)
              && filterKey(this.props.cheatSheets, `getCheatSheet/default`).toJS()
          })
        }
      }
    }
    if (this.props.isCheatSheetFetched && !prevProps.isCheatSheetFetched) {
      if (this.props.cheatSheets && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`) && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS().length > 0) {
        this.setState({
          cheatSheetContents: this.props.cheatSheets && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`)
            && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS()
        })
      }
    }
    if (!this.props.isBGCheatSheetFetched && this.props.isBGCheatSheetFetched && (selectedTopic !== 0 || selectedTopic !== 'favourites')) {
      if (selectedTopic) {
        if (this.props.cheatSheets && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`) && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS().length > 0) {
          this.setState({
            cheatSheetContents: this.props.cheatSheets && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`)
              && filterKey(this.props.cheatSheets, `cheatSheetConcepts/${selectedTopic}`).toJS()
          })
        } else {
          this.setState({
            cheatSheetContents: filterKey(this.props.cheatSheets, `getCheatSheet/default`)
              && filterKey(this.props.cheatSheets, `getCheatSheet/default`).toJS()
          })
        }
      }
    }
    if (this.props.isFavouriteCheatsFetched && !prevProps.isFavouriteCheatsFetched) {
      this.setState({
        cheatSheetContents:
          this.props.favouritesCheats && filterKey(this.props.favouritesCheats, 'favouriteCheats')
          && filterKey(this.props.favouritesCheats, 'favouriteCheats').toJS()
      })
    }
    if (selectedCheatSheet) {
      const conceptId = document.querySelector(`#${selectedCheatSheet}`)
      if (conceptId) {
        conceptId.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }
  renderMessages = (message, i) => {
    if (!message) return <></>
    let messageComponent = <></>
    const { type } = message
    if (type === 'text') {
      messageComponent = (
        <div className={'cheatsheet-text'}>{parseChatStatement({
          statement: message.statement,
          emojis: message.emoji,
        })}</div>
      )
    }
    if (type === 'image') {
      messageComponent = (
        <div className={'cheatsheet-message'}>
          <div className={'cheatsheet-imageContainer'}>
            <img src={getPath(message.image ? message.image.uri : '')} className={'cheatsheet-image'} alt='CheatSheet' />
          </div>
        </div>
      )
    }
    if (type === 'syntax') {
      messageComponent = (
        <div className={'cheatsheet-message'}>
          <div className={cx('cheatsheet-terminalInputContainer', 'cheatsheet-syntax')}>
            <SyntaxHighlighter
              language='python'
              customStyle={{
                padding: 0,
                margin: 0,
                backgroundColor: 'transparent',
                fontFamily: 'Monaco',
              }}
            >
              {message.syntax}
            </SyntaxHighlighter>
          </div>
        </div>
      )
    }
    return messageComponent
  }
  renderCodes = (message, i) => {
    if (!message) return <></>
    let messageComponent = <></>
    const { type } = message
    if (type === 'terminal') {
      messageComponent = (
        <div className={'cheatsheet-message'}>
          <div className={cx('cheatsheet-terminalInputContainerLeft')}>
            <SyntaxHighlighter
              language='python'
              style={dracula}
              customStyle={terminalStyles}
            >
              {message.terminalInput}
            </SyntaxHighlighter>
          </div>
          {message.terminalOutput && (
            <div className={'cheatsheet-terminalOutputContainer'}>
              <div className={'cheatsheet-terminalOutputText'}>
                {message.terminalOutput.split('\n').map((outputLine) =>
                  <div style={{ whiteSpace: 'pre' }}>{() => { console.log(outputLine) }}</div>)}
              </div>
              <div
                className={'cheatsheet-terminalPlayButton'}
                onClick={() => {
                  this.props.history.push({
                    pathname: '/code-playground',
                    state: {
                      codeString: message.terminalInput
                    }
                  })
                }} />
            </div>
          )}
        </div>
      )
    }
    return messageComponent
  }

  addToBookmark = (data) => {
    const { cheatSheetContents } = this.state
    const { addBookmark, isLoggedIn, selectCheatSheet } = this.props
    selectCheatSheet('')
    let newContents = []
    if (!isLoggedIn) {
      newContents = [...cheatSheetContents]
    } else {
      newContents = cheatSheetContents.map(({ id, ...datas }) => id === get(data, 'id') ?
        ({ ...datas, id, isBookmarked: !get(data, 'isBookmarked') }) :
        ({ ...datas, id }))
    }
    addBookmark({
      id: get(data, 'id'), isBookmarked: get(data, 'isBookmarked'), userCheatSheetId: get(data, 'userCheatSheetId')
    })
    this.setState({
      cheatSheetContents: newContents
    })
  }
  render() {
    const { cheatSheetContents } = this.state
    const {
      isCheatSheetFetching, ischeatSheetTopicsFetching, isFavouriteCheatsFetching,
      selectedTopic
    } = this.props
    return (
      <div className={'cheatsheet-contentArea'}>
        {
          (isCheatSheetFetching || ischeatSheetTopicsFetching || isFavouriteCheatsFetching) ?
            (
              <ContentsSkeleton />
            ) : (
              cheatSheetContents.length > 0 ? (
                sortBy(cheatSheetContents, 'order').map(({ id, title, content, isBookmarked, userCheatSheetId }) => (
                  <div key={id} id={id}>
                    <h3 className={'cheatsheet-contentTitle'}>{title}
                      <motion.div
                        whileTap={{
                          scale: 0.85
                        }}
                        className={'cheatsheet-starIcons'}
                        onClick={() => this.addToBookmark({ id, isBookmarked, userCheatSheetId })}
                      >{isBookmarked ?
                        <StarFilled /> : <StarIcon fill='#00ade6' />}</motion.div>
                    </h3>
                    <div className={'cheatsheet-contentContainer'} >
                      <div>
                        {
                          sortBy(content, 'order').map((contents, i) => this.renderMessages(contents, i))
                        }
                      </div>
                      <div>
                        {
                          sortBy(content, 'order').map((contents, i) => this.renderCodes(contents, i))
                        }
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                cheatSheetContents.length === 0 && (
                  <div className={'cheatsheet-emptyText'}>
                    <Lottie
                      options={{
                        autoplay: true,
                        animationData: bookmark,
                        loop: true,
                        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
                      }}
                      style={{ height: `${hs(260)}px`, marginBottom: '20px' }}
                    />
                    <h1>Ouhh... it's empty in here!</h1>
                    {selectedTopic === "favourites" && (<h4>Mark some concepts as favourite to be shown here</h4>)}
                  </div>
                )
              )
            )
        }
      </div>
    )
  }
}

export default ContentArea
