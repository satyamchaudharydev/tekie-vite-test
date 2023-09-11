import React, { useState } from 'react'
import './speakerSection.scss'
import { useSwipeable } from 'react-swipeable'
import getPath from "../../../../utils/getPath";
import carousel_linkedin from '../../../../../src/assets/eventPage/carousel_linkedin.svg'
import isMobile from '../../../../utils/isMobile';
import DescriptionsSkeleton from '../../pages/EventDescription/DescriptionsSkeletons';
import { withHttps } from '../../constants';
import { LinkedinIcon } from '../../../../constants/icons';

const CarouselItem = ({ children, width, margin }) => {
  return (
    <div style={{ width: width, margin }}>
      {children}
    </div>
  );
};

const Carousel = ({ children, limitShow, forBanner, forWinner, numInvisible=1, minus, childNums }) => {
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
      className='speaker-section-carousel-main'
    >
      <div
        className="speaker-section-carousel"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            width: (isMobile() ? "100%" : "50%"),
            // margin: React.Children.count(children) === 1 ? '0 auto' : ''
          });
        })}
      </div>
      <div className="speaker-section-indicator" style={{ display: React.Children.count(children) > 1 ? 'flex' : 'none' }}>
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

const SpeakerSection = ({ speakerData = [], isEventSpeakerFetching = false }) => {
    const limitShow = isMobile() ? 1 : 2
    const childNums = speakerData.length / limitShow
    if (!isEventSpeakerFetching && !speakerData.length) return null
    return (
      <div className='speaker-carousel-container'>
        {isEventSpeakerFetching ? <p className="Carousel_head"><DescriptionsSkeleton forSection='eventDetails-text' /></p> : <p className="Carousel_head">{isMobile() ? "About Speaker" : "About Speakers"}</p>}
        {isEventSpeakerFetching && (
          <div className='speaker-main-profile-container'>
            <DescriptionsSkeleton forSection='speakerSection' />
          </div>
        )}
        {!isEventSpeakerFetching && (
          <Carousel limitShow={limitShow} forBanner={false} childNums={childNums}>
              {speakerData.map(({ about, linkedInLink, organization, roleAtOrganization, name, profilePic = '' }) =>(
                  <CarouselItem>
                  <div className='speaker-main-profile-container'>
                      <img src={getPath(profilePic)} alt='MainCarousel_ui' className="speaker-main-image" />
                      <div className="speaker-main-profile-details">
                          <p className='speaker-main-profile'>{roleAtOrganization} @ {organization}</p>
                          <p className='speaker-profile-name'>{name}</p>
                          <p className='speaker-profile-about'>{about || ''}</p>
                          <a style={{ width: 'fit-content' }} href={withHttps(linkedInLink)} target='_blank' rel="noopener noreferrer" >
                              {/* <img src={LinkedinIcon} alt='MainCarousel_linkedin' className='speaker-profile-linkedIn-link' /> */}
                              <LinkedinIcon />
                          </a>
                      </div>
                  </div>
                  </CarouselItem>
              ))}
          </Carousel>
        )}
        </div>
    )
}

export default SpeakerSection;