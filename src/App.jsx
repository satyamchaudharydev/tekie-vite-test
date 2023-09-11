import React, { Component, } from 'react'
import { isPlainObject, get } from 'lodash'
import { fromJS } from 'immutable'
import { Route, BrowserRouter as Router, withRouter } from 'react-router-dom'
import moment from 'moment'
import { hotjar } from 'react-hotjar'
import qs from 'query-string'
import './App.scss'
import GA from './utils/analytics/ga'
import store from './store'
import { keysToCache } from './config'
import './index.scss';
import UAParserLib from 'ua-parser-js';
import getMe from './utils/getMe'
import Routes from './routes'



if (typeof window !== 'undefined') {
  window.moment = moment

  window.fresh = () => {
    const data = localStorage.getItem('data')
    let newData = {}
    if (data) {
      const parsedData = JSON.parse(data)
      newData.user = parsedData.user
      newData.studentProfile = parsedData.studentProfile
    }
    localStorage.clear()
    localStorage.setItem('data', JSON.stringify(newData))
  }

  window.getMe = getMe
}

const isElectron = typeof window === 'undefined' ? false : !!window.native

class App extends Component {
  state = {
    renderKey: 0,
    hasCheckedVersion: true
  }

  async setDeviceInfo() {
    try {
      // eslint-disable-next-line no-undef
      const parser = new UAParserLib();
      const data = parser.getResult();
      if (typeof localStorage !== 'undefined') {
        if (data) {
          const deviceInfo = {
            browser: get(data, 'browser.name', ''),
            browserVersion: get(data, 'browser.version', ''),
            deviceOs: get(data, 'os.name', ''),
            osVersion: get(data, 'os.version', ''),
            deviceType: get(data, 'device.type', get(window, 'navigator.userAgentData.mobile', false) ? 'mobile' : 'desktop')
          }
          localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo))
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async setLoaction() {
    this.askUserForLocation()
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    if (typeof localStorage !== 'undefined') {
      if (data) {
        if (data.country_code) {
          localStorage.setItem('country_code', data && data.country_code)
        }
        if (data.timezone) {
          localStorage.setItem('timezone', data && data.timezone)
        }
        localStorage.setItem('ipapi', JSON.stringify(data))
      }
    }
    this.setState(prev => ({ renderKey: prev.renderKey + 1 }))
  }

  askUserForLocation() {
    //geo location api
  }

  checkForVersionLogout() {
    if (typeof localStorage === 'undefined') {
      this.setState({ hasCheckedVersion: true })
      return;
    }

    const appVersion = import.meta.env.REACT_APP_VERSION
    const shouldLogout = import.meta.env.REACT_APP_SHOULD_LOGOUT
    if (appVersion) {
      const appVersionInClient = localStorage.getItem('appVersion')
      if (appVersionInClient && appVersionInClient === appVersion) {
        this.setState({ hasCheckedVersion: true })
      } else {
        if (shouldLogout) {
          store.dispatch({ type: 'LOGOUT' })
        }
      }
    }
    setTimeout(() => {
      this.setState({ hasCheckedVersion: true })
    }, 400)
  }

  checkNetSpeed = async () => {
    // const netSpeedInMbps = localStorage.getItem("netSpeedInMbps")
    // if (!netSpeedInMbps) {
    //   let speedtest = new FastSpeedtest({
    //     token: import.meta.env.REACT_APP_FAST_API_TOKEN,
    //     unit: FastSpeedtest.UNITS.Mbps
    //   });

    //   speedtest.getSpeed().then(speed => {
    //     localStorage.setItem("netSpeedInMbps", speed)
    //   })
    // }
  }

  async componentDidMount() {

    if (isElectron) {
      const locationState = localStorage.getItem(`location/${this.props.history.location.pathname}`)
      const navigationType = window.performance && window.performance.navigation && window.performance.navigation.type
      // check if location state is in localstorage and user reloaded browser
      // update both window.location and react-router's location
      if (locationState && navigationType === 1) {
        window.location.state = JSON.parse(locationState)
        // Mutating props directly, but only thing that works, so 🤷
        this.props.history.location.state = JSON.parse(locationState)
      } else if (locationState) {
        // check if location state is in localstorage and user navigated to a new page
        // delete localstorage state
        localStorage.removeItem(`location/${this.props.history.location.pathname}`)
      }
    }

    window.addEventListener('hashchange', () => {
      if (isElectron) {
        // If route includes "?", update location.search
        if (window.location.hash.includes('?')) {
          window.location.search = window.location.hash
        }
        if (!get(window, 'location.state') && get(this.props, 'location.state')) {
          // updte window.location.state and also 
          window.location.state = this.props.location.state
          localStorage.setItem(`location/${this.props.history.location.pathname}`, JSON.stringify(this.props.location.state))
        }
      }
    });

    const UA = navigator && navigator.userAgent;
    let PLATFORM = null, standalone = null;
    let PWA_INSTALLED = null;
    if (UA) {
      const IOS = UA.match(/iPhone|iPad|iPod/);
      const ANDROID = UA.match(/Android/);

      PLATFORM = IOS ? "ios" : ANDROID ? "android" : "unknown";

      standalone = window.matchMedia("(display-mode: standalone)").matches;

      PWA_INSTALLED = !!(standalone || (IOS && !UA.match(/Safari/)));
      localStorage.setItem('PWA_INFO', JSON.stringify({
        referrer: document.referrer,
        PLATFORM,
        standalone,
        UA,
        PWA_INSTALLED,
      }))
    }
    if (typeof window !== 'undefined') {
      window.__SSR__ = false
    }
    if (typeof localStorage !== 'undefined') {
      if (
        !window.localStorage.getItem('deviceInfo') ||
        window.localStorage.getItem('deviceInfo') === 'null' ||
        window.localStorage.getItem('deviceInfo') === 'undefined'
      ) {
        await this.setDeviceInfo()
      }
    }
    if (typeof localStorage !== 'undefined') {
      if (
        !window.localStorage.getItem('country_code') ||
        !window.localStorage.getItem('timezone') ||
        !window.localStorage.getItem('ipapi') ||
        window.localStorage.getItem('country_code') === 'null' ||
        window.localStorage.getItem('timezone') === 'null' ||
        window.localStorage.getItem('ipapi') === 'null' ||
        window.localStorage.getItem('country_code') === 'undefined' ||
        window.localStorage.getItem('timezone') === 'undefined' ||
        window.localStorage.getItem('ipapi') === 'undefined'
      ) {
        // await this.setLoaction()
      }
    }
    this.checkForVersionLogout()
    if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
      //initialize fb pixel

      // initializing hotjar
      if (import.meta.env.REACT_APP_HJID && import.meta.env.REACT_APP_HJSV) {
        hotjar.initialize(import.meta.env.REACT_APP_HJID, import.meta.env.REACT_APP_HJSV);
      }
    }

    // check for referralCode in url
    const query = qs.parse(window.location.search)
    if (query.referralCode) {
      sessionStorage.setItem('referralCode', query.referralCode);
      this.setState({ renderKey: this.state.renderKey + 1 })
    }
    if (query.schoolName) {
      sessionStorage.setItem('schoolName', query.schoolName);
      this.setState({ renderKey: this.state.renderKey + 1 })
    }
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      // getNetSpeed()
    }
  }

