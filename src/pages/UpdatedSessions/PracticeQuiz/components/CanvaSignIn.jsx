/**
 * React Environment with Functional Based components
 * Initial Requirements: Api-Sauce to make API Request
 *
 * @param
 * firstName: First Name of the user
 * lastName: Last Name of the user
 * username: Unique username of the user (eg phoneNumber@uolo.com)
 * teamId: Unique School Id to identify the team(School) of the user (Demo teamId: "12345678912")
 * role: This is a enum which can only take "staff" or "student"
 */
import React, { useState } from "react";

const CanvaSSOComponent = ({
	canvaSSORef,
	email
}) => {
	const [acsUrl, setAcsUrl] = useState("");
	const [samlResponse, setSamlResponse] = useState("");
	const [relayState, setRelayState] = useState("");

	const signInUserToCanva = async (event) => {
		event.preventDefault()
		await fetch(`${import.meta.env.REACT_APP_SSO_API_BASE_URL}signin`, {
			method: "POST",
			headers: {
				Authorization: import.meta.env.REACT_APP_SSO_ACCESS_TOKEN,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				emailId: email.substring(0, email.indexOf("@")) + "@uolo.in",
			})
		})
			.then(response => response.json())
			.then(data => {
				setAcsUrl(data.AcsUrl);
				setSamlResponse(data.SAMLResponse);
				setRelayState(data.relayState);
				event.target.submit();
			})
			.catch(error => { console.log(`Error in adding user to canva: ${error}`) });
	}

	return (
		<form
			method="post"
			name="hiddenform"
			target="_blank"
			action={acsUrl}
			onSubmit={(event) => signInUserToCanva(event)}
		>
			<input type="hidden" name="SAMLResponse" value={samlResponse} />
			<input type="hidden" name="RelayState" value={relayState} />
			<input ref={canvaSSORef} hidden={true} type="submit" value="Submit" />
		</form>
	);
};

export default CanvaSSOComponent;
