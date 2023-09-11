const getDeviceInfo = () => {
    if (typeof localStorage !== 'undefined') {
        const localData = localStorage.getItem('deviceInfo')
        if(localData !== null && localData !== undefined && JSON.parse(localData)) {
            return JSON.parse(localData)
        }
    }
    return {}
}

export default getDeviceInfo