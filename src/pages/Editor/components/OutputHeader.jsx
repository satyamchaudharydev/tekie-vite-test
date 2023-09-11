import React from "react";
import ExternalLinkSvg from "../../../assets/externalLink.svg";
import styles from "../styles.module.scss";
import Toggle from "./Toggle";
import Stack from "../../../library/Stack";
import PublishAndCTA from "./PublishAndCTA";

function OutputHeader({
	title,
	openPublishDialog,
	openEditSavedCodeDialog,
	mode,
	clearInterpretor,
	savedCodeId,
	savedCodeStatus,
	togglePreview,
	toggleState,
	fromReportPage = false,
	userCode,
	fromCodeShowCasePage = false,
}) {
	const onViewOutputClick = () => {
		if (typeof window !== 'undefined' && userCode) {
			let newTab = window.open('', '_blank')
     		newTab.document.write(userCode)
		} 
	}
	return (
		<div
			className={styles.title}
			style={{
				position: "relative",
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
			}}
		>
			<p>Output</p>

			<Stack spacing={10} direction="row">
				{(!Boolean(savedCodeStatus) && mode !== "python" && !fromReportPage) ? (
					<Toggle
						label="live preview"
						toggleState={toggleState}
						handleToggle={togglePreview}
					/>
				) : null}
				{mode !== 'python' && fromCodeShowCasePage ? (
					<div className={styles.viewOutput}>
						<img src={ExternalLinkSvg} alt='External Link' onClick={onViewOutputClick} />
						<span>View Output</span>
					</div>
				) : null}

				{Boolean(savedCodeId) ? (
					<PublishAndCTA 
						savedCodeId={savedCodeId}
						savedCodeStatus={savedCodeStatus}
						openPublishDialog={openPublishDialog}
						openEditSavedCodeDialog={openEditSavedCodeDialog}
					/>
				) : null}
			</Stack>
		</div>
	);
}

export default OutputHeader;
