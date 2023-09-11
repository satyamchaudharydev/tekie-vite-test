import React from "react";

import { ReactComponent as MagnifyingGlass } from "../../../assets/codeGarage/magnifying-glass.svg";
import Heading from "../../../library/Heading";
import Paragraph from "../../../library/Paragraph";
import Stack from "../../../library/Stack";
import classes from "./noSearchResult.module.scss";

const NoSearchResult = ({ searchKeyword }) => {
	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			className={classes.container}
			style={{ flexGrow: 1 }}
		>
			<div className={classes.iconWrapper}>
				<MagnifyingGlass />
			</div>

			<Heading>Oops, No Matching Files Found</Heading>

			<Paragraph
				variant="title"
				align="center"
				style={{
					fontWeight: 600,
					color: "#858585",
          lineHeight: '140%'
				}}
			>
				There were&apos;nt any saved files matching
				<br /> your search{" "}
				<span style={{ color: "#403f3f" }}>"{searchKeyword}"</span>
			</Paragraph>
		</Stack>
	);
};

export default NoSearchResult;
