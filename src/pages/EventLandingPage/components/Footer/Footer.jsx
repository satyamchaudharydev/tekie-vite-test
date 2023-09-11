import React from 'react';
import TekieLogo from '../../../../../src/assets/eventPage/TekieLogo.svg'
import Footer_fb_icon from '../../../../../src/assets/eventPage/Footer_fb_icon.svg'
import Footer_insta_icon from '../../../../../src/assets/eventPage/Footer_insta_icon.svg'
import Footer_link_icon from '../../../../../src/assets/eventPage/Footer_link_icon.svg'
import Footer_yt_icon from '../../../../../src/assets/eventPage/Footer_yt_icon.svg'
import './styles.scss'

const Footer = () => {
    return (
      <div class="lp-footer-container description-page">
      <div class="lp-footer-address-and-socials-container">
        <div class="lp-footer-tekie-logo">
          <img src={TekieLogo} alt="tekie logo" />
        </div>
        <div class="lp-footer-address">
          <p>
            <span>© 2020, Kiwhode Learning Pvt Ltd.</span>
            <span>All Rights Reserved.</span>
          </p>
        </div>
        <div class="lp-footer-social-container">
          <p>Socials: </p>
          <ul class="lp-footer-socials">
            <a href="https://www.facebook.com/tekie.in/" rel="noopener noreferrer" target="_blank">
              <li>
                <img src={Footer_fb_icon} alt="fb" />
              </li>
            </a>
            <a href="https://www.instagram.com/tekie.in/" rel="noopener noreferrer" target="_blank">
              <li>
                <img src={Footer_insta_icon} alt="insta" />
              </li>
            </a>
            <a href="https://www.linkedin.com/company/tekie" rel="noopener noreferrer" target="_blank">
              <li>
                <img src={Footer_link_icon} alt="link" />
              </li>
            </a>
            <a href="https://www.youtube.com/channel/UCCr7GPlTdZRXFEfveeuKcbg" rel="noopener noreferrer" target="_blank">
              <li>
                <img src={Footer_yt_icon} alt="yt" />
              </li>
            </a>
          </ul>
        </div>
        </div>
        <div class="lp-footer-tekie-info-container">
          <div>
            <h3 class="lp-footer-listHeading">Legal</h3>
            <ul class="lp-footer-links-list">
              <li>
                <p class="lp-footer-listItem">
                  <p className="Footer_legal_txt">
                    <a href="/terms">Terms of service</a>
                  </p>
                  <p className="Footer_legal_txt">
                    <a href="/privacy">Privacy policy</a>
                  </p>
                  <p className="Footer_legal_txt">
                    <a href="/refund">Refund Policy</a>
                  </p>
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
}

export default Footer;