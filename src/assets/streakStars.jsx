import React from 'react'

const StreakStars = ({ streakCount = 0 }) => (
    <svg width="100%" height="100%" viewBox="0 0 598 63" fill="none" xmlns="http://www.w3.org/2000/svg">
        {(streakCount >= 5) && (
            <>
                <path d="M44.5 40L46.6329 46.5643H53.535L47.9511 50.6213L50.084 57.1857L44.5 53.1287L38.916 57.1857L41.0489 50.6213L35.465 46.5643H42.3671L44.5 40Z" fill="#80D6F3" fill-opacity="0.3"/>
                <path d="M176.812 12.1275L175.881 18.9665L182.098 21.9653L175.306 23.1933L174.375 30.0324L171.108 23.9523L164.316 25.1803L169.089 20.1946L165.823 14.1144L172.039 17.1132L176.812 12.1275Z" fill="#80D6F3" fill-opacity="0.3"/>
                <path d="M424.546 38.1453L425.141 45.0218L431.865 46.5804L425.509 49.2716L426.104 56.148L421.581 50.9349L415.225 53.6261L418.785 47.7129L414.262 42.4998L420.985 44.0584L424.546 38.1453Z" fill="#80D6F3" fill-opacity="0.3"/>
                <path d="M588.546 6.14533L589.141 13.0218L595.865 14.5804L589.509 17.2716L590.104 24.148L585.581 18.9349L579.225 21.6261L582.785 15.7129L578.262 10.4998L584.985 12.0584L588.546 6.14533Z" fill="#80D6F3" fill-opacity="0.3"/>
                <path d="M502.546 2.14533L503.141 9.02175L509.865 10.5804L503.509 13.2716L504.104 20.148L499.581 14.9349L493.225 17.6261L496.785 11.7129L492.262 6.49977L498.985 8.05844L502.546 2.14533Z" fill="#80D6F3" fill-opacity="0.3"/>
            </>
        )}
        {(streakCount >= 10) && (
            <>
                <path d="M354.546 11.1453L355.141 18.0218L361.865 19.5804L355.509 22.2716L356.104 29.148L351.581 23.9349L345.225 26.6261L348.785 20.7129L344.262 15.4998L350.985 17.0584L354.546 11.1453Z" fill="#80D6F3" fill-opacity="0.3"/>
                <path d="M540.329 40.8166L545.07 45.8331L551.306 42.8746L548 48.9335L552.741 53.95L545.957 52.6781L542.651 58.737L541.764 51.892L534.98 50.6201L541.216 47.6616L540.329 40.8166Z" fill="#80D6F3" fill-opacity="0.3"/>
                <path d="M91.583 10.0725L96.3238 15.089L102.56 12.1305L99.2537 18.1893L103.994 23.2058L97.2105 21.9339L93.9045 27.9928L93.0178 21.1479L86.2338 19.876L92.4697 16.9174L91.583 10.0725Z" fill="#80D6F3" fill-opacity="0.3"/>
                <path d="M247.583 37.0725L252.324 42.089L258.56 39.1305L255.254 45.1893L259.994 50.2058L253.21 48.9339L249.904 54.9928L249.018 48.1479L242.234 46.876L248.47 43.9174L247.583 37.0725Z" fill="#80D6F3" fill-opacity="0.3"/>
                <path d="M8.58303 13.0725L13.3238 18.089L19.5597 15.1305L16.2537 21.1893L20.9944 26.2058L14.2105 24.9339L10.9045 30.9928L10.0178 24.1479L3.2338 22.876L9.46974 19.9174L8.58303 13.0725Z" fill="#80D6F3" fill-opacity="0.3"/>
            </>
        )}
        {(streakCount >= 15) && (
            <>
                <path d="M149.304 47.7563L151.259 49.6448L153.66 48.3687L152.468 50.8119L154.423 52.7005L151.731 52.322L150.539 54.7653L150.067 52.0881L147.375 51.7096L149.776 50.4335L149.304 47.7563Z" fill="#80D6F3" fill-opacity="0.3" />
                <path d="M269.334 13.845L269.569 16.5533L272.217 17.1672L269.714 18.2271L269.948 20.9355L268.167 18.8822L265.663 19.9422L267.066 17.6132L265.284 15.56L267.932 16.1739L269.334 13.845Z" fill="#80D6F3" fill-opacity="0.3" />
                <path d="M493.733 47.186L495.689 49.0745L498.089 47.7984L496.897 50.2416L498.853 52.1301L496.161 51.7517L494.969 54.1949L494.497 51.5177L491.805 51.1393L494.205 49.8632L493.733 47.186Z" fill="#80D6F3" fill-opacity="0.3"/>
            </>
        )}
    </svg>
)

export default StreakStars;