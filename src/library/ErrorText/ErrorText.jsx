import React from "react";
import clx from "classnames";

import classes from "./errorText.module.scss";

const ErrorText = ({ children, className }) => {
	return <p className={clx(className, classes.errorText)}>{children}</p>;
};



export default ErrorText;
