import cuid from 'cuid';
import { encodeToBase64 } from './base64Utility';

const generateSystemId = () => {
    let uidObj = {}
    if (typeof window !== "undefined") {
        const navigatorInfo = window.navigator;
        const screen_info = window.screen;
        uidObj.userAgent = navigatorInfo.userAgent;
        uidObj.screenHeight = screen_info.height;
        uidObj.screenWidth = screen_info.width;
        uidObj.pixelDepth = screen_info.pixelDepth;
        uidObj.id = cuid();
    }
    uidObj = JSON.stringify(uidObj)
    const encodedUid = encodeToBase64(uidObj)
    localStorage.setItem("systemId", encodedUid)
    return encodedUid
}

const getSystemId = () => {
    if (localStorage.getItem('systemId')) {
        return localStorage.getItem("systemId")
    }
    return generateSystemId()
}

export default getSystemId;
