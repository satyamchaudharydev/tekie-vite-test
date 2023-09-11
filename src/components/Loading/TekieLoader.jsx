import React, { useEffect, useState } from 'react'
import tekieLoader from '../../assets/tekieLoader.gif'

const textList = ['Cleaning up Conji’s mess...', 'Collecting 1s and 0s...', 'Brewing your knowledge potion...', 'Re-arranging pixels...', 'Deleting the extra 1s and 0s...']


const TekieLoader = () => {
  const [loaderTextNumber, setLoaderTextNumber] = useState(0)

  useEffect(() => {
    let timer = setInterval(() => {
      setLoaderTextNumber(prev => prev + 1 === textList.length ? 0 : prev + 1)
    }, 1200);
    return () => clearTimeout(timer)
  }, [])


  return (
    <div className='loaderContainer' style={{ background: 'white', }}>
      <div className='loaderContentContainer'>
        <div className='loaderGifContainer'>
          <img src={tekieLoader} alt="loading" height='100%' width='100%' />
        </div>
        <p className='loadingText'>LOADING...</p>
        <p className='animatedLoadingTextContainer'>
          {
            textList.map((text, idx) => <span style={{ opacity: idx === loaderTextNumber ? 1 : 0 }} className='animatedLoadingText'>{text}</span>)
          }
        </p>
      </div>
    </div>
  )
}

export default TekieLoader