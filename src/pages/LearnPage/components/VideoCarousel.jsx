import React, { useEffect, useRef, useState } from "react";
import styles from "../style.module.scss";
import { AnimatePresence, motion, AnimateSharedLayout } from "framer-motion";
import useMeasure from "../../../hooks/userMeasure";
import usePrevious from "../../../hooks/usePrevious";
import { ReactComponent as Next } from "../../../assets/chevronRight.svg";
import { ReactComponent as Prev } from "../../../assets/chevronLeft.svg";
import { ReactComponent as LikeIcon } from "../../../assets/like.svg";
import { ShowVideo } from "./ShowVideo";
import updateUserVideo from "../../../queries/updateUserVideo";
import duck from "../../../duck";
import { truncateStr } from "../../../utils/text/turncate";
import useOnClickOutside from "../../../hooks/useOnClickOutside";

export const VideoCarousel = ({
	videos,
	currentItem = 0,
	learnUserVideos,
	onClose = () => {}
}) => {
	const [ref, rect, measure] = useMeasure();
	let [count, setCount] = useState(currentItem); // Initialize count with 0
	const [isBookmark, setIsBookmark] = useState(false);
	useOnClickOutside(ref, () => {
		onClose();
	});
	let prev = usePrevious(count);
	let direction = count > prev ? 1 : -1;
	const { width } = rect;

	let currentVideo = 0;
	if (videos && videos.length > 0) {
		currentVideo = videos[count];
	}
	const userVideoId = currentVideo.userVideoId;

	useEffect(() => {
		if (currentVideo) {
			const isBookmark = currentVideo.isBookmarked;
			setIsBookmark(isBookmark);
		}
	}, [currentVideo]);

	const updateBookmark = async () => {
		const userVideos = learnUserVideos.toJS();
		const input = {
			isBookmarked: !isBookmark
		};
		await updateUserVideo(userVideoId, input);
		userVideos.forEach(userVideo => {
			if (userVideo.id === userVideoId) {
				userVideo.isBookmarked = !isBookmark;
			}
		});
		duck.merge(
			() => ({
				learnVideos: userVideos
			}),
			{
				key: `learnVideos`
			}
		);
		setIsBookmark(!isBookmark);
	};
	return (
		<motion.div className={styles.videoCarouselContainer}>
			<motion.div
				ref={ref}
				initial={{
					x: "-100%"
				}}
				animate={{
					x: 0
				}}
				transition={{
					duration: 0.4,
					ease: "easeInOut"
				}}
				className={styles.videoCarousel}
			>
				<button
					onClick={() => setCount((count + videos.length - 1) % videos.length)}
					className={styles.videoCarouselButton}
				>
					<Prev></Prev>
				</button>
				<div className={styles.videoCarouselItemContainer}>
					<AnimateSharedLayout>
						<AnimatePresence custom={{ direction, width }}>
							<motion.div
								key={`${videos[count]}-${count}`} // Combine the index and the color into a key
								variants={variants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.4 }}
								custom={{ direction, width }}
								className={styles.videoCarouselItem}
							>
								<div className={styles.video}>
									<ShowVideo url={currentVideo.videoFile.uri} />
								</div>

								<div className={styles.videoFooter}>
									<div className={styles.videoContent}>
										<h3 className={styles.videoTitle}>{currentVideo.title}</h3>
										<p className={styles.videoDescription}>
											{truncateStr(currentVideo.description, 200)}
										</p>
									</div>
									<div className={styles.btnHandles}>
										<button
											onClick={() => {
												updateBookmark();
											}}
											className={`${styles.bookmark} ${
												isBookmark ? styles.active : ""
											}`}
										>
											BookMark
											<LikeIcon />
										</button>
									</div>
								</div>
							</motion.div>
						</AnimatePresence>
					</AnimateSharedLayout>
				</div>
				<button
					onClick={() => setCount((count + 1) % videos.length)}
					className={styles.videoCarouselButton}
				>
					<Next />
				</button>
			</motion.div>
		</motion.div>
	);
};
let variants = {
	enter: ({ direction, width }) => ({
		x: direction * width,
		opacity: 1
	}),
	center: { x: 0 },
	exit: ({ direction, width }) => ({
		x: direction * -width,
		opacity: 0.4
	})
};
