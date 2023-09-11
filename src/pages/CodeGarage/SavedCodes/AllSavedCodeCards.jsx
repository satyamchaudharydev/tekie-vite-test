import React, { useState } from "react";

import SavedCodeCard from "./SavedCodeCard";
import Dialog from "../../../library/Dialog";
import ChooseLanguage from "../ChooseLanguageDialog/ChooseLanguage";
import AddCodeCardButton from "../AddCodeCardButton";
import updateSaveCode from "../../../queries/saveCode/updateSaveCode";

import classes from "./allSavedCodeCards.module.scss";
import SaveCodeDialog from "../../Editor/components/SaveCodeDialog";

const AllSavedCodeCards = ({ savedCodes, managementApp=false }) => {
	const [chooseLanguageDialogOpen, setChooseLanguageDialogOpen] = useState(
		false
	);
	console.log('managementApp',managementApp)
	// sort saved codes by createdAt
	savedCodes.sort((a, b) => {
		return new Date(b.createdAt) - new Date(a.createdAt);
	});

	// values of the saved code to be edited
	const [values, setValues] = useState({
		fileName: "",
		description: "",
	});

	// id of the saved code to be edited
	const [savedCodeId, setSavedCodeId] = useState();

	// change handler
	const handleChange = (e) => {
		const { name, value } = e.target;
		setValues((prevValues) => ({
			...prevValues,
			[name]: value,
		}));
	};

	// save code dialog state
	const [isSaveCodeDialogOpen, setIsSaveCodeDialogOpen] = useState(false);

	// loading state
	const [isSaving, setIsSaving] = useState(false);

	const openSaveDialog = () => {
		setIsSaveCodeDialogOpen(true);
	};

	const closeSaveDialog = () => {
		setIsSaveCodeDialogOpen(false);
	};

	// handle submit
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!savedCodeId || !values.fileName) return;

		setIsSaving(true);

		await updateSaveCode(savedCodeId, {
			fileName: values.fileName,
			description: values.description || '',
		}).call();

		setIsSaving(false);

		// refetching saved codes
		// await fetchSavedCode({ userId }).call();
		closeSaveDialog();
	};

	return (
		<>
			<div className={classes.cardsContainer}>
				<AddCodeCardButton onClick={() => setChooseLanguageDialogOpen(true)} />

				{savedCodes.map((code) => (
					<SavedCodeCard
						key={code.id}
						savedCode={code}
						openSaveDialog={openSaveDialog}
						setValues={setValues}
						setSavedCodeId={setSavedCodeId}
						managementApp={managementApp}
					/>
				))}
			</div>

			<Dialog
				open={chooseLanguageDialogOpen}
				onClose={() => setChooseLanguageDialogOpen(false)}
			>
				<ChooseLanguage managementApp={managementApp}/>
			</Dialog>

			<Dialog
				open={isSaveCodeDialogOpen}
				onClose={() => setIsSaveCodeDialogOpen(false)}
			>
				<SaveCodeDialog
					values={values}
					title="Edit file details"
					handleChange={handleChange}
					isSaving={isSaving}
					handleSubmit={handleSubmit}
				/>
			</Dialog>
		</>
	);
};

export default AllSavedCodeCards;
