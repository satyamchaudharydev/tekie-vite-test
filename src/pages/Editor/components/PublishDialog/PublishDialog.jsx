import React, { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { get } from "lodash";

import Dialog from "../../../../library/Dialog";
import Stack from "../../../../library/Stack";
import Divider from "../../../../library/Divider";
import Heading from "../../../../library/Heading";
import fetchUserApprovedCodeTags from "../../../../queries/approvedCodes/fetchUserApprovedCodeTags";
import Input from "../../../../library/Input";
import UpdatedButton from "../../../../components/Buttons/UpdatedButton";
import Autocomplete from "../../../../library/Autocomplete/Autocomplete";
import SyntaxHighlighter from "../../../../utils/react-syntax-highlighter/dist/esm";
import { dracula } from "../../../../utils/react-syntax-highlighter/dist/esm/styles/hljs";
import Tag from "../../../../library/Tag/Tag";
import { ProfilePicture } from "../../../../components/NavBar/ProfileIcon";
import getMe from "../../../../utils/getMe";
import Paragraph from "../../../../library/Paragraph";
import BlocklyPreview from "../BlocklyPreview";
import hs from "../../../../utils/scale";
import { IIcon } from "../../../../constants/icons";

import classes from "./publishDialog.module.scss";
import { truncateStr } from "../../../../utils/text/turncate";

const syntaxHighlighterStyles = {
	height: "100%",
	flexGrow: 1,
	borderRadius: "16px",
	padding: "26px",
	overflow: "hidden",
	userSelect: "none",
	fontSize: "11px",
	maxHeight: hs(250)
};

const PublishDialog = ({
	savedCode,
	handleSavedCodeChange,
	tagsChangeHandler,
	tags,
	open,
	onClose,
	handleSubmit,
	isLoading,
	mode,
}) => {
	const [errors, setErrors] = useState({
		fileName: "",
		description: "",
	});

	const me = getMe();

	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	const approvedCodeTags = useSelector((state) => {
		const tags = state.data.getIn(["userApprovedCodeTags", "data"]);
		if (tags) {
			return tags.map((tag) => {
				return {
					id: tag.get("id"),
					value: tag.get("title"),
					label: tag.get("title"),
				};
			});
		}
	});

	useEffect(() => {
		fetchUserApprovedCodeTags().call();
	}, []);

	useEffect(() => {
		if (!get(savedCode, "fileName") || !get(savedCode, "fileName").trim()) {
			setErrors((prev) => {
				return {
					...prev,
					fileName: "File name is required",
				};
			});
		} else {
			setErrors((prev) => {
				return {
					...prev,
					fileName: "",
				};
			});
		}

		if (!get(savedCode, "description") || !get(savedCode, "description").trim()) {
			setErrors((prev) => {
				return {
					...prev,
					description: "Description is required",
				};
			});
		} else {
			setErrors((prev) => {
				return {
					...prev,
					description: "",
				};
			});
		}
	}, [savedCode.fileName, savedCode.description]);

	return (
		<Dialog
			open={open}
			onClose={() => {
				setIsPreviewOpen(false);
				onClose()
			}}>
			{isPreviewOpen ? (
				<Stack spacing={10} className={classes.previewContainer}>
					<Heading size="sm">Preview your code</Heading>
					<Divider />

					<Stack direction="row" spacing={8}>
						<ProfilePicture height={44} width={44} />
						<Stack spacing={4}>
							<Paragraph variant="title">{savedCode.fileName}</Paragraph>
							<Paragraph variant="subtitle">{me.name}</Paragraph>
						</Stack>
					</Stack>

					<Paragraph>{truncateStr(get(savedCode, 'description', ''), 100)}</Paragraph>

					{Boolean(get(savedCode, 'tags.length')) && (
						<Stack direction="row" spacing={2}>
							{savedCode.tags.map((tag) => (
								<Tag>{tag.value}</Tag>
							))}
						</Stack>
					)}

					{mode === "blockly" ? (
						<div style={{ height: hs(300), width: "100%" }}>
							<BlocklyPreview code={savedCode.code} />
						</div>
					) : (
						<SyntaxHighlighter
							language="javascript"
							style={dracula}
							customStyle={syntaxHighlighterStyles}
						>
							{savedCode.code}
						</SyntaxHighlighter>
					)}

					<NoEditMessage />

					<Stack direction="row" justifyContent="flex-end">
						<UpdatedButton
							text="Go Back"
							type="secondary"
							onBtnClick={() => setIsPreviewOpen(false)}
						/>
						<UpdatedButton
							text="Publish Code"
							type="submit"
							isDisabled={
								Boolean(errors.fileName) || Boolean(errors.description)
							}
							isLoading={isLoading}
							onBtnClick={handleSubmit}
						/>
					</Stack>
				</Stack>
			) : (
				<Stack
					spacing={12}
					style={{ maxWidth: "min-content", padding: hs(24) }}
				>
					<Heading size="sm">Publish to Community</Heading>

					<Stack spacing={10}>
						<Input
							label="Name"
							placeholder="Enter a name for your project"
							onChange={handleSavedCodeChange}
							name="fileName"
							value={savedCode.fileName}
							error={errors.fileName}
							required
						/>
						<Input
							label="Description"
							placeholder="Enter a description for your project"
							onChange={handleSavedCodeChange}
							name="description"
							value={savedCode.description}
							error={errors.description}
							required
							textarea
							rows={4}
						/>
						<Autocomplete
							hideSelectedOptions
							label="Tag"
							isMulti
							selectedOptions={tags}
							maxLimit={5}
							placeholder="Select tags (max 5)"
							onChange={tagsChangeHandler}
							options={approvedCodeTags}
						/>
					</Stack>

					<UpdatedButton
						type="submit"
						text="Preview Code"
						onBtnClick={() => setIsPreviewOpen(true)}
						isDisabled={Boolean(errors.fileName) || Boolean(errors.description)}
					/>
				</Stack>
			)}
		</Dialog>
	);
};

const NoEditMessage = () => {
	return (
		<Stack
			direction="row"
			spacing={4}
			className={classes.noEditMessageContainer}
		>
			<IIcon fill="#403F3F" height={14} width={14} />
			<Paragraph style={{ fontWeight: 600 }}>
				<strong>Note: </strong> You won&apos;t be able to edit the file after
				it&apos;s published.
			</Paragraph>
		</Stack>
	);
};

export default PublishDialog;
