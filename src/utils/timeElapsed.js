// calculate elapsed time in minutes, hours, days, weeks, months, years

const seconds = 1000;
const minutes = seconds * 60;
const hours = minutes * 60;
const days = hours * 24;
const weeks = days * 7;
const months = days * 30;
const years = days * 365;

/**
 * @param {string} date - date in string format
 * @returns {string} - time elapsed in minutes, hours, days, weeks, months, years
 */

const calculateTimeElapsed = (date) => {
	if (!date) return;

	const timeElapsed = new Date() - new Date(date);

	if (timeElapsed < minutes) {
		return `few secs ago`;
	} else if (timeElapsed < hours) {
		const secsElapsed = Math.round(timeElapsed / minutes);
		return secsElapsed + ` min${secsElapsed > 1 ? "s" : ""} ago`;
	} else if (timeElapsed < days) {
		const minsElapsed = Math.round(timeElapsed / hours);
		return minsElapsed + ` hour${minsElapsed > 1 ? "s" : ""} ago`;
	} else if (timeElapsed < weeks) {
		const daysElapsed = Math.round(timeElapsed / days);
		return daysElapsed + ` day${daysElapsed > 1 ? "s" : ""} ago`;
	} else if (timeElapsed < months) {
		const weeksElapsed = Math.round(timeElapsed / weeks);
		return weeksElapsed + ` week${weeksElapsed > 1 ? "s" : ""} ago`;
	} else if (timeElapsed < years) {
		const monthsElapsed = Math.round(timeElapsed / months);
		return monthsElapsed + ` month${monthsElapsed > 1 ? "s" : ""} ago`;
	} else {
		const yearsElapsed = Math.round(timeElapsed / years);
		return yearsElapsed + ` year${yearsElapsed > 1 ? "s" : ""} ago`;
	}
};

export default calculateTimeElapsed;
