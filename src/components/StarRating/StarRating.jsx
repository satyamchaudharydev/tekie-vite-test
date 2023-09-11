import React, { useState,useEffect } from "react";
import { Star } from "../../constants/icons";
import styles from './StarRating.module.scss'

const StarRating = ({rating,setRating}) => {
    const [hover, setHover] = useState(0);

    useEffect(()=>{
        setHover(rating)
    },[rating])
    return (
        <div className={styles.starRating}>
            {[...Array(5)].map((star, index) => {
                index += 1;
                return (<>
                    <button
                        key={index}
                        className={(index<=rating ||index<=hover) ? `${styles.on} ${styles.starBtn}` : `${styles.off} ${styles.starBtn}`}
                        onClick={() => {
                            if (rating === 1 && index ===1) {
                                setRating(0)
                            } else {
                                setRating(index)
                            }
                        }}
                        onMouseEnter={() => setHover(index)}
                        onMouseLeave={() => setHover(rating)}
                    >
                        <Star />
                    {index === 1 && <span className={styles.ratingLabel}>Poor</span>}
                    {index === 5 && <span className={styles.ratingLabel}>Perfect</span>}
                    </button>
                </>

                );
            })}
        </div>
    );
};

export default StarRating