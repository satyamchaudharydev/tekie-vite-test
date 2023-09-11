import React from "react";
import { Input, PasswordInput } from "../../../../../photon";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import classes from "./CustomInput.module.scss";

export default function CustomInput({
  setFn,
  label,
  value,
  noMarginTop,
  secret,
  error,
  ...props
}) {
  return (
    <div
      className={classes.CustomInputContainer}
      style={noMarginTop && { marginTop: "0px" }}
    >
      <p
        className={classes.customInputLabel}
        style={noMarginTop && { marginTop: "0px" }}
      >
        {label}
      </p>
      {secret ? (
        <PasswordInput
          {...props}
          eyeIconClassName={classes.eyeIcon}
          className={`${classes["photonInputPass"]} ${error && 'error'}`}
          labelClassName={classes.customInputLabel}
          value={value}
          onChangeText={(e) => {
            setFn(e);
          }}
        />
      ) : (
        <Input
          value={value}
          noLabel
          className={`${classes["photonInput"]} ${error && 'error'}`}
          {...props}
          onChangeText={(e) => {
            setFn(e);
          }}
        />
      )}
      {<ErrorMessage message={error} withCrossIcon={true}/>}
    </div>
  );
}
