import React from "react";
import classNames from "classnames";

import LoadingSpinner from "../../pages/TeacherApp/components/Loader/LoadingSpinner";
import classes from "./button.module.scss";
import Stack from "../Stack";

const SimpleButton = React.forwardRef(
	(
		{
			className,
			icon,
			children,
			inverted = false,
			pill = false,
			text = false,
			size = "medium",
			type = "primary",
			onClick = () => { },
			disabled,
			loading = false,
			block,
			htmlType = "button",
			...props
		},
		ref
	) => (
		<button
			onClick={disabled || loading ? () => { } : onClick}
			className={classNames(
				classes.button,
				classes[size],
				{
					[classes[type]]: type,
					[classes.pill]: pill,
					[classes.disabled]: disabled || loading,
					[classes.inverted]: inverted,
					[classes.text]: text,
					[classes.block]: block,
				},
				className
			)}
			disabled={disabled || loading}
			ref={ref}
			type={htmlType}
			{...props}
		>
			<Stack direction='row' spacing={4} alignItems='center' justifyContent='center'>
				{loading ? <LoadingSpinner height="100%" color="white" /> : icon}
				<span>{children}</span>
			</Stack>
		</button>
	)
);



export default SimpleButton;
