import React from 'react';
import styles from "./errorBoundaryFallback.module.scss";
import lockedHomepage from "../../assets/lockedHomepage.svg";
import * as Sentry from "@sentry/react";
import { RELOAD_ATTEMPTS_COUNT } from '../../routesConfig';

class ErrorBoundaryFallback extends React.Component{
    constructor(props) {
        super(props);
        this.state = {}
    }
    
    render() {
        // check if the window has already been refreshed
        const refreshedCount = JSON.parse(
            window.sessionStorage.getItem('retry-page-refreshed') || 'false'
        );

        if (refreshedCount < RELOAD_ATTEMPTS_COUNT) { // not been refreshed yet
            window.sessionStorage.setItem('retry-page-refreshed', refreshedCount + 1); // we are now going to refresh
            setTimeout(() => {
                return window.location.reload(); // refresh the page
            }, 1500)
            return (
                <div className={styles.mainContainer}>
                    <h4 className={styles.stayTunned}>
                        Retrying (Tries: {(refreshedCount||0)+1}), Please wait...
                    </h4>
            </div>
            )
        }

        return (
            <div className={styles.mainContainer}>
                <img
                    src={lockedHomepage}
                    class={styles.responsiveImage}
                    alt='Tekie Responsive'
                ></img>
                <h2 className={styles.somethingCooking}>Something Went Wrong</h2>
                {this.props.error && this.props.error.message ? (
                    <h4 className={styles.stayTunned}>
                        [{this.props.error.name || 'Error'}]{' '}
                        {this.props.error.message}
                    </h4>
                ) : ''}
            </div>
        )
    }
}

export default ErrorBoundaryFallback;