import React from "react";
import { motion } from "framer-motion";

import { ReactComponent as CloseIcon } from "../../assets/close (2).svg";
import Button from "../Button";
import Divider from "../Divider";
import Stack from "../Stack";
import classes from "./alert.module.scss";
import IconButton from "../IconButton";
import Paragraph from "../Paragraph";
import { IIcon } from "../../constants/icons";

const Alert = ({
	open,
	onClose,
	buttonText,
	buttonIcon,
	onClick,
	timeout = 3000,
	horizontalAlign = "center",
	verticalAlign = "bottom",
	type = "default",
	persisting = false,
	children,
	buttonLoading = false,
}) => {
	React.useEffect(() => {
		if (!persisting) {
			const timer = setTimeout(() => {
				onClose();
			}, timeout);

			return () => clearTimeout(timer);
		}
	}, [persisting, timeout, onClose]);

	if (!open) return null;
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={{ duration: 0.2, ease: "linear" }}
			className={`${classes.alertContainer} }`}
			style={{
				transform: "translateX(-50%)",
			}}
		>
			<Stack
				spacing={10}
				className={`${classes.alert} ${classes[horizontalAlign]} ${classes[verticalAlign]}`}
				direction="row"
				alignItems="center"
			>
				<span>
					<IIcon />
				</span>

				<Paragraph className={classes.alertContent}>{children}</Paragraph>

				{buttonText ? (
					<>
						<Divider vertical />
						<span>
							<Button
								loading={buttonLoading}
								icon={buttonIcon}
								onClick={onClick}
							>
								{buttonText}
							</Button>
						</span>
					</>
				) : null}

				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</Stack>
		</motion.div>
	);
};



export default Alert;
