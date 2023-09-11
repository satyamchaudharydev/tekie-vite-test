import React from "react";
import Creatable from "react-select/creatable";

import classes from "./autocomplete.module.scss";
import Stack from "../Stack";

const styles = {
	control: (provided, state) => ({
		...provided,
		border: state.isFocused
			? "1px solid #00ADE6"
			: "1px solid rgba(64, 63, 63, 0.25)",
		borderRadius: "8px",
		padding: "2px",
		boxShadow: "none",
		fontSize: "14px",
		fontWeight: "600",
		fontFamily: "Nunito",
		color: "rgba(0, 0, 0, 0.72)",

		"&:hover": {
			borderColor: "#00ADE6",
		},
	}),

	dropdownIndicator: (provided, state) => ({
		...provided,
		color: state.isFocused ? "#00ADE6" : "rgba(64, 63, 63, 0.25)",

		"&:hover": {
			color: "#00ADE6",
		},
	}),

	menu: (provided, state) => ({
		...provided,
		borderRadius: "8px",
		boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
		border: "1px solid rgba(64, 63, 63, 0.25)",
		marginTop: "4px",
		fontSize: "14px",
		fontWeight: "600",
		fontFamily: "Nunito",
		color: "rgba(0, 0, 0, 0.72)",
	}),

	option: (provided, state) => ({
		...provided,
		backgroundColor: state.isSelected ? "#00ADE6" : "white",
		color: state.isSelected ? "white" : "rgba(0, 0, 0, 0.72)",
		opacity: state.isDisabled ? 0.5 : 1,
		":hover": {
			backgroundColor: state.isDisabled ? "rgba(64, 63, 63, 0.1)" : "#00ADE6",
			color: state.isDisabled ? "rgba(0, 0, 0, 0.72)" : "white",
			opacity: "0.8",
		},
	}),

	input: (provided, state) => ({
		...provided,
		fontFamily: "Nunito",
		color: "rgba(0, 0, 0, 0.72)",
	}),

	multiValue: (provided, state) => ({
		...provided,
		background: "rgba(0, 0, 0, 0.04)",
		border: "1px solid rgba(0, 0, 0, 0.16)",
		borderRadius: "8px",
		fontWight: "500",
		fonTSize: "12px",
		lineHeight: "20px",
		maxWidth: "300px",

		"&>div": {
			color: "#858585",
		},
	}),

	multiValueRemove: (provided, state) => ({
		...provided,
		color: "#858585",
		borderRadius: "8px",
		":hover": {
			color: "#858585",
			backgroundColor: "rgba(0, 0, 0, 0.04)",
		},
	}),
};

const Autocomplete = ({
	label,
	onChange,
	maxLimit = 5,
	selectedOptions = [],
	...props
}) => {
	return (
		<Stack spacing={6} style={{ width: "100%" }}>
			{label && (
				<label className={classes.label} htmlFor="react-select-8-input">
					{label}
				</label>
			)}
			<Creatable
				styles={styles}
				value={selectedOptions || []}
				formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
				onChange={(value) => onChange(value)}
				isOptionDisabled={(option) =>
					option.isDisabled ||
					(selectedOptions && selectedOptions.length >= maxLimit)
				}
				{...props}
			/>
		</Stack>
	);
};


// default props
Autocomplete.defaultProps = {
	maxLimit: 5,
	selectedOptions: [],
};

export default Autocomplete;
