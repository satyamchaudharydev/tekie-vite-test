import React, { Suspense } from 'react'
import { useNProgress } from '@tanem/react-nprogress'
import './withSuspense.scss'


export const DefaultLoader = () => {
  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating: true
  })
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: `
        <div
          style="opacity: ${isFinished ? 0 : 1}; pointer-events: none; transition: opacity ${animationDuration}ms linear"
        >
          <div
            style="background: #29d; height: 2px; left: 0px; margin-left: ${(-1 + progress) * 100}%; position: fixed; top: 0; transition: margin-left ${animationDuration}ms linear; width: 100%; z-index: 1031"
          >
            <div
              style="box-shadow: 0 0 10px #29d, 0 0 5px #29d; display: block; height: 100%; opacity: 1; position: absolute; right: 0; transform: rotate(3deg) translate(0px, -4px); width: 100px"
            />
          </div>
        </div>
      `}} />
    </>
  )
}

const withSuspense = (WrappedComponent, Loader = DefaultLoader) => props => (
  <Suspense fallback={<Loader /> }>
    <WrappedComponent {...props} />
  </Suspense>
);

export default withSuspense
