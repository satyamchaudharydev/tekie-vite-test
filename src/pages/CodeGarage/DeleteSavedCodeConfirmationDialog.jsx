import React from "react";
import UpdatedButton from "../../components/Buttons/UpdatedButton";

import Dialog from "../../library/Dialog";
import Heading from "../../library/Heading";
import Paragraph from "../../library/Paragraph";
import Stack from "../../library/Stack";

import classes from './codeGarage.module.scss';

const DeleteSavedCodeConfirmationDialog = ({
	open,
	handleClose,
	handleDelete,
	loading,
	fileName,
}) => {
	return (
		<Dialog open={open} onClose={handleClose}>
			<Stack alignItems="center" className={classes.deleteConformationDialog} spacing={6}>
				<Heading>Delete this file?</Heading>
				<Paragraph variant="title" style={{ fontWeight: 400 }} align="center">
					The file will be permanently deleted and cannot be restored. Are you
					sure you want to delete it?
				</Paragraph>

				<Stack direction="row" style={{ marginTop: 6 }} spacing={8}>
					<UpdatedButton
						onBtnClick={handleClose}
						text="No, keep it."
						type="tertiary"
					/>
					<UpdatedButton
						onBtnClick={handleDelete}
						type="danger"
						text="Yes, Delete."
						isLoading={loading}
					/>
				</Stack>
			</Stack>
		</Dialog>
	);
};

export default DeleteSavedCodeConfirmationDialog;
