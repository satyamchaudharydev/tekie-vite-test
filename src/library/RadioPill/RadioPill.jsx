import React from "react";
import cx from "classnames"
import classes from "./radioPill.module.scss";

const RadioPill = ({ id, children, value, icon, badge, type = "primary", ...rest }) => {
	return (
		<>
			<input
				value={value}
				type="checkbox"
				className={classes.radio}
				id={id}
				{...rest}
			/>
			<label className={cx(type === "primary" ? classes.radioPillPrimary : classes.radioPillSecondary)} htmlFor={id}>
				<div className={classes.content}>
					{icon && <span className={classes.icon}>{icon}</span>}
					<span className={classes.text}>{children}</span>
					{badge !== undefined && (
						<span className={classes.badge}>{badge}</span>
					)}
				</div>
			</label>
		</>
	);
};



export default RadioPill;
