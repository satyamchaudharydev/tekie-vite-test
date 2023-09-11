import React from "react";
import clx from "classnames";
import classes from "./stack.module.scss";

const Stack = ({
	spacing,
	direction,
	className,
	children,
	as,
	justifyContent,
	alignItems,
	style,
	...props
}) => {
	const Component = as || "div";

	return (
		<Component
			className={clx(
				classes.stack,
				classes[direction],
				classes[`s${spacing}`],
				className
			)}
			style={{
				justifyContent,
				alignItems,
				...style,
			}}
			{...props}
		>
			{children}
		</Component>
	);
};


export default Stack;
