import React from "react";
import classes from  "./TextIcon.module.scss";
export default function TextIcon({ text }) {
  return <div className={classes.textIcon}>{text}</div>;
}
