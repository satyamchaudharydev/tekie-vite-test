import React from "react";
import Carousel, { CarouselItem } from "./Carousel";
import Frame from "../../../../../src/assets/eventPage/FrameWithLogo.svg";

import EventLogo from "../../../../../src/assets/eventPage/EventLogo.svg";
import Calender from "../../../../../src/assets/eventPage/Calender.svg";
import time from "../../../../../src/assets/eventPage/time.svg";
import timer from "../../../../../src/assets/eventPage/timer.svg";
import Spon_Logo from "../../../../../src/assets/eventPage/Spon_Logo.svg";
import mobile_trans from "../../../../../src/assets/eventPage/mobile_trans.svg";
import BannerCarousel_black_block from "../../../../../src/assets/eventPage/black_block.svg";
import mobile_caro_banner from "../../../../../src/assets/eventPage/mobile_banner.svg";
import caro_next from "../../../../../src/assets/eventPage/caro_next.svg";
import mobile_back_button from "../../../../../src/assets/eventPage/mobile_back_button.svg";
import mobile_next_button from "../../../../../src/assets/eventPage/mobile_next_button.svg";
import "./styles.scss";

export default function BannerCarousel() {
  return (
    <div className="BannerCarousel_App">
      <Carousel limitShow={1} forBanner={true} minus={true}>
        <CarouselItem>
          <div className="single_item_caraousel"></div>
          {/* <img src={Frame} alt='BannerCarousel_ui' className="BannerCarousel_ui" /> */}
          {/* <p className="BannerCarousel_info"><img src={Calender} alt='Calender' /><span>10th October 2021</span></p>
            <p className="BannerCarousel_info_2"><img src={time} alt='time' /><span>11:00 AM Onwards</span></p>
            <p className="BannerCarousel_info_3"><img src={timer} alt='timer' /><span>60-75 Minutes</span></p>
            <button className="BannerCarousel_btn">Register Now &#8594;</button>

            <div className="EventDesc_base EventDesc_base_caro" style={{ height: '450px' }}>
                <div className="EventDesc_blackStrip"></div>
                <img alt="EventLogo" className="EventDesc_EventLogo" src={EventLogo} />
                <img alt='Spon' className="EventDesc_Spon" src={Spon_Logo} />
                <img alt='mobile_trans' className="BannerCarousel_mobile_trans" src={mobile_trans} />
                <img alt='BannerCarousel_black_block' className="BannerCarousel_black_block" src={BannerCarousel_black_block} />
                <p className="EventDesc_p BannerCarousel_mob_para">Participate and stand a chance to win</p>
                <p className="EventDesc_p BannerCarousel_mob_para">exciting prizes!</p>
                <p className="EventDesc_info"><img src={Calender} alt='Calender' /><span>10th October 2021</span></p>
                <p className="EventDesc_info"><img src={time} alt='time' /><span>11:00 AM Onwards</span></p>
                <p className="EventDesc_info"><img src={timer} alt='timer' /><span>60-75 Minutes</span></p>
                <button className="EventDesc_btn">Register Now &#8594;</button>
            </div> */}
        </CarouselItem>

        <CarouselItem>
          <img
            src={Frame}
            alt="BannerCarousel_ui"
            className="BannerCarousel_ui"
          />
          <p className="BannerCarousel_p">
            Participate and stand a chance to win exciting prizes!
          </p>
          <p className="BannerCarousel_info">
            <img src={Calender} alt="Calender" />
            <span>10th October 2021</span>
          </p>
          <p className="BannerCarousel_info_2">
            <img src={time} alt="time" />
            <span>11:00 AM Onwards</span>
          </p>
          <p className="BannerCarousel_info_3">
            <img src={timer} alt="timer" />
            <span>60-75 Minutes</span>
          </p>
          <button className="BannerCarousel_btn">Register Now &#8594;</button>

          <div
            className="EventDesc_base EventDesc_base_caro"
            style={{ height: "450px" }}
          >
            <div className="EventDesc_blackStrip"></div>
            <img
              alt="EventLogo"
              className="EventDesc_EventLogo"
              src={EventLogo}
            />
            <img alt="Spon" className="EventDesc_Spon" src={Spon_Logo} />
            <img
              alt="mobile_trans"
              className="BannerCarousel_mobile_trans"
              src={mobile_trans}
            />
            <img
              alt="BannerCarousel_black_block"
              className="BannerCarousel_black_block"
              src={BannerCarousel_black_block}
            />
            <p className="EventDesc_p BannerCarousel_mob_para">
              Participate and stand a chance to win
            </p>
            <p className="EventDesc_p BannerCarousel_mob_para">
              exciting prizes!
            </p>
            <p className="EventDesc_info">
              <img src={Calender} alt="Calender" />
              <span>10th October 2021</span>
            </p>
            <p className="EventDesc_info">
              <img src={time} alt="time" />
              <span>11:00 AM Onwards</span>
            </p>
            <p className="EventDesc_info">
              <img src={timer} alt="timer" />
              <span>60-75 Minutes</span>
            </p>
            <button className="EventDesc_btn">Register Now &#8594;</button>
          </div>
        </CarouselItem>

        <CarouselItem>
          <img
            src={Frame}
            alt="BannerCarousel_ui"
            className="BannerCarousel_ui"
          />
          <p className="BannerCarousel_p">
            Participate and stand a chance to win exciting prizes!
          </p>
          <p className="BannerCarousel_info">
            <img src={Calender} alt="Calender" />
            <span>10th October 2021</span>
          </p>
          <p className="BannerCarousel_info_2">
            <img src={time} alt="time" />
            <span>11:00 AM Onwards</span>
          </p>
          <p className="BannerCarousel_info_3">
            <img src={timer} alt="timer" />
            <span>60-75 Minutes</span>
          </p>
          <button className="BannerCarousel_btn">Register Now &#8594;</button>

          <div
            className="EventDesc_base EventDesc_base_caro"
            style={{ height: "450px" }}
          >
            <div className="EventDesc_blackStrip"></div>
            <img
              alt="EventLogo"
              className="EventDesc_EventLogo"
              src={EventLogo}
            />
            <img alt="Spon" className="EventDesc_Spon" src={Spon_Logo} />
            <img
              alt="mobile_trans"
              className="BannerCarousel_mobile_trans"
              src={mobile_trans}
            />
            <img
              alt="BannerCarousel_black_block"
              className="BannerCarousel_black_block"
              src={BannerCarousel_black_block}
            />
            <p className="EventDesc_p BannerCarousel_mob_para">
              Participate and stand a chance to win
            </p>
            <p className="EventDesc_p BannerCarousel_mob_para">
              exciting prizes!
            </p>
            <p className="EventDesc_info">
              <img src={Calender} alt="Calender" />
              <span>10th October 2021</span>
            </p>
            <p className="EventDesc_info">
              <img src={time} alt="time" />
              <span>11:00 AM Onwards</span>
            </p>
            <p className="EventDesc_info">
              <img src={timer} alt="timer" />
              <span>60-75 Minutes</span>
            </p>
            <button className="EventDesc_btn">Register Now &#8594;</button>
          </div>
        </CarouselItem>

        <CarouselItem>
          <img
            src={Frame}
            alt="BannerCarousel_ui"
            className="BannerCarousel_ui"
          />
          <p className="BannerCarousel_p">
            Participate and stand a chance to win exciting prizes!
          </p>
          <p className="BannerCarousel_info">
            <img src={Calender} alt="Calender" />
            <span>10th October 2021</span>
          </p>
          <p className="BannerCarousel_info_2">
            <img src={time} alt="time" />
            <span>11:00 AM Onwards</span>
          </p>
          <p className="BannerCarousel_info_3">
            <img src={timer} alt="timer" />
            <span>60-75 Minutes</span>
          </p>
          <button className="BannerCarousel_btn">Register Now &#8594;</button>

          <div
            className="EventDesc_base EventDesc_base_caro"
            style={{ height: "450px" }}
          >
            <div className="EventDesc_blackStrip"></div>
            <img
              alt="EventLogo"
              className="EventDesc_EventLogo"
              src={EventLogo}
            />
            <img alt="Spon" className="EventDesc_Spon" src={Spon_Logo} />
            <img
              alt="mobile_trans"
              className="BannerCarousel_mobile_trans"
              src={mobile_trans}
            />
            <img
              alt="BannerCarousel_black_block"
              className="BannerCarousel_black_block"
              src={BannerCarousel_black_block}
            />
            <p className="EventDesc_p BannerCarousel_mob_para">
              Participate and stand a chance to win
            </p>
            <p className="EventDesc_p BannerCarousel_mob_para">
              exciting prizes!
            </p>
            <p className="EventDesc_info">
              <img src={Calender} alt="Calender" />
              <span>10th October 2021</span>
            </p>
            <p className="EventDesc_info">
              <img src={time} alt="time" />
              <span>11:00 AM Onwards</span>
            </p>
            <p className="EventDesc_info">
              <img src={timer} alt="timer" />
              <span>60-75 Minutes</span>
            </p>
            <button className="EventDesc_btn">Register Now &#8594;</button>
          </div>
        </CarouselItem>
      </Carousel>
    </div>
  );
}
