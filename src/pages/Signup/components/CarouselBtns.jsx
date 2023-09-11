import React from 'react'
import '../SignupLogin.scss'

const CarouselBtns = ({ setCount, count, nestedListLength }) => {
    function moveCarousel(direction) {
        if (direction === "right") {
            if (count < nestedListLength - 1) {
                setCount(count + 1);
            }
        }
        if (direction === "left") {
            if (count > 0) {
                setCount(count - 1);
            }
        }
    }
    return <>
        <div className='carousel-btns-wrapper'>
            <button
                disabled={count === 0}
                className={count === 0 ? 'carousel-btn isDisabled' : 'carousel-btn'}
                onClick={() => moveCarousel("left")}
                style={{ marginRight: "1rem" }}
            >
                L
            </button>
            <button
                disabled={count === nestedListLength - 1}
                className={count === nestedListLength - 1 ? 'carousel-btn isDisabled' : 'carousel-btn'}
                onClick={() => moveCarousel("right")}>
                R </button>
        </div>
    </>
}

export default CarouselBtns