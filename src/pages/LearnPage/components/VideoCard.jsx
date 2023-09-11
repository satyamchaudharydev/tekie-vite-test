import React from "react";
import styles from "../style.module.scss";
import { motion } from "framer-motion";
import { ChapterTitle } from "./ChapterTitle";
import { getVideosFromChapterVideos } from "../utils";
import { get } from "lodash";
import defaultThumbnail from "../../../assets/sessionCard.png";
import { ReactComponent as PlayButton } from "../../../assets/learn/playButton.svg";

import { truncateStr } from "../../../utils/text/turncate";
import getPath from "../../../utils/getFullPath";

export const VideoCard = ({
	videos,
	chapterData,
	handleClick = () => {},
	chapterItem
}) => {
	return (
		<>
			{videos.map(video => {
				const index = getVideosFromChapterVideos(chapterData).findIndex(
					item => item.id === video.id
				);
				const videoTitle = get(video, "title", "");
				const videoDesc = get(video, "description", "")
					? truncateStr(get(video, "description", ""), 100)
					: "";
				let videoThumbnail = get(video, "thumbnail.uri");
				if (!videoThumbnail) {
					videoThumbnail = defaultThumbnail;
				} else {
					videoThumbnail = getPath(videoThumbnail);
				}
				return (
					<div
						className={styles.chapterVideoCard}
						onClick={() => handleClick(index)}
						style={{ backgroundImage: `url(${videoThumbnail})` }}
					>
						<div className={styles.overlay}></div>
						<div className={styles.videoCardThumbnail}></div>
						<h2 className={styles.videoCardTitle}>{videoTitle}</h2>
						<motion.div className={styles.videoCardDesc}>
							{videoDesc}
						</motion.div>
						<div className={styles.bottomInfo}>
							<h2 className={styles.bottomInfoTitle}>{videoTitle}</h2>
							<div className={styles.videoPlayIcon}>
								<PlayButton />
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
};
