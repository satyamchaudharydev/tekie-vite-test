import React from "react";
import classNames from "classnames";
import { ReactComponent as Beak } from "./beak.svg";
import { ReactComponent as TiltedBeak } from './tiltedBeak.svg'
import Portal from "../../library/Portal";
import classes from "./tooltip.module.scss";
import Stack from "../Stack";
import Button from "../Button";

const renderBeak = (type) => {
    if (type === 'tiltedBeak') {
        return <TiltedBeak />
    }
    return <Beak />
}

const Tooltip = ({
    children,
    open,
    anchorEl,
    anchorOrigin = {
        vertical: "bottom",
        horizontal: "center",
    },
    transformOrigin = {
        vertical: "top",
        horizontal: "center",
    },
    className,
    offsetX = 0,
    offsetY = 0,
    ctaText,
    ctaOnClick,
    orientation = "left",
    type = "default",
    handleMouseLeave = () => { },
    handleMouseEnter = () => { },
    topCenter = false,
    center,
    tooltipClassName,
    leftCenter,
    beakType,
    fullCenter = false,
    fullLeft = false,
    fullRight = false,
}) => {
    if (!anchorEl) return null;
    const bounding = anchorEl.getBoundingClientRect();
    const tooltipRef = React.useRef(null);
    // get position styles according to anchor origin, transform origin and orientation
    const getPositionStyles = () => {
        if (className) return
        if (center && tooltipRef.current) {
            const tooltipWidth = tooltipRef.current.offsetWidth;
            const tooltipHeight = tooltipRef.current.offsetHeight;
            let top;
            let left;
            if (topCenter) {
                top = bounding.top - tooltipHeight + 16
                left = bounding.left - tooltipWidth / 2
            }
            if (leftCenter) {
                top = bounding.top - tooltipHeight / 2;
                left = bounding.left + 25;
            }
            return {
                top: top,
                left: left,
            };
        }
        if ((fullCenter || fullLeft || fullRight) && tooltipRef.current) {
            const tooltipWidth = tooltipRef.current.offsetWidth - 10;
            const tooltipHeight = tooltipRef.current.offsetHeight + 16;
            let top = bounding.top - tooltipHeight;
            let left = bounding.left - tooltipWidth / 2;
            if (fullRight) {
                top = bounding.top - tooltipHeight;
                left = bounding.left - tooltipWidth + 30;
            }
            if (fullLeft) {
                top = bounding.top - tooltipHeight + 5;
                left = bounding.left + 20;
            }

            return {
                top: top,
                left: left,
            };
        }
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
        <Portal parent={document.querySelector(className)}>
            <div
                ref={tooltipRef}
                className={`${classes.tooltip} ${className} ${tooltipClassName} ${classes[type]} ${open ? classes.open : classes.close}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={getPositionStyles()}
            >
                <Stack spacing={8}>
                    {children}
                    {ctaText && (
                        <Button
                            type="secondary"
                            onClick={ctaOnClick}
                            style={{
                                marginLeft: "auto",
                                padding: "4px 20px",
                                borderRadius: 4,
                            }}
                        >
                            {ctaText}
                        </Button>
                    )}
                </Stack>
                <span
                    className={classNames(classes.beak, {
                        [classes.beakLeft]: orientation === "left",
                        [classes.beakRight]: orientation === "right",
                        [classes.beakBottom]: orientation === "bottom",
                        [classes.beakBottomRight]: orientation === "bottomRight",
                        [classes.beakMiddleLeft]: orientation === "middleLeft",
                    })}
                >
                    {renderBeak(beakType)}
                </span>
            </div>
        </Portal>
    );
};


export default Tooltip;
