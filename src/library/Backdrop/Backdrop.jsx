import React from "react";

import classes from "./backdrop.module.scss";

const Backdrop = ({ children, active, onClick }) => {
	return (
		<div
			className={`${classes.backdrop} ${active && classes.active}`}
			onClick={onClick}
		>
			{children}
		</div>
	);
};



export default Backdrop;
