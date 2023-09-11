import React, { useState } from "react";
import { connect } from "react-redux";

import { Header } from "./Header";
import MainContent from "./MainContent";
import classes from "./codeGarage.module.scss";
import NoSearchResult from "./NoSearchResult/NoSearchResult";
import useDebounce from "../../hooks/useDebounce";
import { filterKey } from "../../utils/data-utils";
import { FETCH_SAVE_CODE_KEY } from "../../queries/saveCode/fetchSavedCode";

const CodeGarage = ({ savedCodes, savedCodesStatus,managementApp }) => {
	const [searchBy, setSearchBy] = useState(null);
	const debouncedSearchBy = useDebounce(searchBy, 1000);
	let content = (
		<MainContent
			savedCodes={savedCodes}
			savedCodesStatus={savedCodesStatus}
			searchBy={debouncedSearchBy}
			managementApp={managementApp}
		/>
	);

	if (searchBy && savedCodes.size === 0) {
		content = <NoSearchResult searchKeyword={searchBy} />;
	}

	return (
		<div className={classes.root}>
			<Header setSearchBy={setSearchBy} />
			{content}
		</div>
	);
};

const mapStateToProps = (state) => ({
	savedCodes: filterKey(state.data.getIn(["savedCode", "data"]), FETCH_SAVE_CODE_KEY),
	savedCodesStatus: state.data.getIn(["savedCode", "fetchStatus"]),
});

export default connect(mapStateToProps)(CodeGarage);
