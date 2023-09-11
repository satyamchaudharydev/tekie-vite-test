import { format } from 'date-fns'

const formatDate = date => ({
    date: format(date, 'dd-MM-yyyy'),
    time: format(date, 'HH:mm:ss')
})

export default formatDate
