import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clx from "classnames";

import classes from "./menu.module.scss";
import useOnClickOutside from "../../hooks/useOnClickOutside";
import Portal from "../Portal";

const Menu = ({
	children,
	open,
	onClose,
	anchorEl,
	anchorOrigin = { vertical: "top", horizontal: "left" },
	transformOrigin = { vertical: "top", horizontal: "left" },
	offsetX = 0,
	offsetY = 0,
}) => {
	if (!anchorEl) return null;
	const menuRef = React.useRef(null);

	useOnClickOutside(menuRef, onClose);

	const bounding = anchorEl.getBoundingClientRect();

	// get position styles according to anchor origin and transform origin
	const getPositionStyles = () => {
		const {
			vertical: anchorVertical,
			horizontal: anchorHorizontal,
		} = anchorOrigin;
		const {
			vertical: transformVertical,
			horizontal: transformHorizontal,
		} = transformOrigin;

		const top = bounding.top + offsetY;
		const left = bounding.left + offsetX;

		const styles = {
			top: 0,
			left: 0,
		};

		if (anchorVertical === "top") {
			styles.top = top;
		} else if (anchorVertical === "center") {
			styles.top = top + bounding.height / 2;
		} else if (anchorVertical === "bottom") {
			styles.top = top + bounding.height;
		}

		if (anchorHorizontal === "left") {
			styles.left = left;
		} else if (anchorHorizontal === "center") {
			styles.left = left + bounding.width / 2;
		} else if (anchorHorizontal === "right") {
			styles.left = left + bounding.width;
		}

		if (transformVertical === "top") {
			styles.top -= bounding.height;
		} else if (transformVertical === "center") {
			styles.top -= bounding.height / 2;
		} else if (transformVertical === "bottom") {
			styles.top -= 0;
		}

		if (transformHorizontal === "left") {
			styles.left -= bounding.width;
		} else if (transformHorizontal === "center") {
			styles.left -= bounding.width / 2;
		} else if (transformHorizontal === "right") {
			styles.left -= 0;
		}

		return styles;
	};

	return (
		<>
			{open && (
				<Portal className="menu">
					<AnimatePresence>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							id="menu"
							ref={menuRef}
							className={clx(classes.menu)}
							style={getPositionStyles()}
						>
							{children}
						</motion.div>
					</AnimatePresence>
				</Portal>
			)}
		</>
	);
};



export default Menu;
