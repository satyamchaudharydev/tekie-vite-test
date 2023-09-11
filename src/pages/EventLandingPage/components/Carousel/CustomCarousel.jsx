import React from 'react';
import { useSwipeable } from 'react-swipeable';
import './customCarousel.scss'
import './styles.scss'
import mobile_back_button from '../../../../../src/assets/eventPage/mobile_back_button.svg'
import mobile_next_button from '../../../../../src/assets/eventPage/mobile_next_button.svg'
import caro_next from '../../../../../src/assets/eventPage/caro_next.svg'

const CustomCarousel = ({ contents = [], forBanner }) => {
  let desktopExtraImages = []
  let mobileExtraImages = []
  let currElement;
  let start;
  let change;
  function slideFunction (){
    if (change > 0) {
      if (currElement <= 3) currElement += 1
    } else {
      if (currElement > 0) currElement -= 1
    }
    if (currElement >= 0 && currElement < 4) {
    //   const allActionPictures = document.querySelectorAll('.lp-courses-section-carousel-action-pictures .lp-courses-section-carousel-action-picture')
    //   allActionPictures.forEach((picture) => {
    //       picture.classList.remove("active");
    //   });
    //   allActionPictures[currElement].classList.add('active');
    //   const newIndex = currElement === 0 ? -1 : currElement
    //   navButton(null, newIndex * allActionPictures[currElement].offsetWidth)
    }
  }
    const slides = Array.from(document.querySelectorAll(".lp-courses-section-carousel-slide"));
    const slider = document.querySelector(".lp-courses-section-carousel-slider");
    const dotEl = document.querySelector(".lp-courses-section-carousel-dots");

    function getNextPrev() {
    // select the active slide
    const activeSlide = document.querySelector(".lp-courses-section-carousel-slide.active");
    // get the current number of the active slide
    const activeIndex = slides.indexOf(activeSlide);

    let next, prev;

    if (activeIndex === slides.length - 1) {
        // return the first slide
        next = slides[0];
    } else {
        // return the next slide by +1
        next = slides[activeIndex + 1];
    }
    if (activeIndex === 0) {
        // return the last slide
        prev = slides[slides.length - 1];
    } else {
        prev = slides[activeIndex - 1];
    }

    return [next, prev];
    }

    function getPosition() {
    // select the active slide
    const activeSlide = document.querySelector(".lp-courses-section-carousel-slide.active");
    // get the current number of the active slide
    const activeIndex = slides.indexOf(activeSlide);
    const [next, prev] = getNextPrev();
    slides.forEach((slide, index) => {
        if (index === activeIndex) {
        // if it is current slides show it with translateX(0)
        slide.style.transform = "translateX(0)";
        } else if (slide === prev) {
        // if it is prev slides change style translate
        slide.style.transform = "translateX(-100%)";
        } else if (slide === next) {
        // if it is next slides change style translate
        slide.style.transform = "translateX(100%)";
        } else {
        // if we have any other slides
        slide.style.transform = "translate(100%)";
        }

        // just for the transition then the class top will be removed
        slide.addEventListener("transitionend", () => {
        slide.classList.remove("top");
        });
    });
    }
    getPosition();

    function getNextSlide() {
    //prevent the timeout if user clicks on arrow btn
    const currentSlide = document.querySelector(".lp-courses-section-carousel-slide.active");
    const [next, prev] = getNextPrev();

    if (currentSlide.classList.contains("top")) {
        // if you click fast on next button it does look strange - so return if class "top" contains
        return;
    }

    currentSlide.classList.add("top");
    currentSlide.classList.remove("active");
    currentSlide.style.transform = "translate(-100%)";

    next.classList.add("top");
    next.classList.add("active");
    next.style.transform = "translate(0)";
    getPosition();
    getActiveDot();
    }

    function getPrevSlide() {
    const currentSlide = document.querySelector(".lp-courses-section-carousel-slide.active");
    const [next, prev] = getNextPrev();

    if (currentSlide.classList.contains("top")) {
        // if you click fast on next button it does look strange - so return if class "top" contains
        return;
    }

    currentSlide.classList.add("top");
    currentSlide.classList.remove("active");
    currentSlide.style.transform = "translateX(100%)";

    prev.classList.add("top");
    prev.classList.add("active");
    prev.style.transform = "translateX(0)";
    getPosition();
    getActiveDot();
    }

    // create dots functionality

    slides.forEach((slide) => {
    // for each slide create a div element and add the class dot - this will be append to the dots div
    const dot = document.createElement("div");
    dot.classList.add("lp-courses-section-carousel-dots-dot");
    dotEl.appendChild(dot);
    });


    function getActiveDot() {
    // select all Dots with querySelectorAll
    const allDots = document.querySelectorAll(".lp-courses-section-carousel-dots .lp-courses-section-carousel-dots-dot");
    const activeSlide = document.querySelector(".lp-courses-section-carousel-slide.active");
    const activeIndex = slides.indexOf(activeSlide);
    if (allDots.length) {
        allDots.forEach((dot) => {
        dot.classList.remove("active");
        });
        allDots[activeIndex].classList.add("active");
    }
    }

    function functionalDots() {
    const allDots = document.querySelectorAll(".lp-courses-section-carousel-dots .lp-courses-section-carousel-dots-dot");
    allDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
        getDotSlide(index);
        });
    });
    }

    function getDotSlide(index) {
    slides.forEach((slide) => {
        slide.classList.remove("active");
    });
    slides[index].classList.add("active");
    desktopExtraImages.push(...slides[index].getAttribute('data-source').split(','))

    getPosition();
    getActiveImage()
    getActiveDot();
    }

    const navButton = (direction, position) => {
    const sliderHolder = document.querySelector('.lp-courses-section-carousel-action-container')
    if (position) {
      sliderHolder.scrollTo({ left: position, behavior: 'smooth' })
    } else {
      let far = sliderHolder.clientWidth / 2*direction;
      let pos = sliderHolder.scrollLeft + far;
      sliderHolder.scrollTo({ left: pos, behavior: 'smooth' })
    }
  }
    const getActiveImage = () =>{
      const activeSlide = document.querySelector('.lp-courses-section-mobile-carousel-box.active')
    }
    getActiveImage()
    functionalDots();
    getActiveDot();
    function shiftLeft(){
      getPrevSlide()
    }
    function shiftRight(){
      getNextSlide()
    }
    const handlers = useSwipeable({
    onSwipedLeft: () => getPrevSlide(),
    onSwipedRight: () => getNextSlide()
  });
    return (
        <section class="lp-courses-section-carousel">
        <button
            className='lp-mobile-left-arrow'
            onClick={() => shiftLeft()}
            // style={{ display: `${React.Children.count(children)-numInvisible+1 <= limitShow && 'none'}`}}
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="#504F4F"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.9508 19.4242C39.6831 20.1564 39.6831 21.3436 38.9508 22.0758L29.0267 32L38.9508 41.9242C39.6831 42.6564 39.6831 43.8436 38.9508 44.5758C38.2186 45.3081 37.0314 45.3081 36.2992 44.5758L25.0492 33.3258C24.3169 32.5936 24.3169 31.4064 25.0492 30.6742L36.2992 19.4242C37.0314 18.6919 38.2186 18.6919 38.9508 19.4242Z" fill="white"/>
            </svg>
            {/* <img src={mobile_back_button} className={forBanner ? "banner_mobile_back_button" : "mobile_back_button"} alt="Next" /> */}
            </button>
        <div class="lp-courses-section-carousel-slider" {...handlers}>
        {contents.map((content, index) => (
            <div className={`lp-courses-section-carousel-slide lp-courses-section-carousel-slide-${index} ${index === 0 ? 'active' : ''}`}>
                {content}
            </div>
        ))}
        </div>
        <button
        className='lp-mobile-right-arrow'
        onClick={() => shiftRight()}
        // style={{ display: `${React.Children.count(children)-numInvisible+1 <= limitShow && 'none'}`}}
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle r="32" transform="matrix(-1 0 0 1 32 32)" fill="#504F4F"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M25.0492 19.4242C24.3169 20.1564 24.3169 21.3436 25.0492 22.0758L34.9733 32L25.0492 41.9242C24.3169 42.6564 24.3169 43.8436 25.0492 44.5758C25.7814 45.3081 26.9686 45.3081 27.7008 44.5758L38.9508 33.3258C39.6831 32.5936 39.6831 31.4064 38.9508 30.6742L27.7008 19.4242C26.9686 18.6919 25.7814 18.6919 25.0492 19.4242Z" fill="white"/>
        </svg>
        {/* <img src={mobile_back_button} className={forBanner ? "banner_mobile_back_button" : "mobile_back_button"} alt="Next" /> */}
        </button>
        <div class="lp-courses-section-carousel-dots">
            {contents.map(c => <div className='lp-courses-section-carousel-dots-dot'></div>)}
        </div>
        <div class="lp-mobile-arrow-container">
        </div>
  </section>
    );
};

export default CustomCarousel;
