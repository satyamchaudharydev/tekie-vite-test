import React from "react";
import "./Banner.styles.scss";
import CustomButton from "../CustomButton/CustomButton";

const Banner = () => {
  const scrollToEventLibrary = () => {
    var elmnt = document.getElementById("event-library");
    elmnt.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <div className="banner">
        <div className="heading">
          <p className="bannerHead">Community Events</p>
          <p className="bannerHead-2">for future skills</p>
          <p className="desc">Upskill your kid and win prizes every weekend!</p>
          <CustomButton
            type="banner"
            clickEvent={() => scrollToEventLibrary()}
            content="Explore All Events"
          />
        </div>

        <div className="banner-overlay">
          
        </div>
        <div className="banner-bg-lower-image-icons">
          <div className="spy-squad"></div>
          <div className="story-spree"></div>
          <div className="boy-image"></div>
          <div className="anybody-can-design"></div>
          <div className="genz-for-env"></div>
        </div>
      </div>
      <div className="mobile_banner">
        <div className="banner-overlay">
        </div>
        <div className="banner-bg-lower-image-icons">
          <div className="boy-image"></div>
        </div>
        <div className="heading">
          <p className="bannerHead">Join Community Events</p>
          <p className="bannerHead-2">for future skills</p>
          <p className="desc">and win prizes every weekend!</p>
          <CustomButton
            type="banner"
            clickEvent={() => scrollToEventLibrary()}
            content="Explore All Events"
          />
        </div>
      </div>
    </>
  );
};

export default Banner;
