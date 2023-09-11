import { get } from 'immutable'
import momentTZ from 'moment-timezone'

const getTimezones = () => {
    const timezoneNames = []
    momentTZ.tz.names().forEach(zone => {
        timezoneNames.push({
            label: zone,
            value: zone
        })
    })

    return timezoneNames
}

export default getTimezones
