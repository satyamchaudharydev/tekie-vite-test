import React from "react";
import clx from "classnames";

import classes from "./heading.module.scss";

const Heading = ({
	children,
	className,
	color,
	size = "md",
	as,
	weight,
	align,
	...props
}) => {
	const rootClasses = clx(
		classes.root,
		classes[`color-${color}`],
		classes[`size-${size}`],
		classes[`weight-${weight}`],
		classes[`align-${align}`],
		className
	);

	let HeadingTag;

	if (as) {
		HeadingTag = as;
	} else {
		switch (size) {
			case "sm":
				HeadingTag = "h4";
				break;
			case "md":
				HeadingTag = "h3";
				break;
			case "lg":
				HeadingTag = "h2";
				break;
			case "xl":
				HeadingTag = "h1";
				break;
			default:
				HeadingTag = "h1";
		}
	}

	let styles = {};

	if (color && color !== "primary" && color !== "secondary") {
		styles = { color };
	}

	return (
		<HeadingTag className={rootClasses} style={styles} {...props}>
			{children}
		</HeadingTag>
	);
};


export default Heading;
