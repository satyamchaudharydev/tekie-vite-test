import React from 'react';
import cx from 'classnames'
import { get } from 'lodash';
import getPath from '../../../../utils/getPath';
// import './style.scss'
import './eventCompletionBanner.scss'
import { connect } from 'react-redux';
import { filterKey } from '../../../../utils/data-utils';
// import { Link } from "react-router-dom";
import ReactHtmlParser from 'react-html-parser'

const EventCompletionBanner = ({ data,
  renderActionButton, ...restProps }) => {
    const momentFromEventLink = get(data, 'momentFromEventLink')
    return (
      <>
        <div className={`eventCompletionBanner-container ${get(restProps, 'fromWebBanner', false) && 'eventCompletionBanner-container-carousel'}`}>
          <div
            className={cx("eventCompletionBanner-posterBanner")}
            style={
              {
                background: `url(${getPath(get(data, "eventBanner.uri"))})`, // Uncomment while final Push
              }
            }
          >
            {/* <div className="background-mask"></div>
            <div className="background-mask-2"></div>
            <div className="background-mask-3"></div> */}
            {/* <div className="school-icon"></div> */}
            <div className="info-container">
              {/* <div className="event-completion-banner-head"></div> */}
              {momentFromEventLink ? (
                <div className="event-completion-banner-heading">
                  {momentFromEventLink && 'Catch all the Moments from'}<br />
                </div>
              ) : null}
                <div className='event-completion-banner-desc'>{ReactHtmlParser((get(data, 'summary')))}</div>
                {renderActionButton()}
              </div>
          </div>
        </div>
        <div
          className="eventCompletionBanner-posterBannerMb"
          style={{
            backgroundImage: `url(${getPath(
              get(data, "eventMobileBanner.uri")
            )})`, // Uncomment while final Push
          }}
        >
          <div className="eventCompletionBanner-hero-column-wrapper">
          <div className="info-container">
                <div className="event-completion-banner-head"></div>
                <div className="event-completion-banner-heading">
                {momentFromEventLink && 'Catch all the Moments from'}<br />
                {momentFromEventLink && <span className='event-completion-color-blue'>{get(data, 'name')}</span>}
                </div>
              <div className='event-completion-banner-desc'>{ReactHtmlParser((get(data, 'summary')))}</div>
              {renderActionButton()}
              </div>
          </div>
          <div className="eventCompletionBanner-posterBannerMb-gradient" />
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

export default connect(mapStateToProps)(EventCompletionBanner)
