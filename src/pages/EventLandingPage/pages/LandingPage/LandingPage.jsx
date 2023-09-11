import React from "react";
import Banner from "../../components/EventDescriptionBanner/EventDescriptionBanner";
import Footer from "../../components/Footer/Footer";
import EventFaq from "../../components/EventFaq/EventFaq";
import JoinTrib from "../../components/JoinTrib/JoinTrib";
import Testimonials from "../../components/Testimonials/Testimonial";
import EventLibrary from "../../components/EventLibrary/EventLibrary";
import Header from "../../components/Header/Header";
import "./LandingPage.styles.scss";
import isMobile from "../../../../utils/isMobile";
import CourseNav from "../../../../components/CourseNav";
import MobileNavbar from "../../components/MobileNavbar/mobileNavbar";
import EventLibraryLoggedIn from "../../components/EventLibraryLoggedIn/EventLibraryLoggedIn";
import UpcomingEvents from "../../components/UpcomingEvents/upcomingEvents";
import NavBar from "../../components/NavBar/NavBar";
import EventWebBanner from "../../components/EventWebBanner/EventWebBanner";

import "./fonts/Gilroy.css";
import VideoDiv from "../../components/VideoDiv/VideoDiv";
import { get } from "lodash";
import BannerSkeleton from "../../components/EventWebBanner/EventBannerLoading";
import { testimonialsData } from "../../constants";

class EventsLandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      clickedCourses: false,
      clickedResources: false,
    };
  }
  isCustomHeaderVisible = () => {
    const {
      isLoggedIn,
      match,
      hasMultipleChildren = false,
      userId,
    } = this.props;
    if (hasMultipleChildren && !userId) {
      return true;
    }
    if (!isLoggedIn && match.path.split("/").includes("events")) {
      return true;
    }
    return false;
  };

  clickerHamburger = () => {
    this.setState((prevState) => ({
      clicked: !prevState.clicked,
    }));
  };

  clickerCourses = () => {
    this.setState((prevState) => ({
      clickedCourses: !prevState.clickedCourses,
    }));
  };

  clickerResources = () => {
    this.setState((prevState) => ({
      clickedResources: !prevState.clickedResources,
    }));
  };
  renderLoggedInBanner = () => {
    const bannerFetchStatus = (get(this.props, 'eventsDetailsFetchStatus') && get(get(this.props, 'eventsDetailsFetchStatus').toJS(), "upcoming.loading", ""))
    if (bannerFetchStatus) {
      return <BannerSkeleton />
    }
    const { userStudentProfileId } = this.props;
    return <EventWebBanner
        upcomingEvents={this.props.upcomingEvents}
        userStudentProfileId={userStudentProfileId}
        status={this.props}
      />
  }
  render() {
    const { clicked, clickedCourses, clickedResources } = this.state;
    const { isLoggedIn, userStudentProfileId } = this.props;
    return (
      <>
        <div className="event-landing-page">
          <section
            style={{ display: clicked ? "inline" : "none" }}
            class="lp-navbar-mobile close__wt"
          >
            <MobileNavbar
              click={this.clickerHamburger}
              clickerCourses={this.clickerCourses}
              clickerResources={this.clickerResources}
              clickedCourses={clickedCourses}
              clickedResources={clickedResources}
            />
          </section>
          <div
            style={{ display: clicked ? "none" : "block" }}
            className="anti-scroll-container"
          >
            {this.isCustomHeaderVisible() ? (
              <Header click={this.clickerHamburger} />
            ) : (
              <NavBar />
            )}
            {(isMobile() && !this.isCustomHeaderVisible()) ? (
              <CourseNav fromEventsPage={true} />
            ) : null}
            {isLoggedIn ? (
              this.renderLoggedInBanner()
            ) : (
              <Banner />
            )}
            {isLoggedIn ? (
              <UpcomingEvents
                value={this.props}
                userStudentProfileId={userStudentProfileId}
              />
            ) : null}
            {isLoggedIn ? (
              <EventLibraryLoggedIn
                value={this.props}
                userStudentProfileId={userStudentProfileId}
              />
            ) : (
              <EventLibrary value={this.props} />
            )}
            {/* <VideoDiv /> */}
            {!isLoggedIn ? (
              <div className="quotes-container">
                <div className="lp-testimonial-head-quote">
                            <span style={{ position: "relative" }}>
                    <div className="lp-testimonial-up-quote"></div>
                    <span className="content-green">Loved</span> By Students.
                    <br />
                    <span className="content-green">Trusted</span> By Parents.
                    <div className="lp-testimonial-down-quote"></div>
                  </span>
                </div>
              </div>
            ) : null}
            <div className="scroll-container">
              {!isLoggedIn ? (
                <div className="event-testimonial">
                  {testimonialsData.map(testimonial => (
                    <Testimonials testimonial={testimonial} />
                  ))}
                </div>
              ) : null}
            </div>
            <JoinTrib />
            <div id="event__details">
              <EventFaq />
            </div>
            <Footer />
          </div>
        </div>
      </>
    );
  }
}

export default EventsLandingPage;
