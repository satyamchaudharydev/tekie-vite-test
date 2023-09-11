import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { ReactComponent as MoreIcon } from "../../../assets/codeGarage/moreIcon.svg";
import { ReactComponent as ViewCodeIcon } from "../../../assets/codeGarage/viewCodeIcon.svg";
import { ReactComponent as EditCodeIcon } from "../../../assets/codeGarage/editCodeIcon.svg";
import { ReactComponent as DeleteIcon } from "../../../assets/codeGarage/deleteCodeIcon.svg";
import deleteSaveCode from "../../../queries/saveCode/deleteSaveCode";
import IconButton from "../../../library/IconButton";
import Menu from "../../../library/Menu";
import MenuItem from "../../../library/Menu/MenuItem";
import {
	CODE_GARAGE,
	CODE_PLAYGROUND,
} from "../../../constants/routes/routesPaths";
import Tooltip from "../../../library/Tooltip";
import { getToasterBasedOnType } from "../../../components/Toaster";
import { SAVED_CODE_STATUS } from "../../../constants/savedCode/savedCodeStatus";
import DeleteSavedCodeConfirmationDialog from "../DeleteSavedCodeConfirmationDialog";

export const SavedCodeCTA = ({
	id,
	className,
	showViewCodeItem = true,
	openEditSavedCodeDialog,
	savedCodeStatus,
	language,
}) => {
	// menu anchor element
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const moreMenuOpen = Boolean(menuAnchorEl);

	// delete saved code confirmation dialog state
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	// delete saved code loading state
	const [deleteLoading, setDeleteLoading] = useState(false);

	const history = useHistory();
	const wrapperRef = useRef(null);

	const toggleMenu = (e) => {
		setMenuAnchorEl(e.currentTarget);
	};

	const onClose = () => {
		setMenuAnchorEl(null);
	};

	const viewCode = () => {
		history.push(`${CODE_PLAYGROUND}/${id}?language=${language}`);
	};

	const deleteHandler = async (e) => {
		e.stopPropagation();
		setDeleteLoading(true);
		await deleteSaveCode(id).call();
		getToasterBasedOnType({
			type: "success",
			message: "Deleted!",
		});
		history.replace(CODE_GARAGE);
		setDeleteLoading(false);
		setOpenDeleteDialog(false);
	};

	return (
		<>
			<div className={className} ref={wrapperRef}>
				<IconButton onClick={toggleMenu}>
					<MoreIcon />
				</IconButton>

				<Menu
					anchorEl={menuAnchorEl}
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "left",
					}}
					transformOrigin={{
						horizontal: "left",
					}}
					offsetX={-50}
					offsetY={10}
					open={moreMenuOpen}
					onClose={onClose}
				>
					{showViewCodeItem ? (
						<MenuItem icon={<ViewCodeIcon />} onClick={viewCode}>
							View Code
						</MenuItem>
					) : null}

					{!savedCodeStatus && (
						<MenuItem
							icon={<EditCodeIcon />}
							onClick={openEditSavedCodeDialog}
							disabled={!!savedCodeStatus}
						>
							Edit Details
						</MenuItem>
					)}

					{savedCodeStatus !== SAVED_CODE_STATUS.PUBLISHED && (
						<MenuItem
							danger
							icon={<DeleteIcon />}
							onClick={() => setOpenDeleteDialog(true)}
							disabled={savedCodeStatus === SAVED_CODE_STATUS.PUBLISHED}
						>
							Delete Code
						</MenuItem>
					)}
				</Menu>
			</div>

			<DeleteSavedCodeConfirmationDialog
				open={openDeleteDialog}
				handleClose={() => setOpenDeleteDialog(false)}
				handleDelete={deleteHandler}
				loading={deleteLoading}
			/>
		</>
	);
};
