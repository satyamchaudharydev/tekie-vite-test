import React, { useState } from 'react';
import "./styles.scss";
import decorator from '../../../../../src/assets/eventPage/decorator.svg'
import getPath from "../../../../utils/getPath";
import { get } from 'lodash';
import { useSwipeable } from 'react-swipeable';
import isMobile from '../../../../utils/isMobile';
import "./styles.scss"
import defaultAvatar from '../../../../assets/avatarsSVG/normalDrop.svg';

const ordinal_suffix_of = (i) => {
    var j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

const CarouselItem = ({ children, width, margin }) => {
  return (
    <div style={{ width: width, margin }} className='carousel-item_winner'>
      {children}
    </div>
  );
};

const getLiTag = (statement = '') => {
  if (statement) {
    statement = statement.split(" ")
  }
  if (statement.length === 1) {
    return statement[0]
  }
  if (statement.length > 1) {
    return statement.map(text => <li>{text}</li>)
  }
  return ''
}

const getEventName = (eventName = '') => {
  if (eventName && eventName.length > 22 && isMobile()) return `${eventName.substring(0, 22)}...`
  return eventName
}

const Carousel = ({ children, limitShow, forBanner, forWinner, minus, childNums }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeButton, setActiveButton] = useState('left')

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
      className='bannner_carousel winner-banner-carousel'
    >
      <div
        className="speaker-section-carousel"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            width: "100%",
            margin: React.Children.count(children) === 1 ? '0 auto' : ''
          });
        })}
      </div>
      <div className="indicators">
        <div className={forWinner ? "winner_carousel_navs" : forBanner ? "banner_carousel_navs" : "carousel_navs"}>
          {React.Children.map(children, (child, index) => {
            if(index < childNums){
            return (
              <button
                className={`speaker-dot-button ${index === activeIndex && "active"}`}
                onClick={() => {
                  updateIndex(index);
                }}
                style={{ display: `${React.Children.count(children) <= limitShow && 'none'}`}}
              >
              </button>
            );}
          })}
        </div>
        <div className='speaker-section-action-btns'>
            <span
            onClick={() => {
              updateIndex(activeIndex - 1);
              setActiveButton('left')
            }}
            className={`speaker-section-prev-btn ${activeButton === 'left' && 'leftActive'}`}
            style={{ display: `${React.Children.count(children) <= limitShow && 'none'}`}}
            >
            {isMobile() ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#DCDCDC"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.1165 4.22725C8.33617 4.44692 8.33617 4.80308 8.1165 5.02275L5.13925 8L8.1165 10.9773C8.33617 11.1969 8.33617 11.5531 8.1165 11.7727C7.89683 11.9924 7.54067 11.9924 7.321 11.7727L3.946 8.39775C3.72633 8.17808 3.72633 7.82192 3.946 7.60225L7.321 4.22725C7.54067 4.00758 7.89683 4.00758 8.1165 4.22725Z" fill="#403F3F"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M4.25 8C4.25 7.68934 4.50184 7.4375 4.8125 7.4375H11.6562C11.9669 7.4375 12.2188 7.68934 12.2188 8C12.2188 8.31066 11.9669 8.5625 11.6562 8.5625H4.8125C4.50184 8.5625 4.25 8.31066 4.25 8Z" fill="#403F3F"/>
                </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="16" fill="#DCDCDC"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7066 8.4545C21.146 8.89384 21.146 9.60616 20.7066 10.0455L14.7521 16L20.7066 21.9545C21.146 22.3938 21.146 23.1062 20.7066 23.5455C20.2673 23.9848 19.555 23.9848 19.1156 23.5455L12.3656 16.7955C11.9263 16.3562 11.9263 15.6438 12.3656 15.2045L19.1156 8.4545C19.555 8.01517 20.2673 8.01517 20.7066 8.4545Z" fill="white"/>
            </svg>}
            </span>
            <span
          className={`speaker-section-next-btn ${activeButton === 'right' && 'rightActive'}`}
          onClick={() => {
            updateIndex(activeIndex + 1);
            setActiveButton('right')
          }}
          style={{ display: `${React.Children.count(children) <= limitShow && 'none'}`}}
        >
           {isMobile() ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="8" fill="#00ADE6"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.8835 4.22725C8.10317 4.00758 8.45933 4.00758 8.679 4.22725L12.054 7.60225C12.2737 7.82192 12.2737 8.17808 12.054 8.39775L8.679 11.7727C8.45933 11.9924 8.10317 11.9924 7.8835 11.7727C7.66383 11.5531 7.66383 11.1969 7.8835 10.9773L10.8608 8L7.8835 5.02275C7.66383 4.80308 7.66383 4.44692 7.8835 4.22725Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.78125 8C3.78125 7.68934 4.03309 7.4375 4.34375 7.4375H11.1875C11.4982 7.4375 11.75 7.68934 11.75 8C11.75 8.31066 11.4982 8.5625 11.1875 8.5625H4.34375C4.03309 8.5625 3.78125 8.31066 3.78125 8Z" fill="white"/>
            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
            <rect x="32.3477" y="32.1719" width="32" height="32" rx="16" transform="rotate(180 32.3477 32.1719)" fill="#00ADE6"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.641 23.7174C11.2017 23.278 11.2017 22.5657 11.641 22.1264L17.5955 16.1719L11.641 10.2174C11.2017 9.77803 11.2017 9.06572 11.641 8.62638C12.0804 8.18704 12.7927 8.18704 13.232 8.62638L19.982 15.3764C20.4214 15.8157 20.4214 16.528 19.982 16.9674L13.232 23.7174C12.7927 24.1567 12.0804 24.1567 11.641 23.7174Z" fill="white"/>
          </svg>}
        </span>
        </div>
      </div>
    </div>
  );
};

