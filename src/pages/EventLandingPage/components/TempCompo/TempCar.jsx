import React, { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import caro_next from '../../../../../src/assets/eventPage/caro_next.svg'
import mobile_back_button from '../../../../../src/assets/eventPage/mobile_back_button.svg'
import mobile_next_button from '../../../../../src/assets/eventPage/mobile_next_button.svg'


import "./styles.scss";

export const CarouselItem = ({ children, width, forWinner, invisible }) => {
  return (
    <div className={invisible ? "carousel_invisible" : forWinner ? "carousel-item_winner" : "carousel-item"} style={{ width: width }}>
      {children}
    </div>
  );
};

const Carousel = ({ children, limitShow, forBanner, forWinner, numInvisible=1, minus }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const updateIndex = (newIndex) => {
    let varIndex = React.Children.count(children)/2;
    if(forBanner){
      varIndex = React.Children.count(children)-numInvisible;
      if(minus){
        varIndex = varIndex+1
      }
    }
    if (newIndex < 0) {
      newIndex = varIndex - 1;
    } else if (newIndex >= varIndex) {
      newIndex = 0;
    }
    setActiveIndex(newIndex);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => updateIndex(activeIndex + 1),
    onSwipedRight: () => updateIndex(activeIndex - 1)
  });

  return (
    <div
      {...handlers}
      className={forWinner ? "winner_c_carousel" : forBanner ? "bannner_carousel" : (React.Children.count(children) == 1 ? "carousel carousel_single_item" : "carousel")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="inner"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, { width: forBanner ? "100%" : (window.innerWidth < 450 ? "100%" : "50%") });
        })}
      </div>
      <div className="indicators">
        <button
          onClick={() => {
            updateIndex(activeIndex - 1);
          }}
          className={forWinner ? "winner_carousel_prev_btn" : forBanner ? "banner_carousel_prev_btn" : "carousel_prev_btn"}
          style={{ display: `${React.Children.count(children)-numInvisible+1 <= limitShow && 'none'}`}}
        >
          <img src={caro_next} className={forBanner ? "banner_carousel_prev_text" : "carousel_prev_text"} alt="Next" />
          <img src={mobile_back_button} className={forBanner ? "banner_mobile_back_button" : "mobile_back_button"} alt="Next" />
        </button>
        <div className={forWinner ? "winner_carousel_navs" : forBanner ? "banner_carousel_navs" : "carousel_navs"}>
          {React.Children.map(children, (child, index) => {
            if(index+numInvisible-1 < 4){
            return (
              <button
                className={`${index === activeIndex ? "active" : "caro_active_btn"}`}
                onClick={() => {
                  updateIndex(index);
                }}
                style={{ display: `${React.Children.count(children)-numInvisible+1 <= limitShow && 'none'}`}}
              >
              </button>
            );}
          })}
        </div>
        <button
          onClick={() => {
            updateIndex(activeIndex + 1);
          }}
          className={forWinner ? "winner_carousel_next_btn" : forBanner ? "banner_carousel_next_btn" : "carousel_next_btn"}
          style={{ display: `${React.Children.count(children)-numInvisible+1 <= limitShow && 'none'}`}}
        >
          <img className={forBanner ? "banner_carousel_next_text" : "carousel_next_text"} src={caro_next} alt="Next" />
          <img src={mobile_next_button} className={forBanner ? "banner_mobile_next_button" : "mobile_next_button"} alt="Next" />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
