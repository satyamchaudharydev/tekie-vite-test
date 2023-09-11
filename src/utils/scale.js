// Horizontal Scale Factor
function hsf($width, $factor) {
    const value =  ($width / 1920) * 100;
    return `${value}vw`;
}

// Horizontal Scale
function hs($width) {
    return hsf($width, 1920)
}

export const hsFor1280 = ($width) => {
    const value =  ($width / 1280) * 100;
    return `${value}vw`;
}

export default hs;
