import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";

import AutoSave from "./AutoSave";
import LanguageIcon from "./LanguageIcon";
import { ReactComponent as GarageIcon } from "../../../assets/codeGarage/garage.svg";
import { ReactComponent as SaveIcon } from "../../../assets/icons/save.svg";
import { ReactComponent as LockIcon } from "../../../assets/icons/lock.svg";
import Toggle from "./Toggle";
import Button from "../../../library/Button/";
import { Link } from "react-router-dom";
import { CODE_GARAGE, TEACHER_CODE_GARAGE } from "../../../constants/routes/routesPaths";
import Tooltip from "../../../library/Tooltip";
import {default as AnthorToolTip} from "../../../components/Tooltip/Tooltip";

import styles from "../styles.module.scss";
import Stack from "../../../library/Stack";
import PublishAndCTA from "./PublishAndCTA";
import Paragraph from "../../../library/Paragraph";
import calculateTimeElapsed from "../../../utils/timeElapsed";
import { CopyOutlineIcon, InformationCircle } from "../../../constants/icons";
import hs from "../../../utils/scale";
import { get } from "lodash";
import FETCH_COURSE_DETAIL from "../../../queries/componentQueries/FETCH_COURSE_DETAIL";
import duck from "../../../duck";
import gql from "graphql-tag";
import { ExternalLinkSvg } from "../../TeacherApp/components/svg";
import { checkIfEmbedEnabled } from "../../../utils/teacherApp/checkForEmbed";

