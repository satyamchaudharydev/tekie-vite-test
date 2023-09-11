import React from "react";
import cx from "classnames";

import { ReactComponent as EyeIcon } from "../../../assets/codeGarage/eyeIcon.svg";
import { ReactComponent as PublishedIcon } from "../../../assets/codeGarage/publishedIcon.svg";

import classes from "./codeStatusLabel.module.scss";

// status: "inReview" | "published"

const CodeStatusLabel = ({ status }) => {
	const statusMap = {
		inReview: { icon: <EyeIcon />, text: "In Review" },
		published: { icon: <PublishedIcon />, text: "Published" },
	};

	return (
		<div
			className={cx(classes.statusLabel, {
				[classes.inReview]: status === "inReview",
				[classes.published]: status === "published",
			})}
		>
			<div>{statusMap[status].icon}</div>

			<p>{statusMap[status].text}</p>
		</div>
	);
};

export default CodeStatusLabel;
