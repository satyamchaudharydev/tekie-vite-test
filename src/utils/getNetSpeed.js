import axios from "axios";
import { get } from "lodash";

const downloadFile = (url, size, startTime) => {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            const endTime = new Date().getTime()
            const time = (endTime - startTime) / 1000
            const speed = (size / time) / 1000000
            // localStorage.setItem("netSpeedInMbps", Number(speed).toFixed(2))
        }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous
    xmlHttp.send(null);
}
    
const getNetSpeed = async () => {
    const netSpeed = localStorage.getItem("netSpeedInMbps")
    if (netSpeed) return true;
    const startTime = new Date().getTime()
    var cacheBuster = "?nnn=" + startTime;
    const baseUrl = 'https://speed.cloudflare.com/__down?measId=1616337745959848&bytes=20000000' + cacheBuster;
    const fileSizeInBytes = 20000000;
    const res = await axios.get(baseUrl)
    if (res && res.status === 200) {
        const endTime = new Date()
        const duration = (endTime - startTime) / 1000;
        const bitsLoaded = fileSizeInBytes * 8;
        const speedBps = (bitsLoaded / duration).toFixed(2);
        const speedKbps = (speedBps / 1024).toFixed(2);
        let speedMbps = (speedKbps / 1024).toFixed(2);
        if (typeof speedMbps !== 'number') speedMbps = Number(speedMbps)
        localStorage.setItem("netSpeedInMbps", speedMbps)
    }
}

export default getNetSpeed