function EditorHeader({
	title,
	savedCodeId,
	isSave,
	showSave,
	mode,
	toggleOutput,
	type,
	toggleState,
	isSaveButtonDisabled,
	showSaveModal,
	showSaveButton,
	lastSavedAt,
	savedCodeStatus,
	openPublishDialog,
	openEditSavedCodeDialog,
	hideEditorHeaderActions,
	isCodeGarageButtonTooltipOpen,
	closeCodeGarageButtonTooltip,
	fromReportPage = false,
	codeEditorCode,
	courseId,
	fromCodeShowCasePage = false,
	managementApp=false,
}) {
	let fileName;
	if (type) {
		if (mode === "python") {
			fileName = "Python Editor";
		} else if (mode === "blockly") {
			fileName = "Blockly Editor";
		}
		else if(mode === "web" || mode === "markup"){
			fileName = "Web Editor";
		}else {
			fileName = "Java Editor"
		}
	} else {
		fileName = title;
	}

	if(checkIfEmbedEnabled()) hideEditorHeaderActions = true;
	// saved ticker tooltip anchor element
	const [anchorEl, setAnchorEl] = useState(null);
	const isTooltipOpen = Boolean(anchorEl);

	// code garage button ref
	const codeGarageButtonRef = useRef(null);

	const instructionButtonRef = useRef(null);

	const [showInstructionToolTip,setShowInstructionToolTip] = useState(true)

	const [editorLink,setEditorLink] = useState('')

	const [timeElapsed, setTimeElapsed] = useState(
		calculateTimeElapsed(lastSavedAt)
	);

	const handleMouseOver = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMouseOut = () => {
		setAnchorEl(null);
	};

	const isSavingAndEditingDisabled =
		hideEditorHeaderActions || savedCodeStatus || isSaveButtonDisabled;

	const fileNameClickHandler = () => {
		if (isSavingAndEditingDisabled) {
			return;
		}

		openEditSavedCodeDialog();
	};

	// increment lastSavedAt every second
	useEffect(() => {
		let interval = null;

		interval = setInterval(() => {
			if (lastSavedAt) {
				// parse lastSavedAt to get milliseconds
				const lastSavedAtInMs = Date.parse(lastSavedAt);

				// increment lastSavedAt by 1 second
				const newLastSavedAt = new Date(lastSavedAtInMs + 1000);

				// calculate time elapsed
				const timeElapsed = calculateTimeElapsed(newLastSavedAt);

				// set timeElapsed
				setTimeElapsed(timeElapsed);
			}
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [lastSavedAt]);

	const onCopyCodeButtonClick = async() => {
		if (navigator.clipboard) {
		  await navigator.clipboard.writeText(codeEditorCode);
		} else {
		  const textarea = document.createElement('textarea');
		  textarea.value = codeEditorCode;
		  document.body.appendChild(textarea);
		  textarea.select();
		  document.execCommand('copy');
		  textarea.remove();
		}
	}

	useEffect(async () => {
		if (!courseId) return 
		const res = await duck.query({
			query: gql`${FETCH_COURSE_DETAIL(courseId)}`,
			variables: {
			  CDNCaching: true,
			},
		  })
		setEditorLink(get(res,'course.javaEditorUrl'))
	},[])

	const openExternalLink = () => {
		window.open(editorLink,'_blank')
	}

	return (
		<>
			<Stack
				direction="row"
				spacing={10}
				className={styles.title}
				justifyContent={mode === "blockly" ? "flex-start" : "space-between"}
				id="__editor_title"
			>
				<div className={styles.breadcrumbs}>
					{!hideEditorHeaderActions && (
						<>
							<Link style={{ textDecoration: "none" }} to={managementApp ? TEACHER_CODE_GARAGE : CODE_GARAGE}>
								<Button
									pill
									size="small"
									inverted
									icon={<GarageIcon />}
									ref={codeGarageButtonRef}
								>
									Code Garage
								</Button>
							</Link>
							<span>/</span>
						</>
					)}

					<div className={styles.title__brief}>
						<LanguageIcon mode={mode}></LanguageIcon>
						<p
							className={classNames(styles.fileName, {
								[styles.fileName__locked]: isSavingAndEditingDisabled,
							})}
							onClick={fileNameClickHandler}
						>
							{fileName}
						</p>
						{savedCodeStatus && <LockIcon />}
						{ showSave && (
							<AutoSave isSave={isSave} showSave={showSave} />
						)}
					</div>
				</div>

				{!hideEditorHeaderActions && showSaveButton && (
					<Button
						disabled={isSaveButtonDisabled}
						icon={<SaveIcon />}
						onClick={showSaveModal}
						style={{ marginLeft: "auto" }}
						type={managementApp ? "quaternary" : ""}
					>
						Save
					</Button>
				)}

				{lastSavedAt && (
					<Paragraph
						onMouseOver={handleMouseOver}
						onMouseOut={handleMouseOut}
						className={styles.lastSavedAt}
						variant="body2"
						color="#dcdcdc"
					>
						Saved {timeElapsed}
					</Paragraph>
				)}

				<Tooltip
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "left",
					}}
					transformOrigin={{
						vertical: "bottom",
						horizontal: "left",
					}}
					open={isTooltipOpen}
					anchorEl={anchorEl}
					offsetY={20}
					offsetX={-40}
				>
					Code is autosaved whenever you
					<br /> make any changes.
				</Tooltip>

				{(mode === "web" || mode === "markup") && type &&  !fromReportPage && !fromCodeShowCasePage && (
					<Toggle
						label="compare output"
						toggleState={toggleState}
						handleToggle={toggleOutput}
					/>
				)}

				{mode === "java" && type && !fromReportPage && !fromCodeShowCasePage && (
					<AnthorToolTip
					type="tertiary"
					showFromProps={true}
                	show={showInstructionToolTip}
					newFlow={true}
					
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "right",
					}}
					className={`.${styles.javaEditorNavBarText}`}
					direction={'bottom'}
					content={
						<>
							<div className={styles.toolTipText}>
								<p style={{marginTop:hs(10)}}>Code your answer in BlueJ editor or {editorLink ? '': 'any'}</p>
								<p style={{marginBottom:hs(12)}}>{editorLink ? <span className={styles.editorLink} onClick={openExternalLink}><span>Online Java Editor</span> <ExternalLinkSvg width={hs(17)} height={hs(17)} color={'#00ADE6'} /> </span> : ' other editor of your choice'}. {editorLink ? <span> Copy and paste<br/> your answer here to submit.</span>: <span>Copy and <br/> paste your answer here to submit.</span> }</p>
								<div onClick={() => setShowInstructionToolTip(!showInstructionToolTip)}>
									<Button
										type='secondary'
									>
										<p style={{margin:0,color:"#00ADE6",fontWeight: 700,fontSize:hs(16)}} >Ok, Got it! </p>
									</Button>
								</div>
							</div>
						</>
						}
					>
					<div className={styles.javaEditorNavBarText} onClick={() =>{
							setShowInstructionToolTip(true)
						}}>
						How to submit your code <span style={{position: 'relative', marginLeft: hs(5),alignSelf:'center',color:'#fff'}} ref={instructionButtonRef} 
						> 
						<InformationCircle height={hs(21)} width={hs(21)}/></span>
					</div>					
				</AnthorToolTip>
					
				)}
				{mode === 'java' && type && fromReportPage && (
					<div className={styles.javaEditorNavBarCopyButton} onClick={onCopyCodeButtonClick}>
						<CopyOutlineIcon height="16" width="16" fill={'#FFFFFF'}/>
						<p style={{marginLeft:hs(4)}}>Copy Code</p>
					</div>
				)}
				
				

				{mode === "blockly" && Boolean(savedCodeId) && (
					<div style={{ marginLeft: "auto" }}>
						<PublishAndCTA
							openPublishDialog={openPublishDialog}
							savedCodeId={savedCodeId}
							savedCodeStatus={savedCodeStatus}
							openEditSavedCodeDialog={openEditSavedCodeDialog}
						/>
					</div>
				)}
			</Stack>

			<Tooltip
				open={isCodeGarageButtonTooltipOpen}
				anchorEl={codeGarageButtonRef.current}
				ctaText="Got it!"
				ctaOnClick={closeCodeGarageButtonTooltip}
				orientation="right"
				anchorOrigin={
					{
						vertical: "bottom",
						horizontal: "right",
					}
				}
				transformOrigin={
					{
						vertical: "bottom",
						horizontal: "center",
					}
				}
				offsetY={20}
			>
				Check out all your saved
				<br /> codes by clicking here.
			</Tooltip>
		</>
	);
}

export default React.memo(EditorHeader);