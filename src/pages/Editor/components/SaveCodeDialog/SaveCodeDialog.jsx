import React, { useEffect, useState } from "react";
import { get } from "lodash";

import Input from "../../../../library/Input";
import Stack from "../../../../library/Stack";
import UpdatedButton from "../../../../components/Buttons/UpdatedButton";

import classes from "./saveCodeDialog.module.scss";
import Heading from "../../../../library/Heading";

const SaveCodeDialog = ({
	title = "Save your code",
	values,
	handleChange,
	handleSubmit,
	isSaving,
	managementApp=false
}) => {
	// keep track of error
	const [error, setError] = useState("");

	useEffect(() => {
		if (!get(values, "fileName") || !get(values, "fileName").trim()) {
			setError("File name is required");
		} else {
			setError("");
		}
	}, [values.fileName]);

	return (
		<div className={classes.root}>
			<Stack spacing={12}>
				<Heading className={classes.title}>{title}</Heading>

				<form onSubmit={handleSubmit}>
					<Stack spacing={10}>
						<Input
							name="fileName"
							label="Name"
							placeholder="Give your file a great name"
							value={values.fileName}
							onChange={handleChange}
							required
							error={error}
						/>

						<Input
							textarea
							rows={5}
							value={values.description}
							onChange={handleChange}
							name="description"
							label="Description"
							placeholder="Write about your code, why did you make it?"
						/>

						<UpdatedButton
							text="Save"
							type={managementApp ? "quaternary" : "submit"}
							isDisabled={Boolean(error)}
							isLoading={isSaving}
						/>
					</Stack>
				</form>
			</Stack>
		</div>
	);
};

export default SaveCodeDialog;
