import React, { useState, memo } from 'react'
import './TopicContainer.scss'
import searchIcon from '../../../../assets/SearchIcon.svg'
import getPath from '../../../../utils/getPath'
import ArrowSVG from '../../../../assets/arrowIcon'
import { get } from 'lodash'
import ContentLoader from 'react-content-loader'
import cx from 'classnames'
import SimpleButtonLoader from '../../../../components/SimpleButtonLoader'
import { fetchCheatSheetsBySearch } from '../../../../queries/cheatSheet'
import { Link } from 'react-router-dom'
import MemoClose from '../../../../assets/Close'
import { debounce } from 'lodash'
import StarFilled from '../../../../assets/stars/StarFilled'
import favourite from '../../../../image/fav.svg'
import StarIcon from '../../../../assets/stars/StarIcon'
import { CHEATSHEET_URL } from '../../../../constants/routes/routesPaths'

const TopicContainer = (props) => {
    const {
        topics, selectTopic, ischeatSheetTopicsFetching,
        handleCheatSheetIdInput, navButton, isSearchFetched,
        cheatSheetsBySearch, isSearchFetching, hideButton, selectCheatSheet,
        isLoggedIn
    } = props
    const [showPopup, setShowPopup] = useState(false)
    const [text, setText] = useState('')
    const closePopup = () => {
        setShowPopup(false)
        setText('')
    }
    const handleChangeSearch = (e) => {
        selectCheatSheet('')
        setText(e.target.value)
        if (e.target.value) {
            fetchCheatSheetBySearchText(e.target.value)
        }
    }
    const highLight = (txt) => {
    const regex = new RegExp(`(${text})`, 'gi')
    const parts = txt.split(regex)
    return (
        <>
            {parts.filter(part => part).map((part, i) => (
                regex.test(part) ? <span key={i} style={{ color: '#00ade6' }}>{part}</span> : <span style={{ color: '#dcdcdc' }} key={i}>{part}</span>
            ))}
        </>
    )
    }
    const fetchCheatSheetBySearchText = debounce(async (value) => {
        await fetchCheatSheetsBySearch(value)
    }, 500)

    const isTopicsLoading = (topics.length === 0 && ischeatSheetTopicsFetching) || (topics.length === 0 && props.isCheatSheetFetching)
    const selectCheatSheets = async (cheatsheet, { title, id }) => {
        selectCheatSheet(get(cheatsheet, 'id'))
        const selectedTopicId = get(topics.find(({ isSelected }) => isSelected), 'id')
        if (selectedTopicId === id) {
            closePopup()
            const conceptId = document.querySelector(`#${get(cheatsheet, 'id')}`)
            if (conceptId) {
                conceptId.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        } else {
            closePopup()
            await handleCheatSheetIdInput(get(cheatsheet, 'id'), { id, title })
        }
    } 
    const renderSearchResult = () => {
        if (text && !isSearchFetching && isSearchFetched && cheatSheetsBySearch && cheatSheetsBySearch.toJS()) {
            return  cheatSheetsBySearch.toJS().length > 0 ? cheatSheetsBySearch.toJS().map(({ id, title, concept }) => (
                <div key={id}>
                    <div className={'cheatsheet-modalTopicTitle'}>{title}</div>
                    {
                        concept.map(({ cheatsheet, isBookmarked }, i) => (
                            <Link
                                className={'cheatsheet-modalCheatSheetTitle'}
                                key={get(cheatsheet, 'id')}
                                to={`/cheatsheet/${id}/${get(cheatsheet, 'id')}`}
                                onClick={() => selectCheatSheets(cheatsheet, { title, id })}
                            >
                                {concept && i !== concept.length - 1 && <div className={'cheatsheet-line'}></div>}
                                <h3
                                    className={'cheatsheet-cheatSheetTitle'}
                                ><span>{highLight(get(cheatsheet, 'title', ''))}</span>
                                    {<div className={'cheatsheet-starIcon'} style={{ marginRight: '20px' }}>{isBookmarked ?
                                    <StarFilled /> : <StarIcon />}</div>}</h3>
                                {get(cheatsheet, 'description') &&
                                    <p>
                                    <span style={{ paddingLeft: '10px' }}>{get(cheatsheet, 'description', '')}</span>
                                    </p>}
                            </Link>
                        ))
                    }
                </div>
            )) : (
                <div><div className={'cheatsheet-modalTopicTitle'}>No result found.</div></div>
            )
        }
    }
    return (
        <div className={'cheatsheet-topicContainer'}>
            <div className={'cheatsheet-searchbar'}>
                <div
                    className={cx('cheatsheet-searchContainer')}
                >
                    <img src={searchIcon} alt='Search Icon' />
                    <input
                        type='text' placeholder='What are you looking for?'
                        value={text}
                        onChange={(e) => {
                            handleChangeSearch(e)
                            if (e.target.value.length > 0 && cheatSheetsBySearch && cheatSheetsBySearch.toJS()) {
                                setShowPopup(true)
                            }
                        }}
                    />
                    {
                        (isSearchFetching) && (
                            <div className={'cheatsheet-inputLoader'}>
                                <SimpleButtonLoader
                                showLoader
                                style={{
                                    backgroundImage: 'unset',
                                    border: '0.15625vw solid #00ade6',
                                    borderLeft: 'unset',
                                    height: '100%',
                                    width: '100%'
                                }}
                            />
                            </div>
                        )
                    }
                    {
                        (!isSearchFetching && text) && (
                            <MemoClose onClick={() => {
                                setText('')
                                closePopup()
                            }} fill={'#D3D3D3'} />
                        )
                    }
                </div>
                <div onClick={closePopup} className={cx('cheatsheet-modal',showPopup && 'cheatsheet-showModal')}></div>
                <div className={'cheatsheet-modalBody'}>{renderSearchResult()}</div>
            </div>
            <section className={'cheatsheet-sliderOuter'}>
                {!isTopicsLoading && (
                    <div className={cx('cheatsheet-leftArrow')} >
                        <span onClick={() => navButton(-1)} style={{ display: hideButton === 'prev' ? 'none' : 'block' }}>
                            <ArrowSVG /> 
                        </span>
                    </div>
                )}
                <div className={'cheatsheet-sliderHolder'} id='sliderHolder'>
                    {
                        isTopicsLoading ? (
                                <div style={{ margin: '0 auto', display: 'flex' }}>
                                {Array(5).fill().map((_, i) => (
                                    <ContentLoader
                                        key={i}
                                        className={cx('cheatsheet-card')}
                                        speed={2}
                                        backgroundColor={'#225169'}
                                        foregroundColor={'#dbdbdb'}
                                    >
                                        <rect x='0' y='0' width='100%' height='100%' />
                                    </ContentLoader>
                                ))}
                            </div>
                        ) : (
                            topics.map(({ title, id, thumbnail, isSelected, ...rest }, i) => (
                                <div
                                    className={`${'cheatsheet-topicCards'} ${isSelected && 'cheatsheet-selectedCard'} ${isSelected ? 'scrollToCard' : ''} `} id='sliderCard'
                                    style={{
                                        backgroundPosition: title === 'Favourites' ? '-18px' : '',
                                        backgroundSize: title === 'Favourites' ? 'contain' : '',
                                        backgroundImage: isSelected && title !== 'Favourites' ?
                                            `linear-gradient(rgba(10, 49, 69, 0.5), rgba(10, 49, 69, 0.5)), linear-gradient(to top, rgba(53, 228, 233, 0), rgba(0, 173, 230, 0)), url('${title === 'Favourites' ? favourite : thumbnail && getPath(thumbnail.uri)}')` :
                                            `linear-gradient(rgba(10, 49, 69, 0.7), rgba(10, 49, 69, 0.7)), url('${title === 'Favourites' ? favourite : thumbnail && getPath(thumbnail.uri)}')`,
                                    }}
                                    key={id}
                                    onClick={() => selectTopic({ title, id, isSelected, ...rest })}
                                >
                                    <Link to={!isLoggedIn && id === 0 ? CHEATSHEET_URL : `${CHEATSHEET_URL}/${id}`}>
                                        {title === 'Favourites' && <div className={'cheatsheet-starIcon'} style={{ opacity: 0.6 }}><StarFilled /></div>}
                                        <h3 style={{ opacity: isSelected ? 1 : 0.6 }}>{title}</h3>
                                    </Link>
                                </div>
                            ))
                        )
                    }
                </div>
                {!isTopicsLoading && (
                    <div className={'cheatsheet-rightArrow'} >
                        <span onClick={() => navButton(1)} style={{ display: hideButton === 'next' ? 'none' : 'block' }}>
                            <ArrowSVG /> 
                        </span>
                    </div>
                )}
            </section>
        </div>
    )
}

export default memo(TopicContainer)
