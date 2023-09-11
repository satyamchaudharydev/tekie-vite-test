import { get } from 'lodash'
import React, { useEffect, useState } from 'react'
import { waitForGlobal } from '../../../../../utils/data-utils'
import getPath from '../../../../../utils/getPath'
import './gridStyles.scss'

const GridVideo = ({ videoId, contents, height }) => {
  const [videos, setVideos] = useState('')
  const [videoDuration, setVideoDuration] = useState(0)
  const [currentTime, setVideoCurrTime] = useState(0)
  const setVideoCurrentTime = time => {
        setVideoCurrTime(time)
        if (currentTime * 1000 > videoDuration) {
            window.jwplayer(videoId).seek(videoDuration / 1000)
            window.jwplayer(videoId).pause()
        }
        if (currentTime * 1000 < 0) {
            window.jwplayer(videoId).seek(0 / 1000)
            window.jwplayer(videoId).pause()
        }
    }
  const initiatePlayerCallbacks = () => {
        // player load callback
        window.jwplayer(videoId).on('load', e => {
            setTimeout(() => {
              if (window.jwplayer(videoId) && window.jwplayer(videoId).getDuration) {
                  setVideoDuration(window.jwplayer(videoId).getDuration())
                }
            }, 400)
        });

        // player callback when playing
        window.jwplayer(videoId).on('time', e => {
            setVideoCurrentTime(e && e.currentTime)
          if (!videoDuration && e) {
              setVideoDuration(e.duration)
            }
        });
  }
     const onReady = (event) => {
        //write code here
        waitForGlobal('jwplayer', 2000)
          .then(() => {
                if (window.jwplayer(videoId) && window.jwplayer(videoId).setup && videos) {
                    window.jwplayer(videoId).setup({
                        sources: [{
                            file: videos,
                            label: '480'
                        }],
                        autostart: false,
                    })
                  window.jwplayer(videoId).on('ready', e => {
                        // show control bar at start
                        const controlBar = window.jwplayer(videoId).getContainer() &&
                            window.jwplayer(videoId).getContainer().querySelector('.jw-controlbar');
                        controlBar.style.display = 'flex';
                        initiatePlayerCallbacks()
                    });
                    window.jwplayer(videoId).on('error', e => {
                        const htmlVideoPlayer = document.createElement('div')
                        htmlVideoPlayer.classList.add('grid-video-container')
                        htmlVideoPlayer.innerHTML = `
                            <video id="video" class="video-js vjs-default-skin" controls data-setup='{}'>
                                <source src = "${videos}" type = "video/mp4" label="480P" res='480'>
                                Your browser doesn't support html5 video tag.
                            </video>
                        `
                        const player = document.getElementById(videoId)
                        player.parentNode.replaceChild(htmlVideoPlayer, player)
                    });
                }
                window.jwplayer(videoId) && window.jwplayer(videoId).on('setupError', e => {
                const htmlVideoPlayer = document.createElement('div')
                htmlVideoPlayer.classList.add('grid-video-container')
                htmlVideoPlayer.innerHTML = `
                    <video id="video" class="video-js vjs-default-skin" controls data-setup='{}'>
                        <source src = "${videos}" type = "video/mp4" label="480P" res='480'>
                        Your browser doesn't support html5 video tag.
                    </video>
                `
                const player = document.getElementById(videoId)
                player.parentNode.replaceChild(htmlVideoPlayer, player)
            });
            }
        )
    }
  useEffect(() =>{
    if (get(contents, 'media.uri')) {
      setVideos(getPath(get(contents, 'media.uri')))
    }
  }, [videoId])
    useEffect(() => {
      if (videos) {
        onReady()
      }
  }, [videos])
  return (
    <div style={{  height: height || 'auto' }}>
        <div style={{ height: '100%' }} id={videoId}></div>
    </div>
  )
}

export default GridVideo