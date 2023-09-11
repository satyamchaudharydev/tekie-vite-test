import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import cuid from "cuid";
import { waitForGlobal } from '../../../utils/data-utils';
import useMeasure from '../../../hooks/userMeasure';
import getPath from '../../../utils/getFullPath';


export const ShowVideo = ({ url = "https://d1we35i345d2ic.cloudfront.net/python/topic/video_cjx2czgja00001h2xt7fjlh04_1589624123348.mp4" }, options = {
  width: 640,
  height: 360,
  aspectoRatio: '',
}) => {
  url = getPath(url)
  const [id, setId] = useState(cuid())
  const [ref, rect, measure] = useMeasure();
  const { width, height } = rect;
  const playerId = `jwPlayer-${id}`

  useEffect(() => {
    waitForGlobal('jwplayer', 200).then(() => {
      let sources = [{
        file: url,
        label: "default",

      }]
      console.log(width, height)

      window.jwplayer(playerId).setup({
        sources,
        autostart: false,
        // responsive: true,
        // width: options.width,
        // height: options.height,
        width: width,
        height: height,


      })
    })
  }, [width, height]);
  return (
    <div ref={ref} style={{
      width: '100%',
      height: '100%'
    }}>
      <Helmet>
        <script src={import.meta.env.REACT_APP_JW_PLAYER_URL}></script>
      </Helmet>
      <div id={playerId} className='video-page-mixpanel-identifier' />

    </div>
  )
}
