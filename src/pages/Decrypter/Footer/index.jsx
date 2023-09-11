import React from "react";
import cx from "classnames";
import { Link } from "react-router-dom";
import { ImageBackground } from "../../../image";
import { LinksClicksGA } from "../../../utils/analytics/ga";
import "swiper/swiper.scss";
import "react-phone-input-2/lib/style.css";
import "./styles.scss";

const Footer = () => {
  return (
    <div className={"footer-footer-container"}>
      <div className="footer-flex-container">
        <div className="flex-footer start">
          <ImageBackground
            className={cx("footer-footer-tekieLogo", "sr-200-35-600")}
            src={require("../../../assets/tekieLogoDrop.png")}
            srcLegacy={require("../../../assets/tekieLogoDrop.png")}
            style={{ cursor: "pointer" }}
          />
          <span className={"footer-footer-subText"}>
            © 2020, Kiwhode Learning Pvt Ltd. All Rights Reserved.
          </span>
        </div>
        <div className="flex-footer center">
          <div className={"footer-socialMediaContainer"}>
            <div className={"footer-socialMediaWrapper"}>
              {/* eslint-disable jsx-a11y/anchor-has-content */}
              <a
                onClick={() => LinksClicksGA("Facebook Link")}
                className={cx("footer-socialMediaIcon", "footer-smFacebook")}
                href="https://www.facebook.com/Tekie.in/"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              <a
                onClick={() => LinksClicksGA("Instagram Link")}
                className={cx("footer-socialMediaIcon", "footer-smInstagram")}
                href="https://www.instagram.com/tekie.in/"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              <a
                onClick={() => LinksClicksGA("Linkedin Link")}
                className={cx("footer-socialMediaIcon", "footer-smLinkedin")}
                href="https://www.linkedin.com/company/tekie/"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
              <a
                onClick={() => LinksClicksGA("Youtube Link")}
                className={cx("footer-socialMediaIcon", "footer-smYoutube")}
                href="https://www.youtube.com/channel/UCCr7GPlTdZRXFEfveeuKcbg"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
            </div>
          </div>
        </div>
        <div className="flex-footer end">
          <div>
            <div className={"footer-footerLinks"}>
              <Link to="/privacy" className={"footer-noneUnderline"}>
                <div
                  className={cx(
                    "footer-footerText",
                    "footer-footerLink",
                    "footer-footerLinkPadding",
                    "footer-footerRightBorder"
                  )}
                >
                  Privacy
                </div>
              </Link>
              <Link to="/terms" className={"footer-noneUnderline"}>
                <div
                  className={cx(
                    "footer-footerText",
                    "footer-footerLink",
                    "footer-footerLinkPadding",
                    "footer-footerRightBorder"
                  )}
                >
                  Terms
                </div>
              </Link>
              <Link to="/refund" className={"footer-noneUnderline"}>
                <div
                  className={cx(
                    "footer-footerText",
                    "footer-footerLink",
                    "footer-footerLinkPaddingLeft"
                  )}
                >
                  Refund
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
