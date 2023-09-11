import React, { useState } from "react";

import Button from "../../../library/Button";
import { SavedCodeCTA } from "../../CodeGarage/SavedCodes/SavedCodeCTA";
import { ReactComponent as PublishIcon } from "../../../assets/codeGarage/publishIcon.svg";
import { ReactComponent as EyeIcon } from "../../../assets/codeGarage/eyeIcon.svg";
import { ReactComponent as PublishedIcon } from "../../../assets/codeGarage/publishedIcon.svg";
import { SAVED_CODE_STATUS } from "../../../constants/savedCode/savedCodeStatus";
import Stack from "../../../library/Stack";
import Tooltip from "../../../library/Tooltip";

const PublishAndCTA = ({
	savedCodeId,
	savedCodeStatus,
	openPublishDialog,
	openEditSavedCodeDialog,
}) => {
	// tooltip anchor element
	const [tooltipAnchorEl, setTooltipAnchorEl] = useState(null);

	const isTooltipOpen = Boolean(tooltipAnchorEl);

	const handleTooltipOpen = (event) => {
		setTooltipAnchorEl(event.currentTarget);
	};

	const handleTooltipClose = () => {
		setTooltipAnchorEl(null);
	};

	return (
		<>
			<Stack direction="row">
				{savedCodeStatus === SAVED_CODE_STATUS.IN_REVIEW ? (
					<Button icon={<EyeIcon />} style={{ backgroundColor: "#8C61CB" }}>
						In Review
					</Button>
				) : null}

				{savedCodeStatus === SAVED_CODE_STATUS.PUBLISHED ? (
					<Button
						style={{
							backgroundColor: "#01AA93",
						}}
						icon={<PublishedIcon />}
						onMouseEnter={handleTooltipOpen}
						onMouseLeave={handleTooltipClose}
					>
						Published
					</Button>
				) : (
					<Button
						disabled={savedCodeStatus === SAVED_CODE_STATUS.IN_REVIEW}
						icon={<PublishIcon />}
						onClick={openPublishDialog}
					>
						Publish
					</Button>
				)}

				{savedCodeStatus !== SAVED_CODE_STATUS.PUBLISHED && (
					<SavedCodeCTA
						id={savedCodeId}
						showViewCodeItem={false}
						openEditSavedCodeDialog={openEditSavedCodeDialog}
						savedCodeStatus={savedCodeStatus}
					/>
				)}
			</Stack>

			<Tooltip open={isTooltipOpen} anchorEl={tooltipAnchorEl}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				offsetY={8}
			>
				Congratulations ! Your<br /> code is now published.
			</Tooltip>
		</>
	);
};

export default PublishAndCTA;
