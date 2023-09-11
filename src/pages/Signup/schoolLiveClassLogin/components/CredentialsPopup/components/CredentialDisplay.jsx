import React from "react";
import classes from "./CredentialDisplay.module.scss";

export default function CredentialDisplay({ text }) {
  return (
    <div className={classes.CredentialDisplayContainer}>
      <div className={classes.credentialTextWrapper}>
        <h3>{text}</h3>
      </div>
    </div>
  );
}
