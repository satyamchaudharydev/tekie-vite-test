import React from "react"
import { useEffect, useState } from "react"
import EventCard from "../EventCard/EventCard"
import "./EventLibraryLoggedIn.scss"
import fetchContentTags from "../../../../queries/eventsLandingPage/fetchContentTags"
import fetchEventCateogories from "../../../../queries/eventsLandingPage/fetchEventCategories"
import fetchEventsDetails from "../../../../queries/eventsLandingPage/fetchEventDetails"
import CategoriesSkeleton from "../EventLibrary/components/CategoriesSkeleton"
import EventsSkeleton from "../EventsSkeleton/eventsSkeleton"
import {get} from "lodash"
import { computeSegEndResizable } from "@fullcalendar/react"
import { hs } from "../../../../utils/size"


function EventLibraryLoggedIn({ value, ...props }) {
    const [splittedData, setSplittedData] = useState([]);
    const [selectedCategory, setselectedCategory] = useState(20)
    const [contentId, setContentId] = useState(false)
    const [categoryId, setCategoryId] = useState(false)
    const data = value.eventsDetails.toJS()
    const arrayCategory = [{ idKey: 20, title: "All Categories" }]
    // const allTagArray = [{ idKey: 20, title: "All Events" }]
    const { eventsCategories, eventsDetailsFetchStatus, eventsContentTagsFetchStatus, eventsCategoriesFetchStatus } = value
    const eventsLoadingStatus = get(eventsDetailsFetchStatus.toJS().eventsDetails, "loading", "")
    const eventsContentTagsLoadingStatus = get(eventsContentTagsFetchStatus.toJS().contentTags, "loading", "")
    const eventsContentCategoriesLoadingStatus = get(eventsCategoriesFetchStatus.toJS().eventCategories, "loading", "")

    useEffect(() => {
        fetchEventCateogories()
        // fetchContentTags()
        fetchEventsDetails(categoryId, contentId , props.userStudentProfileId)
    }, [])

    useEffect(()=>{
        fetchEventsDetails(categoryId , contentId , props.userStudentProfileId)
    },[ contentId , categoryId])

    useEffect(() => {
        function newFunction() {
            const splittedDatas = []
            for (let i = 0; i < data.length; i++) {
                const currentSplitLength = splittedDatas.length
                if (splittedDatas[currentSplitLength - 1]) {
                    if (splittedDatas[currentSplitLength - 1].length < 4) {
                        splittedDatas[currentSplitLength - 1].push(data[i])
                    } else {
                        splittedDatas.push([data[i]])
                    }
                } else {
                    splittedDatas[0] = [data[i]]
                }
            }
            return splittedDatas
        }
        setSplittedData(newFunction())
    }, [value])

    const clickHandlerEventCategory = (key, category) => {
        setselectedCategory(key)
        setCategoryId(category.id)
    }
    const clickHandlerAllEventCategory = (category) => {
        setselectedCategory(category.idKey)
        setCategoryId(category.idKey)

    }
    // const clickHandlerContentTag = (key, tag) => {
    //     setSelectedTag(key)
    //     setContentId(tag.id)

    // }
    // const clickHandlerAllContentTag = (tag) => {
    //     setSelectedTag(tag.idKey)
    //     setContentId(tag.idKey)
    // }


     const navButton = (action, section) => {
    let direction = 0
    if (action === 'left') {
      direction = 1
    } else {
      direction = -1
    }
      const sliderHolder = document.querySelector(`.carousel-holders-loggedIn-${section}`)
      const eventCards = document.querySelectorAll('#eventCard-component')
      if (eventCards.length) {
        let far = sliderHolder.clientWidth / 4*direction;
        let pos = sliderHolder.scrollLeft + far;
        sliderHolder.scrollTo({ left: pos, behavior: 'smooth' })
      }
  }
  const getEvents = () => {
    const events = (get(value, 'eventsDetails') && value.eventsDetails.toJS()) || []
    const splittedDatas = []
    const splittedDatas2 = []
    let lastAdded = 'splittedDatas2'
    for (let i = 0; i < events.length; i++) {
      if (lastAdded === 'splittedDatas2') {
        splittedDatas.push(events[i])
        lastAdded = 'splittedDatas'
      } else {
        splittedDatas2.push(events[i])
        lastAdded = 'splittedDatas2'
      }
    }
    return [splittedDatas, splittedDatas2]
  }

    return <>
        <div className="event-library-box">
            <div className='event-library-box-upper'>
                <h1 className='eventHeading'>Event Library</h1>
                    <div className='scroll-container'>
                        <div className='event-categories'>
                            {eventsContentCategoriesLoadingStatus ? <CategoriesSkeleton /> : arrayCategory.map((category, key) => (
                                <div className='categories-padding'>
                                    <div onClick={() => clickHandlerAllEventCategory(category)}
                                        className={category.idKey === selectedCategory ? 'event-categorie-active' : 'event-categorie'}>{category.title}
                                    </div>
                                    {category.idKey === selectedCategory && <div className='category-underline' />}
                                </div>
                            ))}
                            {eventsContentCategoriesLoadingStatus ? <CategoriesSkeleton /> : eventsCategories.toJS().map((category, key) => (
                                <div className='categories-padding'>
                                    <div onClick={() => clickHandlerEventCategory(key, category)}
                                        className={key === selectedCategory ? 'event-categorie-active' : 'event-categorie'}>{category.title}
                                    </div>
                                    {key === selectedCategory && <div className='category-underline' />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            <div className="loggedIn_state_container">
            <section className='carousel-mainHolder'>
                <div className='carousel-holders-loggedIn-upper'>
                  { eventsLoadingStatus ? <EventsSkeleton />:get(getEvents(), '[0]').map(event => <EventCard selectedCategory={selectedCategory} key={get(event, 'id')} events={event} isLoggedIn />)}
                </div>
                {!eventsLoadingStatus && (
              <div
                style={{
                  display:  get(getEvents(), '[0]').length > 4 ? "flex" : "none",
                  alignItems: "center",
                  justifyContent: "center",
                  width: '98%'
                }}
              >
                <button
                  onClick={() => navButton("right", 'upper')}
                  className="carousel_next_btn-library"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="16" fill="#DCDCDC"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7057 8.4545C21.145 8.89384 21.145 9.60616 20.7057 10.0455L14.7511 16L20.7057 21.9545C21.145 22.3938 21.145 23.1062 20.7057 23.5455C20.2663 23.9848 19.554 23.9848 19.1147 23.5455L12.3647 16.7955C11.9253 16.3562 11.9253 15.6438 12.3647 15.2045L19.1147 8.4545C19.554 8.01517 20.2663 8.01517 20.7057 8.4545Z" fill="white"/>
                  </svg>
                </button>
                <button
                  onClick={() => navButton("left", 'upper')}
                  className="carousel_next_btn-library"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 33 33" fill="none">
                    <rect x="32.3477" y="32.1719" width="32" height="32" rx="16" transform="rotate(180 32.3477 32.1719)" fill="#00ADE6"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.642 23.7174C11.2027 23.278 11.2027 22.5657 11.642 22.1264L17.5965 16.1719L11.642 10.2174C11.2027 9.77803 11.2027 9.06572 11.642 8.62638C12.0813 8.18704 12.7937 8.18704 13.233 8.62638L19.983 15.3764C20.4223 15.8157 20.4223 16.528 19.983 16.9674L13.233 23.7174C12.7937 24.1567 12.0813 24.1567 11.642 23.7174Z" fill="white"/>
                  </svg>
                </button>
              </div>
            )}
          </section>
          {!eventsLoadingStatus ? (
             <section className='carousel-mainHolder'>
                <div className='carousel-holders-loggedIn-lower'>
                  {get(getEvents(), '[1]').map(event => <EventCard selectedCategory={selectedCategory} key={get(event, 'id')} events={event} isLoggedIn />)}
                </div>
                {!eventsLoadingStatus && (
              <div
                style={{
                  display: get(getEvents(), '[1]').length > 4 ? "flex" : "none",
                  alignItems: "center",
                  justifyContent: "center",
                  width: '98%'
                }}
              >
                <button
                  onClick={() => navButton("right", 'lower')}
                  className="carousel_next_btn-library"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="16" fill="#DCDCDC"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7057 8.4545C21.145 8.89384 21.145 9.60616 20.7057 10.0455L14.7511 16L20.7057 21.9545C21.145 22.3938 21.145 23.1062 20.7057 23.5455C20.2663 23.9848 19.554 23.9848 19.1147 23.5455L12.3647 16.7955C11.9253 16.3562 11.9253 15.6438 12.3647 15.2045L19.1147 8.4545C19.554 8.01517 20.2663 8.01517 20.7057 8.4545Z" fill="white"/>
                  </svg>
                </button>
                <button
                  onClick={() => navButton("left", 'lower')}
                  className="carousel_next_btn-library"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 33 33" fill="none">
                    <rect x="32.3477" y="32.1719" width="32" height="32" rx="16" transform="rotate(180 32.3477 32.1719)" fill="#00ADE6"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.642 23.7174C11.2027 23.278 11.2027 22.5657 11.642 22.1264L17.5965 16.1719L11.642 10.2174C11.2027 9.77803 11.2027 9.06572 11.642 8.62638C12.0813 8.18704 12.7937 8.18704 13.233 8.62638L19.983 15.3764C20.4223 15.8157 20.4223 16.528 19.983 16.9674L13.233 23.7174C12.7937 24.1567 12.0813 24.1567 11.642 23.7174Z" fill="white"/>
                  </svg>
                </button>
              </div>
            )}
                </section>
          ) : null}
                 {!(eventsLoadingStatus || eventsContentTagsLoadingStatus || eventsContentCategoriesLoadingStatus)
                && value && value.eventsDetails && value.eventsDetails.toJS() && value.eventsDetails.toJS().length === 0 ?
                <h1 className='event-noEvent-title'>Oops! No Event Available</h1> : null}
              </div>

        </div>
    </>
}

export default EventLibraryLoggedIn