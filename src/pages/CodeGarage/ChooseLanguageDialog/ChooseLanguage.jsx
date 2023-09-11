import React from "react";
import { CODE_PLAYGROUND, TEACHER_CODE_PLAYGROUND } from "../../../constants/routes/routesPaths";
import ChooseLangButton from "../ChooseLangButton/ChooseLangButton";

import classes from "./chooseLanguage.module.scss";

const PYTHON = "python";
const BLOCKLY = "blockly";
const MARKUP = "markup";

const ChooseLanguage = ({managementApp}) => {
	const buttons = [
		{
			mode: PYTHON,
			to: managementApp ? `${TEACHER_CODE_PLAYGROUND}?language=${PYTHON}` : `${CODE_PLAYGROUND}?language=${PYTHON}`,
		},
		{
			mode: MARKUP,
			to: managementApp ? `${TEACHER_CODE_PLAYGROUND}?language=${MARKUP}` :`${CODE_PLAYGROUND}?language=${MARKUP}`,
		},
		{
			mode: BLOCKLY,
			to: managementApp ? `${TEACHER_CODE_PLAYGROUND}?language=${BLOCKLY}` :`${CODE_PLAYGROUND}?language=${BLOCKLY}`,
		},
	];
	return (
		<div className={classes.container}>
			<h1>Choose Your Language</h1>
			<div className={classes.buttonsContainer}>
				{buttons.map((button) => (
					<ChooseLangButton key={button.mode} {...button} />
				))}
			</div>
		</div>
	);
};

export default ChooseLanguage;
