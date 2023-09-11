import React from "react";
import classNames from "classnames";

import classes from "./paragraph.module.scss";

const Paragraph = ({
	children,
	className,
	variant,
	color,
	align,
	style,
	...props
}) => {
	return (
		<p
			className={classNames(
				classes.paragraph,
				classes[variant],
				classes[color],
				classes[align],
				className
			)}
			style={{ color: color, ...style }}
			{...props}
		>
			{children}
		</p>
	);
};


export default Paragraph;
