import React from "react";
import classes from "./radioGroup.module.scss";

const RadioGroup = ({ name, children, onChange }) => {
	return (
		<div onChange={onChange} className={classes.group}>
			{React.Children.map(children, (child, index) => {
				return React.cloneElement(child, {
					name,
					key: child.props.id || index,
					...child.props,
				});
			})}
		</div>
	);
};



export default RadioGroup;
