import React from "react";

import { ReactComponent as AddIcon } from "../../../assets/codeGarage/addCodeIcon.svg";
import { ReactComponent as HtmlIcon } from "../../../assets/codeGarage/htmlIcon.svg";
import { ReactComponent as PythonIcon } from "../../../assets/codeGarage/pythonIcon.svg";
import { ReactComponent as BlocklyIcon } from "../../../assets/codeGarage/blocklyIcon.svg";

import classes from "./addCodeCardButton.module.scss";

const AddCodeCardButton = ({ onClick }) => {
	return (
		<button className={classes.card} onClick={onClick}>
			<AddIcon className={classes.addIcon} />
			<p className={classes.cardTitle}>Create a new file</p>
			{/* <Icons /> */}
		</button>
	);
};

// const Icons = () => {
// 	return (
// 		<div className={classes.icons}>
// 			<HtmlIcon className={classes.icon} />
// 			<PythonIcon className={classes.icon} />
// 			<BlocklyIcon className={classes.icon} />
// 		</div>
// 	);
// };

export default AddCodeCardButton;
