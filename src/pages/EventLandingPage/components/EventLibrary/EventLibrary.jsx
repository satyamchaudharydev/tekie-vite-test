import React from 'react';
import './EventLibrary.styles.scss';
import { get } from "lodash";
import EventCard from '../EventCard/EventCard';
import fetchEventCateogories from '../../../../queries/eventsLandingPage/fetchEventCategories';
import fetchContentTags from '../../../../queries/eventsLandingPage/fetchContentTags';
import fetchEventsDetails from '../../../../queries/eventsLandingPage/fetchEventDetails';
import EventsSkeleton from '../EventsSkeleton/eventsSkeleton';
import { Toaster } from '../../../../components/Toaster'
import CategoriesSkeleton from './components/CategoriesSkeleton';
import { hs } from '../../../../utils/size';



class EventLibrary extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedCategory: 20,
            selectedTag: 20,
            categoryId: false,
            contentId: false,
            splittedData:[],
        }
    }


    componentDidMount = async (prevProps) => {
      const { categoryId, contentId } = this.state
        fetchEventCateogories()
        // await fetchContentTags()
        fetchEventsDetails( categoryId ,contentId )
    }

    componentDidUpdate = async (prevProps, prevState) => {
        const { categoryId, contentId, splittedData } = this.state
      if (prevState.categoryId !== categoryId) {
          await fetchEventsDetails(categoryId, contentId)
        }
      if (prevState.contentId !== contentId) {
            await fetchEventsDetails(categoryId, contentId)
        }
        if(prevState.splittedData === splittedData){
            const data =  this.props.value.eventsDetails.toJS()
            const splittedDatas = []
            const splittedDatas2 = []
            let lastAdded = 'splittedDatas2'
        for (let i = 0; i < data.length; i++) {
          if (lastAdded === 'splittedDatas2') {
            splittedDatas.push(data[i])
            lastAdded = 'splittedDatas'
          } else {
            splittedDatas2.push(data[i])
            lastAdded = 'splittedDatas2'
          }
          }
            this.setState({
                splittedData:[
                  splittedDatas, splittedDatas2
                ]
            })
        }
    }

    clickHandlerEventCategory = (key, category) => {
        this.setState(({
            selectedCategory: key,
            categoryId: category.id
        }))
    }
    clickHandlerAllEventCategory = (category) => {
        this.setState(({
            selectedCategory: category.idKey,
            categoryId: category.idKey
        }))
    }
    clickHandlerContentTag(key, tag) {
        this.setState(({
            selectedTag: key,
            contentId: tag.id
        }))
    }
    clickHandlerAllContentTag(tag) {
        this.setState(({
            selectedTag: tag.idKey,
            contentId: tag.idKey
        }))
  }
    navButton = (action, section) => {
    let direction = 0
    if (action === 'left') {
      direction = 1
    } else {
      direction = -1
    }
      const sliderHolder = document.querySelector(`.carousel-holders-${section}`)
      const eventCards = document.querySelectorAll('#eventCard-component')
      if (eventCards.length) {
        let far = sliderHolder.clientWidth / 4*direction;
        let pos = sliderHolder.scrollLeft + far;
        sliderHolder.scrollTo({ left: pos, behavior: 'smooth' })
      }
  }
    render() {
        const { selectedCategory, splittedData } = this.state;
        const { eventsCategories, eventsDetails, eventsDetailsFetchStatus, eventsContentTagsFetchStatus, eventsCategoriesFetchStatus } = this.props.value
        const eventsLoadingStatus = get(eventsDetailsFetchStatus.toJS().eventsDetails, "loading", "")
        const eventsContentTagsLoadingStatus = get(eventsContentTagsFetchStatus.toJS().contentTags, "loading", "")
        const eventsContentCategoriesLoadingStatus = get(eventsCategoriesFetchStatus.toJS().eventCategories, "loading", "")
        const arrayCategory =[{idKey:20, title:"All Categories"}]
       
          function EventsPage({ events }) {
            return (
              <>
              <div className='eventsPages-container' style={{display:"grid" , gridTemplateColumns:"1fr 1fr 1fr 1fr" , height:"fit-content",width:"fit-content" }}>
              {events.map(item => <EventCard key={get(item, 'id')} events={item}/>)}
              </div>
             </>)
          }
        return (
          <div id="event-library" className="anti-scroll-container">
            <div className="event-library-box">
              <div className='event-library-box-upper'>
                <h1 className="eventHeading">Event Library</h1>
                <div className="scroll-container">
                  <div className="event-categories">
                    {eventsContentCategoriesLoadingStatus ? (
                      <CategoriesSkeleton />
                    ) : (
                      arrayCategory.map((category, key) => (
                        <div className="categories-padding">
                          <div
                            onClick={() =>
                              this.clickHandlerAllEventCategory(category)
                            }
                            className={
                              category.idKey === selectedCategory
                                ? "event-categorie-active"
                                : "event-categorie"
                            }
                          >
                            {category.title}
                          </div>
                          {category.idKey === selectedCategory && (
                            <div className="category-underline" />
                          )}
                        </div>
                      ))
                    )}
                    {eventsContentCategoriesLoadingStatus ? (
                      <CategoriesSkeleton />
                    ) : (
                      eventsCategories.toJS().map((category, key) => (
                        <div className="categories-padding">
                          <div
                            onClick={() =>
                              this.clickHandlerEventCategory(key, category)
                            }
                            className={
                              key === selectedCategory
                                ? "event-categorie-active"
                                : "event-categorie"
                            }
                          >
                            {category.title}
                          </div>
                          {key === selectedCategory && (
                            <div className="category-underline" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className='loggedOut_state'>
              <section className='carousel-mainHolder'>
                <div className='carousel-holders-upper'>
                  {eventsLoadingStatus ? (
                   <div class="loader_skeleton_events"><EventsSkeleton /></div> 
                  ) : (
                    get(splittedData, '[0]', []).map(events => <EventCard key={get(events, 'id')} events={events} />)
                    // splittedData.map((events) => <EventsPage events={events} />)
                  )}
                </div>
                {!eventsLoadingStatus && (
                  <div
                    style={{
                      display: get(splittedData, '[0]', []).length > 4 ? "flex" : "none",
                      alignItems: "center",
                      justifyContent: "center",
                      width: '98%'
                    }}
                  >
                    <button
                      onClick={() => this.navButton("right", 'upper')}
                      className="carousel_next_btn-library"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="16" fill="#DCDCDC"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7057 8.4545C21.145 8.89384 21.145 9.60616 20.7057 10.0455L14.7511 16L20.7057 21.9545C21.145 22.3938 21.145 23.1062 20.7057 23.5455C20.2663 23.9848 19.554 23.9848 19.1147 23.5455L12.3647 16.7955C11.9253 16.3562 11.9253 15.6438 12.3647 15.2045L19.1147 8.4545C19.554 8.01517 20.2663 8.01517 20.7057 8.4545Z" fill="white"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => this.navButton("left", 'upper')}
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
                <div className='carousel-holders-lower'>
                  {get(splittedData, '[1]', []).map(events => <EventCard key={get(events, 'id')} events={events} />)}
                </div>
                {!eventsLoadingStatus && (
                  <div
                    style={{
                      display: get(splittedData, '[1]', []).length > 4 ? "flex" : "none",
                      alignItems: "center",
                      justifyContent: "center",
                      width: '98%'
                    }}
                  >
                    <button
                      onClick={() => this.navButton("right", 'lower')}
                      className="carousel_next_btn-library"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="16" fill="#DCDCDC"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7057 8.4545C21.145 8.89384 21.145 9.60616 20.7057 10.0455L14.7511 16L20.7057 21.9545C21.145 22.3938 21.145 23.1062 20.7057 23.5455C20.2663 23.9848 19.554 23.9848 19.1147 23.5455L12.3647 16.7955C11.9253 16.3562 11.9253 15.6438 12.3647 15.2045L19.1147 8.4545C19.554 8.01517 20.2663 8.01517 20.7057 8.4545Z" fill="white"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => this.navButton("left", 'lower')}
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
              </div>
              {
                eventsLoadingStatus && (
                  <div  className="events_caraousel_class_mobile width" >
                    <EventsSkeleton />
                  </div>
                )
              }
              {(!eventsLoadingStatus && eventsDetails && eventsDetails.toJS() && eventsDetails.toJS().length) ? (
                <div className="events_caraousel_class_mobile">
                  {eventsDetails
                      .toJS()
                      .map((events) => <EventCard selectedCategory={this.state.categoryId} key={get(events, 'id')} events={events} isLoggedIn={false} />)}
                </div>
              ) : null}
              {!(eventsLoadingStatus || eventsContentTagsLoadingStatus || eventsContentCategoriesLoadingStatus)
                && eventsDetails && eventsDetails.toJS() && eventsDetails.toJS().length === 0 ?
                <h1 className='event-noEvent-title'>Oops! No Event Available</h1> : null}
            </div>
            
          </div>
        );
    }


}

export default EventLibrary;