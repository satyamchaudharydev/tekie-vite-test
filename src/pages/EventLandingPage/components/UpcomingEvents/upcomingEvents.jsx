import React from "react";
import { useEffect, useState } from "react";
import EventCard from "../EventCard/EventCard";
import { get } from "lodash";
import "./upcomingEvents.scss";
import fetchEventsDetails from "../../../../queries/eventsLandingPage/fetchEventDetails";
import EventsSkeleton from "../EventsSkeleton/eventsSkeleton";
import CategoriesSkeleton from "../EventLibrary/components/CategoriesSkeleton";
import requestToGraphql from "../../../../utils/requestToGraphql";
import gql from "graphql-tag";
import moment from "moment";
import { hs } from "../../../../utils/size";

  const arrayCategory = [
    { idKey: 20, title: "Upcoming events" },
    { idKey: 1, title: "Completed Events" },
  ];

function UpcomingEvents({ value, ...props }) {
  const [selectedCategory, setselectedCategory] = useState(0);
  const [categoryId, setCategoryId] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [upcoming, setUpcoming] = useState(true);
  const [eventCurrentStatus, seteventCurrentStatus] = useState("upcoming");
  const [isEventExist, setIsEventExist] = useState(-1)
  const { eventsDetailsFetchStatus } = value;
  const upcomingLoadingStatus = get(
    eventsDetailsFetchStatus.toJS().upcoming,
    "loading",
    ""
  );
  const completedLoadingStatus = get(
    eventsDetailsFetchStatus.toJS().completed,
    "loading",
    ""
  );

  useEffect(() => {
    fetchEventsDetails(
      categoryId,
      false,
      props.userStudentProfileId,
      eventCurrentStatus
    );
  }, [eventCurrentStatus]);
  useEffect(() => {
    requestToGraphql(gql`{
    studentProfile(id:"${get(props, 'userStudentProfileId')}"){
      id
      eventsMeta(filter:{eventEndTime_lte:"${moment().toISOString()}"}){
        count
      }
    }
  }`).then(res => {
    if (get(res, 'data.studentProfile.eventsMeta.count')) {
      setIsEventExist(get(res, 'data.studentProfile.eventsMeta.count'))
    } else {
      setIsEventExist(0)
    }
  })
  }, [])

  const clickHandlerEventCategory = (key, category) => {
    setselectedCategory(key);
    setCategoryId(category.id);
    if (key === 1) {
      seteventCurrentStatus("completed");
      setCompleted(true);
      setUpcoming(false);
    }
    if (key === 0) {
      seteventCurrentStatus("upcoming");
      setCompleted(false);
      setUpcoming(true);
    }
  };
  const navButton = (action) => {
    let direction = 0;
    if (action === "left") {
      direction = 1;
    } else {
      direction = -1;
    }
    const sliderHolder = document.querySelector(".carousel-holders-upcoming");
    const eventCards = document.querySelectorAll("#eventCard-component");
    if (eventCards.length) {
      let far = (sliderHolder.clientWidth / 4) * direction;
      let pos = sliderHolder.scrollLeft + far;
      sliderHolder.scrollTo({ left: pos, behavior: "smooth" });
    }
  };
  const getEventLength = () => {
    let events = []
    if (upcoming) events = (value && value.upcomingEvents && value.upcomingEvents.toJS()) || []
    if (completed) events = (value && value.completedEvents && value.completedEvents.toJS()) || []
    return (upcomingLoadingStatus || completedLoadingStatus) ? 0 : (events.length || 0)
  }
  if ((!upcomingLoadingStatus && !completedLoadingStatus && getEventLength() === 0)) {
    return null;
  }
  return (
    <>
      <div className="event_Library_loggedIn_container">
        <div className="extra_div_container">
          <div className="event-library-box-upper">
            <h1 className="eventHeading">Your Events</h1>
            <div className="scroll-container">
              <div className="event-categories">
                {(isEventExist === -1) ? <CategoriesSkeleton /> : arrayCategory.map((category, key) => {
                  if (isEventExist === 0 && category.title === 'Completed Events') {
                    return <div />
                  }
                  return (
                    <div className="categories-padding">
                    <div
                      onClick={() => clickHandlerEventCategory(key, category)}
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
                  )
                }
                )}
              </div>
            </div>
          </div>
        </div>
        <section className="carousel-mainHolder">
          <div className="carousel-holders-upcoming">
            {upcomingLoadingStatus ? (
              <div className="eventsCard-loading-skeleton">
                <EventsSkeleton />
              </div>
            ) : upcoming ? (
              value.upcomingEvents
                .toJS()
                .map((event) => <EventCard key={get(event, 'id')} events={event} />)
            ) : (
              ""
            )}
            {completedLoadingStatus ? (
              <div className="eventsCard-loading-skeleton">
                {" "}
                <EventsSkeleton />{" "}
              </div>
            ) : completed ? (
              value.completedEvents
                .toJS()
                .map((event) => <EventCard key={get(event, 'id')} events={event} />)
            ) : (
              ""
            )}
          </div>
          {(!upcomingLoadingStatus || !completedLoadingStatus) && (
              <div
                style={{
                  display: getEventLength() > 4 ? "flex" : "none",
                  alignItems: "center",
                  justifyContent: "center",
                  width: '98%'
                }}
              >
                <button
                  onClick={() => navButton("right")}
                  className="carousel_next_btn-library"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="16" fill="#DCDCDC"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7057 8.4545C21.145 8.89384 21.145 9.60616 20.7057 10.0455L14.7511 16L20.7057 21.9545C21.145 22.3938 21.145 23.1062 20.7057 23.5455C20.2663 23.9848 19.554 23.9848 19.1147 23.5455L12.3647 16.7955C11.9253 16.3562 11.9253 15.6438 12.3647 15.2045L19.1147 8.4545C19.554 8.01517 20.2663 8.01517 20.7057 8.4545Z" fill="white"/>
                  </svg>
                </button>
                <button
                  onClick={() => navButton("left")}
                  className="carousel_next_btn-library"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 33 33" fill="none">
                    <rect x="32.3477" y="32.1719" width="32" height="32" rx="16" transform="rotate(180 32.3477 32.1719)" fill="#00ADE6"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.642 23.7174C11.2027 23.278 11.2027 22.5657 11.642 22.1264L17.5965 16.1719L11.642 10.2174C11.2027 9.77803 11.2027 9.06572 11.642 8.62638C12.0813 8.18704 12.7937 8.18704 13.233 8.62638L19.983 15.3764C20.4223 15.8157 20.4223 16.528 19.983 16.9674L13.233 23.7174C12.7937 24.1567 12.0813 24.1567 11.642 23.7174Z" fill="white"/>
                  </svg>
                </button>
              </div>
          )}
          {(!upcomingLoadingStatus && !completedLoadingStatus && getEventLength() === 0) ?
                <h1 className='event-noEvent-title fromUpcoming'>Oops! No Event Available</h1> : null}
        </section>
      </div>
    </>
  );
}

export default UpcomingEvents;