export default function WinnerCarousel({ winnerData = [], eventName = '' }) {
  const secondPrizeWinner = (data) => (
    <div className="prizeHolder" style={{ visibility: data ? 'visible' : 'hidden' }}>
      <div className='secondPrize prizeCardBox' style={{
        backgroundImage: `url(${get(data, 'profilePicUrl') ? getPath(get(data, 'profilePicUrl')) : defaultAvatar})`
      }}/>
      <p className="secondHead">{ordinal_suffix_of(get(data, 'prizeCount'))} Prize</p>
      <p className="secondName p">{get(data, 'userName')}</p>
      <span className="prizeTitle">{getLiTag(get(data, 'prizeTitle'))}</span>
    </div>
  )
  const firstPrizeWinner = (data) => (
    <div className="prizeHolder firstSectionWinner" style={{ visibility: data ? 'visible' : 'hidden' }}>
      <div className='firstPrize prizeCardBox' style={{
        backgroundImage: `url(${get(data, 'profilePicUrl') ? getPath(get(data, 'profilePicUrl')) : defaultAvatar})`
      }}/>
      <p className="firstHead">{ordinal_suffix_of(get(data, 'prizeCount'))} Prize</p>
      <p className="firstName p">{get(data, 'userName')}</p>
      <span className="prizeTitle">{getLiTag(get(data, 'prizeTitle'))}</span>
    </div>
  )
  const thirdPrizeWinner = (data) => (
    <div className="prizeHolder" style={{ visibility: data ? 'visible' : 'hidden' }}>
      <div className='thirdPrize prizeCardBox' style={{
        backgroundImage: `url(${get(data, 'profilePicUrl') ? getPath(get(data, 'profilePicUrl')) : defaultAvatar})`
      }}/>
      <p className="thirdHead">{ordinal_suffix_of(get(data, 'prizeCount'))} prize</p>
      <p className="thirdName p">{get(data, 'userName')}</p>
      <span className="prizeTitle">{getLiTag(get(data, 'prizeTitle'))}</span>
    </div>
  )
  const fourthPrizeWinner = (data) => (
    <div className="prizeHolder" style={{ visibility: data ? 'visible' : 'hidden' }}>
      <div className='forthPrize prizeCardBox' style={{
        backgroundImage: `url(${get(data, 'profilePicUrl') ? getPath(get(data, 'profilePicUrl')) : defaultAvatar})`
      }}/>
      <p className="forthHead">{ordinal_suffix_of(get(data, 'prizeCount'))} prize</p>
      <p className="forthName p">{get(data, 'userName')}</p>
      <span className="prizeTitle">{getLiTag(get(data, 'prizeTitle'))}</span>
    </div>
  )
  const fifthPrizeWinner = (data) => (
    <div className="prizeHolder" style={{ visibility: data ? 'visible' : 'hidden' }}>
      <div className='fifthPrize prizeCardBox' style={{
        backgroundImage: `url(${get(data, 'profilePicUrl') ? getPath(get(data, 'profilePicUrl')) : defaultAvatar})`
      }} />
      <p className="fifthHead">{ordinal_suffix_of(get(data, 'prizeCount'))} prize</p>
      <p className="fifthName p">{get(data, 'userName')}</p>
      <span className="prizeTitle">{getLiTag(get(data, 'prizeTitle'))}</span>
    </div>
  )
  const getSplittedData = () => {
    const splittedDatas = []
    for (let i = 0; i < winnerData.length; i++) {
      const currentSplitLength = splittedDatas.length
      if (splittedDatas[currentSplitLength - 1]) {
        if (splittedDatas[currentSplitLength - 1].length < 5) {
          splittedDatas[currentSplitLength - 1].push(winnerData[i])
        } else {
          splittedDatas.push([winnerData[i]])
        }
      } else {
        splittedDatas[0] = [winnerData[i]]
      }
    }
    const finalData = []
    splittedDatas.forEach(data => {
      const firstData = data.filter((_, i) => i < 3)
      const secondData = data.filter((_, i) => i >= 3)
      finalData.push([firstData, secondData])
    })
    return finalData
  }
  return (
    <div className="Winner_App" id='winner_section_container'>
      <img src={decorator} alt='triangle'  className='decorator_2'/>
      <div className="WinnerCarousel_head"><span style={{ color: '#00ADE6' }}>Winners</span>from {getEventName(eventName)} <div className='WinnerCarousel_head_partyPoper'></div></div>
      <Carousel limitShow={1} forBanner={true} forWinner={true}>
        {getSplittedData().map((splitData) => {
          if (get(splitData, '[1][0]')) {
            return (
              <CarouselItem  forWinner={true}>
                <div className="winner_first_section">
                  {secondPrizeWinner(get(splitData, '[0][1]'))}
                  {firstPrizeWinner(get(splitData, '[0][0]'))}
                  {thirdPrizeWinner(get(splitData, '[0][2]'))}
                </div>
                <div className="winner_second_section">
                  {fourthPrizeWinner(get(splitData, '[1][0]'))}
                  {fifthPrizeWinner(get(splitData, '[1][1]'))}
                </div>
              </CarouselItem>
            )
          }
          return (
            <CarouselItem  forWinner={true}>
              <div className="winner_first_section onlyOneSection">
                {secondPrizeWinner(get(splitData, '[0][1]'))}
                {firstPrizeWinner(get(splitData, '[0][0]'))}
                {thirdPrizeWinner(get(splitData, '[0][2]'))}
              </div>
              {isMobile() && (
                <div className="winner_second_section">
                  {fourthPrizeWinner(get(splitData, '[1][0]'))}
                  {fifthPrizeWinner(get(splitData, '[1][1]'))}
                </div>
              )}
            </CarouselItem>
          )
        })}

      </Carousel>
      <img src={decorator} alt='triangle'  className='decorator_1'/>
    </div>
  );
}
