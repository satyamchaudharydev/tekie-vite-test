import React, { useState } from 'react'
import { useSwipeable } from 'react-swipeable';
import './signupCarouselStyles.scss'

const SignupCarouselItem = ({ children, width, margin }) => {
  return (
    <div style={{ width: width, margin }}>
      {children}
    </div>
  );
};

const SignupCarousel = ({ children, limitShow, forBanner, forWinner, numInvisible=1, minus, childNums }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeButton, setActiveButton] = useState('right')

  const updateIndex = (newIndex) => {
    let varIndex = React.Children.count(children)/limitShow;
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
      className='signup-carousel-section-carousel-main'
    >
      <div
        className="signup-carousel-section-carousel"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            width: '100%',
            margin: React.Children.count(children) === 1 ? '0 auto' : ''
          });
        })}
      </div>
      <div className="signup-carousel-section-indicator">
        <div className={forWinner ? "winner_carousel_navs" : forBanner ? "banner_carousel_navs" : "carousel_navs"}>
          {React.Children.map(children, (child, index) => {
            if(index < childNums){
            return (
              <button
                className={`signup-carousel-dot-button ${index === activeIndex && "active"}`}
                onClick={() => {
                  updateIndex(index);
                }}
                style={{ display: `${React.Children.count(children) <= limitShow && 'none'}`}}
              >
              </button>
            );}
          })}
        </div>
        <div className='signup-carousel-section-action-btns'>
            <span
            onClick={() => {
              updateIndex(activeIndex - 1);
              setActiveButton('left')
            }}
            className={`signup-carousel-section-prev-btn ${activeButton === 'left' && 'leftActive'} `}
            style={{ display: `${React.Children.count(children) <= limitShow && 'none'}`}}
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="16" fill="#DCDCDC"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7066 8.4545C21.146 8.89384 21.146 9.60616 20.7066 10.0455L14.7521 16L20.7066 21.9545C21.146 22.3938 21.146 23.1062 20.7066 23.5455C20.2673 23.9848 19.555 23.9848 19.1156 23.5455L12.3656 16.7955C11.9263 16.3562 11.9263 15.6438 12.3656 15.2045L19.1156 8.4545C19.555 8.01517 20.2673 8.01517 20.7066 8.4545Z" fill="white"/>
            </svg>
            </span>
            <span
          className={`signup-carousel-section-next-btn ${activeButton === 'right' && 'rightActive'} `}
          onClick={() => {
            updateIndex(activeIndex + 1);
            setActiveButton('right')
          }}
          style={{ display: `${React.Children.count(children) <= limitShow && 'none'}`}}
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
            <rect x="32.3477" y="32.1719" width="32" height="32" rx="16" transform="rotate(180 32.3477 32.1719)" fill="#00ADE6"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.641 23.7174C11.2017 23.278 11.2017 22.5657 11.641 22.1264L17.5955 16.1719L11.641 10.2174C11.2017 9.77803 11.2017 9.06572 11.641 8.62638C12.0804 8.18704 12.7927 8.18704 13.232 8.62638L19.982 15.3764C20.4214 15.8157 20.4214 16.528 19.982 16.9674L13.232 23.7174C12.7927 24.1567 12.0804 24.1567 11.641 23.7174Z" fill="white"/>
          </svg>
        </span>
        </div>
      </div>
    </div>
  );
};

export { SignupCarousel, SignupCarouselItem }