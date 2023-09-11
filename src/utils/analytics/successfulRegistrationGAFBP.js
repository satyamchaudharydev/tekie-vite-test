import ReactGA from 'react-ga'

const successfulRegistrationGAFBP = (data) => {
    if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
      ReactGA.event({
        category: "Successful Registration",
        action: 'success'
      })
    }
}


export default successfulRegistrationGAFBP