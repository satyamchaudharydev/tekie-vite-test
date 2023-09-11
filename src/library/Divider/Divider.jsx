import React from "react";
import cx from "classnames";

import classes from "./divider.module.scss";

const Divider = ({ vertical }) => {
	return (
		<div
			className={cx(classes.divider, {
				[classes.vertical]: vertical,
			})}
		></div>
	);
};


export default Divider;
