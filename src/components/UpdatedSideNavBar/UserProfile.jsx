import { get } from "lodash";
import React from "react";
import { ProfilePicture } from "../NavBar/ProfileIcon";
import styles from "./MainSideBar.module.scss";

function UserProfile({ users }) {
	const buddyUsers = get(users, "buddyDetails", [])
		? get(users, "buddyDetails", [])
		: [];
	const isbuddyLogin = buddyUsers.length > 0;
	const studentName = get(users, "name", "");
	const primaryStudentProfile = get(users, "studentProfile", {});
	const primarUserStudentProfile = get(users, "studentProfile", {});
	const profileTitle = isbuddyLogin
		? `Your Team of ${buddyUsers.length}`
		: studentName;
	const grade = get(primaryStudentProfile, "grade");
	const userProfiles = buddyUsers.length > 0 ? buddyUsers : [users];
	const slicedUserProfiles = userProfiles.slice(0, 2);

	return (
		<div className={styles.profileContainer}>
			<div className={styles.profilePictureContainer}>
				{slicedUserProfiles.map(profile => (
					<ProfilePicture
						defalutProfilePicture={get(
							profile,
							"studentProfile.profileAvatarCode",
							""
						)}
					></ProfilePicture>
				))}
				{userProfiles.length > 2 && (
					<div className={styles.additionalProfile}>
						+{userProfiles.length - 2}
					</div>
				)}
			</div>
			<div>
				<div className={styles.userNameAndRollno}>{profileTitle}</div>
				<div className={styles.gradeText}>{grade}</div>
			</div>
		</div>
	);
}

export default UserProfile;
