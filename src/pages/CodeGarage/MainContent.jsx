import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { get } from "lodash";
import qs from "query-string";
import { useHistory } from "react-router";

import RadioGroup from "../../library/RadioGroup";
import RadioPill from "../../library/RadioPill/RadioPill";
import LanguageIcon from "../Editor/components/LanguageIcon";
import AllSavedCodeCards from "./SavedCodes/AllSavedCodeCards";
import Divider from "../../library/Divider";
import fetchSaveCode from "../../queries/saveCode/fetchSavedCode";
import getMe from "../../utils/getMe";
import SavedCardSkeleton from "./SavedCodesSkeleton/SavedCodesSkeleton";
import Pagination from "../../components/Pagination/Pagination";
import classes from "./codeGarage.module.scss";
import Button from "../../library/Button/";

const LANGUAGE_FILTER_NAME = "languageType";
const CODE_STATUS_FILTER_NAME = "codeStatus";

const MainContent = ({ savedCodes, savedCodesStatus, searchBy, managementApp }) => {
	const history = useHistory();
	// prepending + to convert string to number
	const page = +get(qs.parse(history.location.search), "page", 1);

	// filters state
	const [languageTypeFilter, setLanguageTypeFilter] = useState();
	const [codeStatusFilter, setCodeStatusFilter] = useState();

	// get current user's id
	const userId = getMe().id;

	// get total number of saved codes
	const totalNumberOfSavedCodes = useSelector((state) => {
		const { data } = state;
		const count = data.getIn(["totalSavedCodes", "data", 0, "count"]);
		return count;
	});

	// get numbers of saved codes in review
	const numberOfSavedCodesInReview = useSelector((state) => {
		const { data } = state;
		const count = data.getIn(["totalSavedCodesInReview", "data", 0, "count"]);
		return count;
	});

	// get total saved codes published
	const numberOfSavedCodesPublished = useSelector((state) => {
		const { data } = state;
		const count = data.getIn(["totalSavedCodesPublished", "data", 0, "count"]);
		return count;
	});

	// fetch saved codes on page change or filter change
	useEffect(() => {
		fetchSaveCode({
			userId,
			fileNameContains: searchBy,
			first: 10,
			skip: page - 1,
			languageType: languageTypeFilter,
			codeStatus: codeStatusFilter,
		}).call();
	}, [page, languageTypeFilter, codeStatusFilter, searchBy]);

	// change filter handler
	const languageTypeFilterChangeHandler = (e) => {
		// uncheck all other checkboxes in that group
		document
			.querySelectorAll(`input[name="${LANGUAGE_FILTER_NAME}"]`)
			.forEach((el) => {
				if (el !== e.target) {
					el.checked = false;
				}
			});

		if (languageTypeFilter === e.target.value) {
			setLanguageTypeFilter();
			return;
		}

		setLanguageTypeFilter(e.target.value);
	};

	const statusFilterChangeHandler = (e) => {
		// uncheck all other checkboxes in that group
		document
			.querySelectorAll(`input[name="${CODE_STATUS_FILTER_NAME}"]`)
			.forEach((el) => {
				if (el !== e.target) {
					el.checked = false;
				}
			});

		if (codeStatusFilter === e.target.value) {
			setCodeStatusFilter();
			return;
		}
		setCodeStatusFilter(e.target.value);
	};

	// clear filters handler
	const clearFiltersHandler = () => {
		setLanguageTypeFilter();
		setCodeStatusFilter();
		// uncheck the radio buttons
		document.querySelectorAll('input[type="checkbox"]').forEach((el) => {
			el.checked = false;
		});
	};

	// content to be rendered
	const content = (() => {
		if (savedCodesStatus.getIn(["fetchAllSavedCode", "loading"])) {
			return <SavedCardSkeleton />;
		} else if (savedCodesStatus.getIn(["fetchAllSavedCode", "failure"])) {
			return <div>Failed to load</div>;
		} else if (savedCodesStatus.getIn(["fetchAllSavedCode", "success"])) {
			return <AllSavedCodeCards savedCodes={savedCodes.toJS()} managementApp={managementApp} />;
		}
	})();

	return (
		<main className={classes.content}>
			<div className={classes.filtersContainer}>
				<div className={classes.radioGroup}>
					<RadioGroup
						name={LANGUAGE_FILTER_NAME}
						onChange={languageTypeFilterChangeHandler}
					>
						<RadioPill
							icon={<LanguageIcon mode="python" />}
							value="python"
							id="python"
							type="secondary"
						>
							Python
						</RadioPill>
						<RadioPill
							icon={<LanguageIcon mode="web" />}
							value="markup"
							id="markup"
							type="secondary"
						>
							Web Dev
						</RadioPill>

						<RadioPill
							icon={<LanguageIcon mode="blockly" />}
							value="blockly"
							id="blockly"
							type="secondary"
						>
							Blockly
						</RadioPill>
					</RadioGroup>

					<Divider vertical />

					<RadioGroup
						name={CODE_STATUS_FILTER_NAME}
						onChange={statusFilterChangeHandler}
					>
						<RadioPill
							value="inReview"
							id="in-review"
							type="secondary"
							badge={numberOfSavedCodesInReview}
						>
							In Review
						</RadioPill>
						<RadioPill
							value="published"
							id="published"
							badge={numberOfSavedCodesPublished}
							type="secondary"
						>
							Published
						</RadioPill>
					</RadioGroup>
				</div>

				{(languageTypeFilter || codeStatusFilter) && (
					<div>
						<Button text onClick={clearFiltersHandler}>
							Clear filters
						</Button>
					</div>
				)}
			</div>

			{content}

			<Pagination
				totalRecords={totalNumberOfSavedCodes}
				pageLimit={10}
				currentPage={page}
				path={history.location.pathname}
			/>
		</main>
	);
};

export default MainContent;
