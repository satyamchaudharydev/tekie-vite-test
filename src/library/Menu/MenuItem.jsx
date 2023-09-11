import React from "react";
import cx from "classnames";

import classes from "./menuItem.module.scss";

const MenuItem = ({
	icon,
	onClick = () => {},
	className,
	danger,
	children,
	disabled,
	...props
}) => {
	const handleClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onClick();
	};

	return (
		<button
			onClick={handleClick}
			className={cx(className, classes.menuItem, {
				[classes.danger]: danger,
				[classes.disabled]: disabled,
			})}
			disabled={disabled}
			{...props}
		>
			{icon && <span>{icon}</span>}
			<p>{children}</p>
		</button>
	);
};

export default MenuItem;
