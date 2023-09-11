import extractSubdomain from "./extractSubdomain";
import { LOCALHOST, HOSTNAME, environments } from "../constants";

// this function redirects student or teacher to their dedicated application
// this is only supposed to be used when the student/teacher is trying to login
// from "tekie.in", which is a common place.

/**
 * @param {string} token magic link token which will be sent with the url, will be used to authenticate user
 * @param {string} userRole it can be either "student" or "teacher"
 */
const redirectAccordingToSubdomainAndEnvironment = (token, userRole, shouldRedirect = true, fromOtpScreen,ebookID) => {
  // if we're on teacher's subdomain, do nothing
  const loginViaOtpQuery = fromOtpScreen ? '&fromOtpScreen=true' : ''
  if (extractSubdomain().includes(userRole)) return;

  // extracting protocol from current url it can be http: or https: , port and hostname
  const { protocol, port, hostname } = window.location;

  // checking if on dev environment
  const isLocalhost = hostname === LOCALHOST;
  if (isLocalhost) {
    // forcefully redirecting because no else method is available using react-router-v5
    let redirectUrlVal =  `${protocol}//${userRole}:${port}`
    if(ebookID && ebookID !== 'undefined'){
      redirectUrlVal = `${redirectUrlVal}&ebookId=${ebookID}`
    }
    if (shouldRedirect){
      window.location.href = redirectUrlVal
    }
    return redirectUrlVal
  }

  // checking if on production environment
  // const isProduction = hostname === HOSTNAME;
  // if (isProduction) {
  //   // forcefully redirecting because no else method is available using react-router-v5
  //   window.location.href = `${protocol}//${userRole}.${HOSTNAME}?authToken=${token}`;
  //   return;
  // }

  // otherwise redirect to required environment according to NODE_ENV
  const environment = environments[import.meta.env.REACT_APP_NODE_ENV];
  const extractedDomain = extractSubdomain() || ''
    let redirectBaseUrl = ''
    const { dev, staging, preProd } = environments
    switch (true) {
        case extractedDomain.includes(dev):
            redirectBaseUrl = `https://${userRole}-dev.tekie.in`
            break;
        case extractedDomain.includes(staging):
            redirectBaseUrl = `https://${userRole}-staging.tekie.in`
            break;
        case extractedDomain.includes(preProd):
            redirectBaseUrl = `https://${userRole}-preprod.tekie.in`
            break;
        default:
            redirectBaseUrl = `https://${userRole}.tekie.in`
            break;
    }       
    redirectBaseUrl = `${redirectBaseUrl}`
    if(ebookID && ebookID !== 'undefined'){
      redirectBaseUrl = `${redirectBaseUrl}&ebookId=${ebookID}`
    }
  if (shouldRedirect) window.location.href = `${redirectBaseUrl}`;
  else return `${redirectBaseUrl}`
};

export default redirectAccordingToSubdomainAndEnvironment;
