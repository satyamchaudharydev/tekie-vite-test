import React from 'react';
import cx from 'classnames'
import { get } from 'lodash';
import getPath from '../../../../utils/getPath';
import './style.scss'
import { CalendarIcon, ClockIcon, DurationClock, CalendarIconMobile, ClockIconMobile, DurationClockMobile } from '../../../../constants/icons';
import './eventBanner.scss'
import { connect } from 'react-redux';
import { filterKey } from '../../../../utils/data-utils';
import DescriptionsSkeleton from '../../pages/EventDescription/DescriptionsSkeletons';
import ReactHtmlParser from 'react-html-parser'

const EventBanner = ({ data,
  getEventActions = () => { return { eventDate: '', eventTime: '' } },
  renderActionButton = () => <></>, fromLandingPage, ...restProps }) => {
  const {
    eventDate,
    eventTime,
  } = getEventActions()
    return (
      <>
        <div className={`eventBanner-container ${get(restProps, 'fromWebBanner', false) && 'eventBanner-container-carousel'}`}>
          <div
            className={cx("eventBanner-posterBanner")}
            style={
              {
                  background: `url(${getPath(get(data, "eventBanner.uri"))})`, // Uncomment while final Push
              }
            }
          >
            {get(restProps, 'isEventDataFetching', false) && (
              <>
                <div className="background-mask"></div>
                <div className="background-mask-2"></div>
                <div className="background-mask-3"></div>
              </>
            )}
            {/* <div className="school-icon"></div> */}
            {!false && (
              get(restProps, 'isEventDataFetching', false) ? (
                <DescriptionsSkeleton forSection='eventName' />
              ) : <div />
            )}
            <div className="info-container">
                <div className="banner-head"></div>
                <div className="eventBanner-description">
                    {get(restProps, 'isEventDataFetching', false)
                      ? <DescriptionsSkeleton forSection='eventSummary' />
                      : ReactHtmlParser((get(data, 'summary')))}
                </div>
                <div className="eventBanner-hero-column-wrapper">
                  <div className="row">
                    {get(restProps, 'isEventDataFetching', false) ? (
                      <DescriptionsSkeleton forSection='eventDetails' />
                    ) : (
                      <>
                        {eventDate ? (<>
                          <CalendarIcon />
                          <span>
                            {eventDate}
                          </span>
                        </>) : ''}
                      </>
                    )}
                  </div>
                  <div className="row">
                    {get(restProps, 'isEventDataFetching', false) ? (
                      <DescriptionsSkeleton forSection='eventDetails' />
                    ) : (
                      <>
                        {eventTime ? (<>
                          <ClockIcon />
                          <span>
                            {eventTime}
                          </span>
                        </>) : ''}
                      </>
                    )}
                  </div>
                  <div className="row">
                    {get(restProps, 'isEventDataFetching', false) ? (
                      <DescriptionsSkeleton forSection='eventDetails' />
                    ) : (
                      <>
                        {eventTime ? (<>
                          <DurationClock />
                          <span>60-75 Minutes</span>
                        </>) : ''}
                      </>
                    )}
                  </div>
                </div>
                {renderActionButton()}
              </div>
          </div>
        </div>
        <div
          className="eventBanner-posterBannerMb"
          style={{
            backgroundImage: get(restProps, 'isEventDataFetching', false)
              ? 'linear-gradient(180deg, rgba(40, 40, 40, 0) 30%, rgb(0, 23, 31) 50%)' : `url(${getPath(
              get(data, "eventMobileBanner.uri")
            )})`,
          }}
        >
          <div className="eventBanner-hero-column-wrapper">
            {get(restProps, 'isEventDataFetching', false) ? (
                <DescriptionsSkeleton forSection='eventName' />
              ) : <div />}
            <div className="row">
              {get(restProps, 'isEventDataFetching', false) ? (
                  <DescriptionsSkeleton forSection='eventDetails' />
                ) : (
                  <>
                  <CalendarIconMobile />
                  <span>
                    {eventDate}
                  </span>
                  </>
                )}
            </div>
            <div className="row">
              {get(restProps, 'isEventDataFetching', false) ? (
                <DescriptionsSkeleton forSection='eventDetails' />
              ) : (
                <>
                <ClockIconMobile />
                <span>
                  {eventTime}
                </span>
                </>
              )}
            </div>
            <div className="row">
              {get(restProps, 'isEventDataFetching', false) ? (
                <DescriptionsSkeleton forSection='eventDetails' />
              ) : (
                <>
                <DurationClockMobile />
                <span className="event-details-text">60-75 Minutes</span>
                </>
              )}
            </div>
            <div className="eventBanner-description">
              {get(restProps, 'isEventDataFetching', false)
                  ? <DescriptionsSkeleton forSection='eventSummary' />
                : <p style={{ margin: 0 }}>{ReactHtmlParser((get(data, 'summary')))}</p>}
            </div>
            {renderActionButton()}
            {/* <div>{ll === false &&<div><button className='events_register_button1'>Register now <span style={{marginLeft:"6px",display:"flex",alignItems:"center",justifyContent:"center"}}><ArrowIcon /></span></button></div>}</div> */}
          </div>
          <div className="eventBanner-posterBannerMb-gradient" />
        </div>
      </>
    );
}

const mapStateToProps = (state) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
    state.data.getIn(['userChildren', 'data']).size,
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser'),
    eventsDetails: filterKey(state.data.getIn(['eventsDetails', 'data']) ,"eventsDetails" ),
    completedEvents: filterKey(state.data.getIn(['eventsDetails', 'data']) , "completed"),
    upcomingEvents: filterKey(state.data.getIn(['eventsDetails', 'data']),"upcoming"),
    eventsDetailsFetchStatus: state.data.getIn(['eventsDetails', 'fetchStatus']),
    userStudentProfileId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'studentProfile', 'id'], false),
    studentProfileIdConnect: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0], false) || filterKey(state.data.getIn(['user', 'data']), 'validateOTP').getIn([0], false),
    isUpdatingEvent: state.data.getIn(['events', 'updateStatus', 'events', 'loading']),
    hasUpdateEventFailed: state.data.getIn(['events', 'updateStatus', 'events', 'failure']),
    hasUpdatedEvent: state.data.getIn(['events', 'updateStatus', 'events', 'success']),
    updateEventFailedMessage: state.data.getIn(['errors', 'events/update']),
})

export default connect(mapStateToProps)(EventBanner)
