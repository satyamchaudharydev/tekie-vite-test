const userRoles = {
	1: "superAdmin",
	2: "superUser",
	3: "clientAdmin",
	7: "teacher",
	8: "student",
	10: "accountant",
};

const getRole = (roleNumber) => userRoles[roleNumber] || "";

export default getRole