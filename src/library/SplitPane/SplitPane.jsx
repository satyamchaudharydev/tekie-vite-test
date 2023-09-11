import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { get } from 'lodash'

const SplitPane = ({
	split,
	sizes,
	onChange,
	showResizer = true,
	children,
	onMouseLeave = () => { }
}) => {
	const currentItem = useRef(null);

	const sliderContainerStyle = {
		display: "flex",
		width: "100%",
		flexDirection: split === "vertical" ? "row" : "column"
	};

	const paneStyle = size => ({
		position: "relative",
		flex: size,
		maxWidth: "100%"
	});

	const resizerStyle = {
		cursor: "col-resize",
		backgroundColor: "#555",
		opacity: 0.5,
		width: "4px"
	};

	const handleMouseDown = useCallback(index => {
		currentItem.current = index;
	}, []);

	const handleMouseUp = useCallback(() => {
		onMouseLeave();
		currentItem.current = null;
	}, []);

	const handleMouseMove = useCallback(
		e => {
			if (currentItem.current !== null) {
				e.preventDefault();
				const deltaX = e.movementX;
				const newSizes = [...sizes];
				newSizes[currentItem.current] += deltaX / 800;
				newSizes[currentItem.current + 1] -= deltaX / 800;

				onChange(newSizes);
			}
		},
		[sizes, onChange]
	);

	const elements = children.map((child, index) => {
		const style = get(child, 'props.style', {})
		return (
			<>
				<React.Fragment key={index}>
					<div style={{ ...paneStyle(sizes[index]), ...style }}>
						{child}
					</div>
					{index < children.length - 1 && (
						<motion.div
							data-type="Resizer"
							onMouseDown={() => handleMouseDown(index)}
							onMouseUp={handleMouseUp}
						/>
					)}
				</React.Fragment>
			</>
		)

	});

	return (
		<>
			{showResizer ? (
				<>
					<div
						style={sliderContainerStyle}
						className="split-pane"
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseUp}
					>
						{elements}
					</div>
				</>
			) : (
				// render children
				<>
					{children}
				</>
			)}
		</>


	);
};

export default SplitPane;
