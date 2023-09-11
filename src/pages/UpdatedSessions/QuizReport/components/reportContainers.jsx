import { get } from 'lodash';
import React from 'react';
import ContentLoader from 'react-content-loader'
import getPath from '../../../../utils/getPath';
import MasteryTube from './MasteryTube';
import ResultTube from './ResultTube';
import styles from '../QuizReport.module.scss';

export const TitleContainer = ({ isFetching, thisTopic }) => (
  <div className={styles.titleContainer}>
    <div className={styles.qrTopicContainer}>
      {isFetching ? (
        <ContentLoader
          className={styles.qrLoaderCard}
          speed={5}
          interval={0.1}
          backgroundColor={"#f5f5f5"}
          foregroundColor={"#dbdbdb"}
        >
          <rect className={styles.qrLoaderCircle} />
          <rect className={styles.qrLoader1} />
        </ContentLoader>
      ) : (
        <>
          {get(thisTopic, "thumbnailSmall.uri") && (
            <div
              className={styles.topicThumbnail}
              style={{
                backgroundImage: `url(${getPath(
                  get(thisTopic, "thumbnailSmall.uri", "")
                )})`,
              }}
            ></div>
          )}
          {thisTopic && get(thisTopic, 'title') && (
            <div className={styles.titleSm}>
              {get(thisTopic, 'title').length > 50
                ? get(thisTopic, 'title').substring(0, 50) + "..."
                : get(thisTopic, 'title')}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

export const ReportsContainer = ({
    isFetching,
    masteryLevelIndex = 0,
    masteryLabel,
    totalFill,
    correctFill,
    incorrectFill,
    unansweredFill,
}) => (
    <div className={styles.reportContainer}>
    <div className={styles.resultContainer}>
        {isFetching ? (
        <ContentLoader
            style={{ minHeight: "300px" }}
            className={styles.qrLoaderCard}
            speed={5}
            interval={0.1}
            backgroundColor={"#f5f5f5"}
            foregroundColor={"#dbdbdb"}
        >
            <rect className={styles.qrLoaderSq} />
            <rect className={styles.qrLoader2} />
            <rect className={styles.qrLoader3} />
        </ContentLoader>
        ) : (
        <>
            <MasteryTube
            mastery={masteryLevelIndex === -1 ? 0 : masteryLevelIndex}
            />
            <div className={styles.masteryTextContainer}>
            {masteryLabel.key !== "none" && (
                <div className={styles.congratulationText}>
                Congratulations
                <span />
                </div>
            )}
            <div className={styles.masteryText}>
                {masteryLabel.preText}
            </div>
            <div
                className={styles.masteryLabel}
                style={{
                background: masteryLabel.tagColor,
                boxShadow: `0px 0px 8px ${masteryLabel.tagColor}, inset 0px 0px 8px ${masteryLabel.tagColor}`,
                }}
            >
                {masteryLabel.tagName}
            </div>
            <div className={styles.masteryText}>
                {masteryLabel.postText}
            </div>
            </div>
        </>
        )}
    </div>
    <div className={styles.statsContainer}>
        {isFetching ? (
        <ContentLoader
            style={{ minHeight: "270px" }}
            className={styles.qrLoaderCard}
            speed={5}
            interval={0.1}
            backgroundColor={"#f5f5f5"}
            foregroundColor={"#dbdbdb"}
        >
            <rect className={styles.qrLoaderSq} />
            <rect className={styles.qrLoader2} />
            <rect className={styles.qrLoader3} />
        </ContentLoader>
        ) : (
        <>
            <div className={styles.summaryText}>Summary</div>
            <ResultTube
            label="Total Questions"
            total={totalFill}
            fill={totalFill}
            noAnimate
            colors={["#cffbff", "#00ade6"]}
            textColor="#1ac9e8"
            />
            <ResultTube
            label="Correct"
            total={totalFill}
            fill={correctFill}
            colors={["#65DA7A", "#16d977"]}
            textColor="#16d977"
            flakeColors={["#16d977"]}
            />
            <ResultTube
            label="Incorrect"
            total={totalFill}
            fill={incorrectFill}
            colors={["#FF5744"]}
            textColor="#ff5644"
            flakeColors={["#fd6554", "#800c00"]}
            />
            <ResultTube
            label="Unanswered"
            total={totalFill}
            fill={unansweredFill}
            colors={["#A8A7A7"]}
            textColor="#707070"
            flakeColors={["#aaacae", "#504f4f"]}
            />
        </>
        )}
    </div>
    </div>
); 