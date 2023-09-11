/* eslint-disable no-unreachable */
import { Base64 } from "js-base64";
/**
 * Note: Similar code exists on tekie-tms make sure to update that as well...
 */

/**
 * Encode a string of text as base64
 *
 * @param data The string of text.
 * @returns The base64 encoded string.
 */
function encodeToBase64(data) {
  return Base64.encode(data);
	if (typeof btoa === "function") {
		return window.btoa(data);
	} else if (typeof Buffer === "function") {
		return Buffer.from(data, "utf-8").toString("base64");
	}
	throw new Error("Failed to determine the platform specific encoder");
}

/**
 * Decode a string of base64 as text
 *
 * @param data The string of base64 encoded text
 * @returns The decoded text.
 */
function decodeBase64(data) {
  try {
    return Base64.decode(data);
		if (typeof atob === "function") {
			return window.atob(data);
		} else if (typeof Buffer === "function") {
			return Buffer.from(data, "base64").toString("utf-8");
		}
	} catch (e) {
		console.warn("Failed to determine the platform specific decoder", e);
		return data;
	}
}

/**
 * Checks if string is base64 encoded
 *
 * @param data The string of base64 encoded text
 * @returns boolean, whether string is encoded or not
 */
function isBase64(str) {
	if (str && (str === "" || str.trim() === "")) {
		return false;
	}
	try {
		const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
		const checkIfStrEqual = window.btoa(window.atob(str)) === str;
		if (base64Regex.test(str) || checkIfStrEqual) {
			return true;
		}
		return false;
	} catch (err) {
		return false;
	}
}

export { encodeToBase64, decodeBase64, isBase64 };
