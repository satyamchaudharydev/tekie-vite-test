import React from "react";

import Input from "../../library/Input";
import { ReactComponent as SearchIcon } from "../../assets/codeGarage/searchIcon.svg";
import classes from "./codeGarage.module.scss";

export const Header = ({ setSearchBy }) => {
	const onChangeText = (e) => {
		setSearchBy(e.target.value);
	};

	return (
		<header className={classes.header}>
			<h1 className={classes.heading}>Code Garage</h1>
			<p className={classes.paragraph}>
				A collection of your experiments, across all languages and tools.
			</p>
			<Input
				name="search"
				placeholder="Search"
				inverted
				rounded
				onChange={onChangeText}
				className={classes.input}
				leftIcon={<SearchIcon className={classes.searchIcon} />}
			/>
		</header>
	);
};
