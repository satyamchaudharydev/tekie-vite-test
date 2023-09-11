import React, { useEffect, useState } from "react"
import BannerCarousel from "../Carousel/BannerCarousel"
import "./BannerCaraousel.scss"
import Carousel, { CarouselItem } from "../Carousel/Carousel";
import Frame from "../../../../../src/assets/eventPage/FrameWithLogo.svg"

import EventLogo from '../../../../../src/assets/eventPage/EventLogo.svg';
import Calender from '../../../../../src/assets/eventPage/Calender.svg';
import time from '../../../../../src/assets/eventPage/time.svg';
import timer from '../../../../../src/assets/eventPage/timer.svg';
import Spon_Logo from '../../../../../src/assets/eventPage/Spon_Logo.svg';
import mobile_trans from '../../../../../src/assets/eventPage/mobile_trans.svg';
import BannerCarousel_black_block from '../../../../../src/assets/eventPage/black_block.svg';
import mobile_caro_banner from '../../../../../src/assets/eventPage/mobile_banner.svg';
import caro_next from '../../../../../src/assets/eventPage/caro_next.svg'
import mobile_back_button from '../../../../../src/assets/eventPage/mobile_back_button.svg'
import mobile_next_button from '../../../../../src/assets/eventPage/mobile_next_button.svg'
import "../Carousel/styles.scss";



function BannerLoggedIn({ value }) {

    const [topUpcomingData, setTopUpcomingData] = useState([]);
    const { upcomingEvents } = value
    const arrayofUpcomingEvents = upcomingEvents.toJS()
    useEffect(() => {
        function bannerData() {
            const array = []
            for (let i = 0; i < 4; i++) {
                const element = arrayofUpcomingEvents[i]
                array.push(element)
            }
            setTopUpcomingData(array)
        }
        bannerData()
    }, [upcomingEvents])


    return <>
    <div className="desktop_banner">
        <Carousel limitShow={1} forBanner={true} minus={true}>
            {topUpcomingData.map(events => (
                <CarouselItem>
                    <div className="single_item_caraousel">
                        <div className="text_section">
                            <p className="BannerCarousel_p">Participate and stand a chance to win exciting prizes!</p>
                            <span className="BannerCarousel_info"><img src={Calender} alt='Calender' /><span>{events !== undefined && events.name}</span></span>
                            <span className="BannerCarousel_info_2"><img src={time} alt='time' /><span>11:00 AM Onwards</span></span>
                            <span className="BannerCarousel_info_3"><img src={timer} alt='timer' /><span>60-75 Minutes</span></span>
                            <button className="BannerCarousel_btn">Register Now &#8594;</button>
                        </div>
                        <div className="image_section"></div>
                    </div>
                </CarouselItem>
            ))}
        </Carousel>
        </div>
    </>
}


export default BannerLoggedIn