  render() {
    if (!this.state.hasCheckedVersion) return <div></div>
    return (
      <>
        {GA.init() && <GA.RouteTracker />}
        <Routes {...this.props} renderKey={this.state.renderKey} fromSSR={this.props.fromSSR || false} />

      </>
    )
  }
}

const AppWithAsyncStorage = (props) => {
  if (typeof localStorage !== 'undefined') {
    const storedData = localStorage.getItem('data')
    if (storedData && storedData.length) {
      let data = fromJS(JSON.parse(storedData))
      for (const keyToCache of keysToCache) {
        const fetchStatusIm = data.getIn([keyToCache, 'fetchStatus'])
        if (fetchStatusIm) {
          const fetchStatus = fetchStatusIm.toJS()
          const newFetchStatus = {}
          for (const key in fetchStatus) {
            newFetchStatus[key] = {
              ...fetchStatus[key],
              loading: false
            }
          }
          data = data.setIn([keyToCache, 'fetchStatus'], fromJS(newFetchStatus))
        }
        if (isPlainObject(keyToCache) && keyToCache.overrideChildren) {
          for (const overrideChild of keyToCache.overrideChildren) {
            data = data.setIn([keyToCache.key, overrideChild.key], overrideChild.value)
          }
        }
      }

      store.dispatch({
        type: 'loadFromLocalStorage',
        data
      })
    }
  }

  return (
    <>
      <App {...props} />
    </>
  );
}

export default withRouter(AppWithAsyncStorage)
