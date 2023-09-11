import React from "react";
import { Link } from "react-router-dom";

import { ReactComponent as AddCircle } from "../../../assets/codeGarage/add-circle.svg";
import LanguageIcon from "../../Editor/components/LanguageIcon";
import classes from "./chooseLangButton.module.scss";

// mode = "python" | "blockly"

const ChooseLangButton = ({ mode, to }) => {
	return (
		<Link className={classes.button} to={to}>
			<div className={classes.iconContainer}>
				<LanguageIcon mode={mode} full />
			</div>

			<div className={classes.title}>
				<AddCircle />
				<span>
					New{" "}
					{(() => {
						switch (mode) {
							case "python":
								return "Python";
							case "blockly":
								return "Blockly";
							default:
								return "Web Dev";
						}
					})()}{" "}
					File
				</span>
			</div>
		</Link>
	);
};

export default ChooseLangButton;
