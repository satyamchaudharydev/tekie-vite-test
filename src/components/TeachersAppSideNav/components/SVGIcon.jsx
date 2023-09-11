import * as React from 'react'

const getViewBox = name => {
    switch (name) {
        case 'session':
            return '0 0 36 38'
        default:
            return '0 0 32 32'
    }
};

const getPath = (name) => {
    switch (name) {
        case 'profile':
            return (
                <path id='profile' d="M.668,19.642A.669.669,0,0,1,0,18.973V12.206A3.346,3.346,0,0,1,3.343,8.863H7.436a3.346,3.346,0,0,1,3.343,3.343v6.768a.668.668,0,0,1-.668.668ZM3.425,7.526a4.011,4.011,0,1,1,1.964.514A4.023,4.023,0,0,1,3.425,7.526Z" fill="rgb(134 197 255)" />
            )
        case 'session':
            return (
                <path id='session' d="M-11525.591-1872.622a.716.716,0,0,1-.715-.715v-7.239a3.578,3.578,0,0,1,3.574-3.574h4.377a3.579,3.579,0,0,1,3.577,3.574v7.239a.716.716,0,0,1-.715.715Zm-5.189,0a2.147,2.147,0,0,1-2.145-2.145v-3.945a3.579,3.579,0,0,1,3.574-3.575h1.916a5.016,5.016,0,0,0-.3,1.711v7.239a2.156,2.156,0,0,0,.121.715Zm-.526-13.783a3.218,3.218,0,0,1,3.215-3.216,3.22,3.22,0,0,1,3.216,3.216,3.212,3.212,0,0,1-.379,1.511,3.251,3.251,0,0,1-1.571,1.444,3.235,3.235,0,0,1-1.266.26A3.22,3.22,0,0,1-11531.307-1886.405Zm8.662.825a4.3,4.3,0,0,1-2.2-3.748,4.3,4.3,0,0,1,4.3-4.3,4.3,4.3,0,0,1,4.3,4.3,4.3,4.3,0,0,1-2.2,3.748,4.273,4.273,0,0,1-2.1.55A4.27,4.27,0,0,1-11522.645-1885.58Z" transform="translate(11532.925 1893.627)" fill="rgb(134 197 255)" />
            )
        default:
            return <path />
    }
};

const EditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 1L19 6L6 19H1V14L14 1Z" stroke="#005773" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
const DeleteIcon = ({ color }) => (
    <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M2.92247 3.75286C3.33446 3.71001 3.70318 4.00926 3.74604 4.42125L5.0898 17.3407C5.11211 17.5215 5.19952 17.6881 5.33577 17.8093C5.47307 17.9314 5.65041 17.9988 5.83414 17.9988H16.6665C16.8502 17.9988 17.0275 17.9314 17.1648 17.8093C17.3011 17.6881 17.3885 17.5215 17.4108 17.3407L18.7541 4.42128C18.7969 4.00928 19.1656 3.71002 19.5776 3.75286C19.9896 3.7957 20.2889 4.16441 20.246 4.5764L18.9021 17.5017C18.9018 17.5051 18.9014 17.5084 18.901 17.5118C18.8366 18.0592 18.5735 18.5639 18.1616 18.9302C17.7497 19.2965 17.2177 19.4988 16.6665 19.4988H5.83411C5.28291 19.4988 4.7509 19.2965 4.33901 18.9302C3.92711 18.5639 3.664 18.0592 3.59957 17.5118C3.59927 17.5092 3.59898 17.5066 3.5987 17.504L3.59846 17.5017L2.25408 4.57643C2.21123 4.16444 2.51048 3.79571 2.92247 3.75286Z" fill={color} />
        <path fillRule="evenodd" clipRule="evenodd" d="M0 1.5C0 0.671573 0.671573 0 1.5 0H21C21.8284 0 22.5 0.671573 22.5 1.5V3.75C22.5 4.57843 21.8284 5.25 21 5.25H1.5C0.671573 5.25 0 4.57843 0 3.75V1.5ZM21 1.5H1.5V3.75H21V1.5Z" fill={color} />
        <path fillRule="evenodd" clipRule="evenodd" d="M14.4053 8.46967C14.6982 8.76256 14.6982 9.23744 14.4053 9.53033L9.15533 14.7803C8.86244 15.0732 8.38756 15.0732 8.09467 14.7803C7.80178 14.4874 7.80178 14.0126 8.09467 13.7197L13.3447 8.46967C13.6376 8.17678 14.1124 8.17678 14.4053 8.46967Z" fill={color} />
        <path fillRule="evenodd" clipRule="evenodd" d="M8.09467 8.46967C8.38756 8.17678 8.86244 8.17678 9.15533 8.46967L14.4053 13.7197C14.6982 14.0126 14.6982 14.4874 14.4053 14.7803C14.1124 15.0732 13.6376 15.0732 13.3447 14.7803L8.09467 9.53033C7.80178 9.23744 7.80178 8.76256 8.09467 8.46967Z" fill={color} />
    </svg>

)
const UploadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M11.3333 5.33333L8 2L4.66667 5.33333" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8 2V10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)
const PDFIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M13.5236 2.78143L11.5314 0.753007C11.0613 0.274385 10.4002 0 9.71687 0H3.33173C2.48184 0 1.79057 0.667274 1.79057 1.48765V4.47531H1.54117C0.691277 4.47531 0 5.14258 0 5.96296V11.5185C0 12.3389 0.691277 13.0062 1.54117 13.0062H1.79057V14.5123C1.79057 15.3327 2.48184 16 3.33173 16H12.6683C13.5182 16 14.2094 15.3327 14.2094 14.5123V13.0062H14.4588C15.3087 13.0062 16 12.3389 16 11.5185V5.96296C16 5.14258 15.3087 4.47531 14.4588 4.47531H14.2094V4.44201C14.2094 3.8216 13.9658 3.23169 13.5236 2.78143ZM2.95444 1.48765C2.95444 1.28692 3.12378 1.12346 3.33173 1.12346H9.71687C10.0819 1.12346 10.4356 1.27025 10.6868 1.52597L12.679 3.5544C12.9155 3.79519 13.0456 4.11022 13.0456 4.44201V4.47531H2.95444V1.48765ZM14.8361 11.5185C14.8361 11.7192 14.6668 11.8827 14.4588 11.8827H1.54117C1.33322 11.8827 1.16387 11.7192 1.16387 11.5185V5.96296C1.16387 5.76223 1.33322 5.59876 1.54117 5.59876H14.4588C14.6668 5.59876 14.8361 5.76223 14.8361 5.96296V11.5185ZM13.0456 14.5123C13.0456 14.7131 12.8762 14.8765 12.6683 14.8765H3.33173C3.12378 14.8765 2.95444 14.7131 2.95444 14.5123V13.0062H13.0456V14.5123Z" fill="#4353FF" />
        <path d="M4.34366 6.83191H3.43121C3.31662 6.83191 3.20672 6.87564 3.1258 6.95344C3.04488 7.03123 2.99963 7.13672 3 7.24659L3.00636 10.3866C3.00636 10.6149 3.19942 10.8 3.43756 10.8C3.6757 10.8 3.86876 10.6149 3.86876 10.3866V9.43323C4.04507 9.43237 4.23342 9.43163 4.34366 9.43163C5.10131 9.43163 5.71773 8.84851 5.71773 8.13177C5.71773 7.41503 5.10131 6.83191 4.34366 6.83191ZM4.34366 8.6049C4.23244 8.6049 4.0434 8.60565 3.86641 8.60653C3.86549 8.43055 3.86468 8.24103 3.86468 8.13177C3.86468 8.03827 3.86419 7.84258 3.86367 7.65863H4.34363C4.62098 7.65863 4.8553 7.87529 4.8553 8.13177C4.8553 8.38825 4.62101 8.6049 4.34366 8.6049Z" fill="#4353FF" />
        <path d="M8.01146 6.83191H7.11082C6.99632 6.83191 6.8865 6.87556 6.80561 6.95324C6.72472 7.03093 6.67938 7.13628 6.67961 7.24604C6.67961 7.24607 6.68602 10.2841 6.68605 10.2952C6.68648 10.4048 6.73231 10.5098 6.81349 10.5871C6.89429 10.6639 7.00347 10.707 7.11725 10.707H7.11889C7.14612 10.7069 7.78852 10.7046 8.04535 10.7003C9.0197 10.684 9.72687 9.87194 9.72687 8.76948C9.72684 7.61057 9.03749 6.83191 8.01146 6.83191ZM8.03029 9.87371C7.9186 9.87558 7.72646 9.8771 7.54702 9.8782C7.54581 9.51915 7.54346 8.03176 7.5428 7.65863H8.01146C8.80294 7.65863 8.86443 8.50889 8.86443 8.76951C8.86443 9.31217 8.60652 9.86406 8.03029 9.87371Z" fill="#4353FF" />
        <path d="M12.5688 7.62677C12.8069 7.62677 13 7.4417 13 7.21341C13 6.98513 12.8069 6.80005 12.5688 6.80005H11.2504C11.0122 6.80005 10.8192 6.98513 10.8192 7.21341V10.3318C10.8192 10.5601 11.0122 10.7451 11.2504 10.7451C11.4885 10.7451 11.6816 10.5601 11.6816 10.3318V9.15644H12.4641C12.7022 9.15644 12.8953 8.97136 12.8953 8.74307C12.8953 8.51479 12.7022 8.32971 12.4641 8.32971H11.6816V7.62677H12.5688Z" fill="#4353FF" />
    </svg>

)
const FileIcon = () => (
    <svg width="17" height="19" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.75 1H2.5C2.10218 1 1.72064 1.15804 1.43934 1.43934C1.15804 1.72064 1 2.10218 1 2.5V14.5C1 14.8978 1.15804 15.2794 1.43934 15.5607C1.72064 15.842 2.10218 16 2.5 16H11.5C11.8978 16 12.2794 15.842 12.5607 15.5607C12.842 15.2794 13 14.8978 13 14.5V6.25L7.75 1Z" stroke="#005773" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 1V7H13" stroke="#005773" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

)
const FileOption = () => (
    <svg width="3" height="14" viewBox="0 0 3 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="1.5" cy="12" r="1.5" fill="#005773" />
        <circle cx="1.5" cy="7" r="1.5" fill="#005773" />
        <circle cx="1.5" cy="2" r="1.5" fill="#005773" />
    </svg>
)
const CopyIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 8H10C8.89543 8 8 8.89543 8 10V19C8 20.1046 8.89543 21 10 21H19C20.1046 21 21 20.1046 21 19V10C21 8.89543 20.1046 8 19 8Z" stroke="#005773" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4 14H3C2.46957 14 1.96086 13.7893 1.58579 13.4142C1.21071 13.0391 1 12.5304 1 12V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H12C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V4" stroke="#005773" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

)

const SVGIcon = ({
    name = '',
    style = {},
    viewBox = '',
    width = '100%',
    className = '',
    height = '100%'
}) => (
    <svg
        width={width}
        style={style}
        height={height}
        className={className}
        xmlns='http://www.w3.org/2000/svg'
        viewBox={viewBox || getViewBox(name)}
        xmlnsXlink='http://www.w3.org/1999/xlink'
    >
        {getPath(name)}
    </svg>
);

SVGIcon.EditIcon = EditIcon
SVGIcon.PDFIcon = PDFIcon
SVGIcon.DeleteIcon = DeleteIcon
SVGIcon.FileIcon = FileIcon
SVGIcon.FileOption = FileOption
SVGIcon.UploadIcon = UploadIcon
SVGIcon.CopyIcon = CopyIcon

export default SVGIcon
