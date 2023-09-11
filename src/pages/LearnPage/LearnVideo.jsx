import React, { useCallback, useEffect, useState } from "react";
import { Banner } from "./components/Banner";
import styles from "./style.module.scss";
import { ChapterTitle } from "./components/ChapterTitle";
import { motion } from "framer-motion";
import { ReactComponent as PlayButton } from "../../assets/learn/playButton.svg";
import defaultThumbnail from "../../assets/sessionCard.png";
import { VideoCarousel } from "./components/VideoCarousel";
import {
	getFilterTopics,
	getTopicsByChapter,
	getVideoIds,
	getVideosFromChapterVideos
} from "./utils";
import { fetchVideos } from "./fetchVideos";
import { get, isEmpty } from "lodash";
import getMe from "../../utils/getMe";
import { fetchUserVideos } from "./fetchUserVideos";
import { truncateStr } from "../../utils/text/turncate";
import getPath from "../../utils/getFullPath";
import SavedCardSkeleton from "../CodeGarage/SavedCodesSkeleton/SavedCodesSkeleton";
import { VideoCard } from "./components/VideoCard";

export const LearnVideo = ({
	menteeSession,
	videos,
	learnUserVideos,
	courses
}) => {
	const [showCarousel, setShowCarousel] = React.useState(false);
	let [count, setCount] = useState(0); // Initialize count with 0
	const [chapterData, setChapterData] = useState({});
	const [filterChapterData, setFilterChapterData] = useState({});
	const [loader, setLoader] = useState(false);

	const handleVideoCardClick = index => {
		setShowCarousel(true);
		setCount(index);
	};
	const filteredTopics = getFilterTopics(menteeSession.toJS(), courses);
	const videoIds = useCallback(getVideoIds(filteredTopics), [
		menteeSession.toJS()
	]);
	const userId = getMe().id;

	const fetchChapterVideos = async () => {
        setLoader(true);
		const data = await Promise.all([
			fetchVideos(videoIds).call(),
			fetchUserVideos(userId, videoIds).call()
		]);
		setLoader(false);
	};

	useEffect(() => {
		if (videos.toJS().length > 0) return;
		fetchChapterVideos();
	}, [videoIds]);

	useEffect(() => {
		if (
			videos.toJS().length &&
			learnUserVideos.toJS().length > 0 &&
			!chapterData.length
		) {
			const chapterVideos = getTopicsByChapter(
				filteredTopics,
				videos.toJS(),
				learnUserVideos.toJS()
			);
			if (chapterVideos) {
				if (Object.keys(chapterData).length > 0) return;
				setChapterData(chapterVideos);
				setFilterChapterData(chapterVideos);
			}
		}
	}, [videos.toJS(), learnUserVideos.toJS()]);

	const filteredChapterData = videoFilter => {
		const chapters = { ...chapterData };

		if (videoFilter === "all") return chapterData;
		if (videoFilter === "bookmarked") {
			// filter out the videos that are not bookmarked
			const filterChapterVideos = {};
			for (const key in chapters) {
				let chapterArray = chapters[key];
				chapterArray.forEach(chapter => {
					if (chapter.videos) {
						const filteredVideos = chapter.videos.filter(video => {
							return video.isBookmarked;
						});
						if (filteredVideos.length > 0) {
							filterChapterVideos[key] = [chapter];
						}
					}
				});
			}
			return filterChapterVideos;
		}
	};
	const renderChapterVideos = () => {
		if (!videos.toJS().length && menteeSession.toJS().length) return null;
		return (
			<>
				<div className={styles.chapterVideoContainer}>
					{!isEmpty(filterChapterData) &&
						Object.keys(chapterData).map(chapterTitle => {
							const chapterVideos = chapterData[chapterTitle];
							chapterTitle = `Chapter: ${chapterTitle.split("-")[1]}`;
							return (
								<>
									<motion.div className={styles.chapterVideo}>

			                            <ChapterTitle title={chapterTitle} className={styles.chapterTitle} />
			                            <div className={styles.chapterVideoList}>
										{chapterVideos.map(video => {
											const videos = video.videos;
											return (
												<>
													<VideoCard
														chapterTitle={chapterTitle}
														videos={videos}
                                                        chapterItem={video}
														handleClick={handleVideoCardClick}
														chapterData={chapterData}
													/>
												</>
											);
										})}
                                        </div>
									</motion.div>
								</>
							);
						})}
				</div>
			</>
		);
	};
	const onChange = value => {
		const filteredData = filteredChapterData(value);
		setFilterChapterData(filteredData);
	};
	const skeletionLoader = () => {
		return (
			<div className={styles.videoCardSkeleton}>
				<SavedCardSkeleton
					itemCount={3}
					fullSize
					className={`${styles.chapterVideoCard} ${styles.loading}`}
				/>
			</div>
		);
	};
	return (
		<>
			<div className={styles.learnVideoPage}>
				<Banner onChangeFilter={onChange} />
				{loader ? skeletionLoader() : renderChapterVideos()}
				{showCarousel ? (
					<VideoCarousel
						currentItem={count}
						learnUserVideos={learnUserVideos}
						onClose={() => setShowCarousel(false)}
						videos={getVideosFromChapterVideos(chapterData)}
					/>
				) : null}
			</div>
		</>
	);
};
