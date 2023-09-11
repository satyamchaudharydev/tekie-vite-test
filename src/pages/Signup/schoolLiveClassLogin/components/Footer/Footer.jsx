/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import classes from './Footer.module.scss'
import { FOOTER_BREAKPOINT, FOOTER_DESKTOP_TEXT, FOOTER_MOBILE_TEXT } from '../../constants/constants';
import Google from '../../assets/google.png';
import Intel from '../../assets/intel.png';
import Uber from '../../assets/uber.png';
import IITD from '../../assets/iitd.png';
import { ImageBackground } from '../../../../../image';
import { Link } from 'react-router-dom';
import serverPageLinks from '../../../../../constants/serverPageLinks';

export default function Footer() {
    const IS_WINDOW_EXIST = typeof window !== 'undefined'
    const renderFooterText = () => {
        return FOOTER_DESKTOP_TEXT
    }

    const renderFooter = () => (
        <div className={classes['subDomain-landing-page-footer-container']}>
            <div className={classes['subDomain-landing-page-footer-leftContainer']}>

                <span>© 2022, Kiwhode Learning Pvt Ltd. All Rights Reserved.</span>
            </div>
            <div className={classes['subDomain-landing-page-footer-rightContainer']}>
                <a href={serverPageLinks.privacy} className={classes['subDomain-landing-page-footer-privacyAndTerms']} target={'_blank'}>
                    <span>Privacy</span>
                </a>
                <a href={serverPageLinks.terms} className={classes['subDomain-landing-page-footer-privacyAndTerms']} target={'_blank'}>
                    <span>Terms</span>
                </a>
            </div>
        </div>
    )

    return <footer className={classes.footer}>

        {renderFooter()}

    </footer>;
}
