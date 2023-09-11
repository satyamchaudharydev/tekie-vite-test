import React from "react";
import classNames from "classnames";

import classes from "./iconButton.module.scss";

const IconButton = ({
	children,
	onClick,
	primaryGradient,
	size,
	style,
	...rest
}) => {
	const handleClick = (e) => {
		e.preventDefault();
		onClick(e);
	};

	return (
		<button
			onClick={handleClick}
			className={classNames(classes.iconButton, classes[size], {
				[classes.primaryGradient]: primaryGradient,
			})}
			style={style}
			{...rest}
		>
			{children}
		</button>
	);
};


export default IconButton;
