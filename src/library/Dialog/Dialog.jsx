import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import Portal from "../Portal";
import Backdrop from "../Backdrop";
import Close from "../../assets/Close";

import classes from "./dialog.module.scss";
import useOnClickOutside from "../../hooks/useOnClickOutside";

const Dialog = ({ open, onClose, locked, children }) => {
	// set up active state
	const [active, setActive] = React.useState(false);
	// Make a reference to the backdrop
	const backdrop = React.useRef(null);
	const dialog = React.useRef(null);

	// on mount
	React.useEffect(() => {
		// get dom element from backdrop
		const { current } = backdrop;
		// when transition ends set active state to match open prop
		const transitionEnd = () => setActive(open);
		// when esc key press close modal unless locked
		const keyHandler = (e) =>
			!locked && [27].indexOf(e.which) >= 0 && onClose();
		// when clicking the backdrop close modal unless locked
		const clickHandler = (e) => {
			return !locked && e.target === current && onClose();
		};

		// if the backdrop exists set up listeners
		if (current) {
			current.addEventListener("transitionend", transitionEnd);
			current.addEventListener("click", clickHandler);
			window.addEventListener("keyup", keyHandler);
		}

		// if open props is true add inert to #root
		// and set active state to true
		if (open) {
			setActive(open);
			document.querySelector("#root").setAttribute("inert", "true");
		}

		// on unmount remove listeners
		return () => {
			if (current) {
				current.removeEventListener("transitionend", transitionEnd);
				current.removeEventListener("click", clickHandler);
			}

			document.querySelector("#root").removeAttribute("inert");
			window.removeEventListener("keyup", keyHandler);
		};
	}, [open, locked, onClose]);

	useOnClickOutside(dialog, onClose);

	return (
		<React.Fragment>
			{open && active && (
				<Portal className="modal-portal">
					<Backdrop
						active={active}
						ref={backdrop}
						className={active && open && "active"}
					>
						<AnimatePresence>
							<motion.div
								className={`${classes.dialog} modal-content`}
								ref={dialog}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.05, ease: "linear" }}
								onClick={(e) => e.stopPropagation()}
							>
								{children}

								<button
									className={classes.closeIconButton}
									onClick={onClose}
									aria-label="close"
								>
									<Close fill="#00ADE6" height="100%" width="100%" />
								</button>
							</motion.div>
						</AnimatePresence>
					</Backdrop>
				</Portal>
			)}
		</React.Fragment>
	);
};



export default React.memo(Dialog);
