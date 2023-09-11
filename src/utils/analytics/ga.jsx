// utils/GoogleAnalytics.js
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { Route } from 'react-router-dom';

// let ReactPixel = null
const gaid = import.meta.env.REACT_APP_GA_ID
export const trackPixel = (...args) => {
  // if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
  //   if (!ReactPixel) {
  //     import('react-facebook-pixel')
  //       .then((ReactPixelModule) => {
  //         ReactPixel = ReactPixelModule.default
  //         ReactPixel.trackCustom(...args)
  //       })
  //     } else {
  //       ReactPixel.trackCustom(...args)
  //   }
  // }
}

export const RegisterUserPageGA = (props = {}) => {
  ReactGA.event({
    category: "Register User",
    ...props,
  });
  trackPixel("Register User", props)
}

export const SessionsGA = (props = {}) => {
  ReactGA.event({
    category: "Sessions",
    ...props,
  });
  trackPixel("Sessions", props)
}

export const BuyNowGA = (label, props = {}) => {
  LandingPageEventsGA({
    action: "Buy Now",
    label,
    ...props,
  })
}

export const StudentCommunityPageEventsGA = (props = {}, eventCategory) => {
  ReactGA.event({
    category: eventCategory || "StudentCommunity Page Events",
    ...props,
  });
  trackPixel("StudentCommunity Page Events", props)
}

export const LandingPageEventsGA = (props = {}) => {
  ReactGA.event({
    category: "LandingPage Events",
    ...props,
  });
  trackPixel("LandingPage Events", props)
}

export const LinksClicksGA = (label, props = {}) => {
  LandingPageEventsGA({
    action: "Link Clicks",
    label,
    ...props,
  })
}

export const FAQClickOpenGA = (label, props = {}) => {
  LandingPageEventsGA({
    action: "FAQ Click: Open",
    label,
    ...props,
  })
}

export const FAQClickCloseGA = (label, props = {}) => {
  LandingPageEventsGA({
    action: "FAQ Click: Close",
    label,
    ...props,
  })
}

export const enrollNowGA = (label, props = {}) => {
  RegisterUserPageGA({
    action: "Enroll Now Button Click",
    label,
    ...props,
  })
}

export const registeredGA = (label, props = {}) => {
  RegisterUserPageGA({
    action: "User Registered",
    label,
    ...props,
  })
}

export const registrationFailedGA = (label, props = {}) => {
  RegisterUserPageGA({
    action: "Registration Failed.",
    label,
    ...props,
  })
}


export const SessionBookedGA = (label, props = {}) => {
  SessionsGA({
    action: "Booked",
    label,
    ...props,
  })
}

export const SessionRescheduledGA = (label, props = {}) => {
  SessionsGA({
    action: "Rescheduled",
    label,
    ...props,
  })
}

export const SessionCancelGA = (label, props = {}) => {
  SessionsGA({
    action: "Cancel Session",
    label,
    ...props,
  })
}

class GoogleAnalytics extends Component {
  componentDidMount() {
    this.logPageChange(
      this.props.location.pathname,
      this.props.location.search
    );
  }

  componentDidUpdate({ location: prevLocation }) {
    const { location: { pathname, search } } = this.props;
    const isDifferentPathname = pathname !== prevLocation.pathname;
    const isDifferentSearch = search !== prevLocation.search;

    if (isDifferentPathname || isDifferentSearch) {
      this.logPageChange(pathname, search);
    }
  }

  logPageChange(pathname, search = '') {
    const page = pathname + search;
    const { location } = window;
    ReactGA.set({
      page,
      location: `${location.origin}${page}`,
      ...this.props.options
    });
    ReactGA.pageview(page);
  }

  render() {
    return null;
  }
}


const RouteTracker = () => <Route component={GoogleAnalytics} />;

const init = (options = {}) => {
  ReactGA.initialize(gaid);
  return true;
};

export default {
  GoogleAnalytics,
  RouteTracker,
  init
};