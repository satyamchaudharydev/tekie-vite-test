import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import SyntaxHighlighter from "../../../utils/react-syntax-highlighter/dist/esm";
import { dracula } from "../../../utils/react-syntax-highlighter/dist/esm/styles/hljs";
import CodeStatusLabel from "../CodeStatusLabel";

import { decodeBase64, isBase64 } from "../../../utils/base64Utility";
import LanguageIcon from "../../Editor/components/LanguageIcon";
import Stack from "../../../library/Stack";

import classes from "./savedCodeCard.module.scss";
import { CODE_PLAYGROUND, TEACHER_CODE_PLAYGROUND } from "../../../constants/routes/routesPaths";
import { SavedCodeCTA } from "./SavedCodeCTA";
import {
	APPROVED_FOR_DISPLAY,
	SAVED_CODE_STATUS,
} from "../../../constants/savedCode/savedCodeStatus";
import BlocklyPreview from "../../Editor/components/BlocklyPreview";
import hs from "../../../utils/scale";
import { get } from "lodash";

const syntaxHighlighterStyles = {
	height: "100%",
	flexGrow: 1,
	borderRadius: "18px 18px 0px 0px",
	padding: "26px",
	overflow: "hidden",
	userSelect: "none",
	fontSize: "11px",
};

const SavedCodeCard = ({
	savedCode,
	openSaveDialog,
	setValues,
	setSavedCodeId,
	managementApp,
}) => {
	const getCodeStatus = () => {
		const { hasRequestedByMentee, isApprovedForDisplay } = savedCode;

		if (
			hasRequestedByMentee &&
			isApprovedForDisplay === APPROVED_FOR_DISPLAY.PENDING
		) {
			return SAVED_CODE_STATUS.IN_REVIEW;
		}

		if (
			hasRequestedByMentee &&
			isApprovedForDisplay === APPROVED_FOR_DISPLAY.ACCEPTED
		) {
			return SAVED_CODE_STATUS.PUBLISHED;
		}

		return null;
	};

	const openEditDialogHandler = () => {
		setValues({
			fileName: savedCode.fileName,
			description: savedCode.description,
		});
		setSavedCodeId(savedCode.id);
		openSaveDialog();
	};

	const getCodePreview = () => {
		if (savedCode.languageType === "blockly") {
			return <BlocklyPreview code={savedCode.code} />;
		}

		if (savedCode.languageType === "markup") {
			return (
				<WebPreview code={savedCode.code} savedCodeStatus={getCodeStatus()} />
			);
		}

		return (
			<SyntaxHighlighter
				language="python"
				style={dracula}
				customStyle={{
					...syntaxHighlighterStyles,
					paddingTop: Boolean(getCodeStatus()) ? hs(58) : 26,
				}}
			>
				{get(savedCode, 'code') || ""}
			</SyntaxHighlighter>
		);
	};

	return (
		<Link
			to={managementApp ? `${TEACHER_CODE_PLAYGROUND}/${savedCode.id}?language=${savedCode.languageType}` : `${CODE_PLAYGROUND}/${savedCode.id}?language=${savedCode.languageType}`}
			className={classes.cardContainer}
		>
			<div className={classes.card}>
				{/* CODE  */}

				{getCodePreview()}

				{/* CODE TITLE AND DESCRIPTION */}
				<Stack className={classes.cardFooter} gap={5}>
					<div className={classes.card__title}>
						{savedCode.languageType && (
							<span>
								<LanguageIcon mode={savedCode.languageType} full />
							</span>
						)}
						<span>{savedCode.fileName}</span>
					</div>
					{/* {savedCode.description && (
						<div className={classes.card__description}>
							{savedCode.description}
						</div>
					)} */}
				</Stack>

				{getCodeStatus() && (
					<div className={classes.card__status}>
						<CodeStatusLabel status={getCodeStatus()} />
					</div>
				)}

				<SavedCodeCTA
					id={savedCode.id}
					className={classes.card__moreButton}
					openEditSavedCodeDialog={openEditDialogHandler}
					savedCodeStatus={getCodeStatus()}
					language={savedCode.languageType}
				/>
			</div>
		</Link>
	);
};

const decodeIfBase64 = (code) => {
	try {
		if (isBase64(code)) return decodeBase64(code);
		return code;
	} catch (e) {
		return code;
	}
}
const WebPreview = ({ code, savedCodeStatus }) => {
	return (
		<div
			className={classes.webPreview}
			style={{
				paddingTop: Boolean(savedCodeStatus) ? hs(55) : 10,
			}}
		>
			<iframe srcDoc={decodeIfBase64(code)} title="web preview" />
		</div>
	);
};

export default SavedCodeCard;
