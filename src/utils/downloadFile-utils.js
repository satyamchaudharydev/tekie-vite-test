const downloadFile = (url, openInNewTab = false) => {
    const a = document.createElement('a');
        document.body.appendChild(a);
        const href = `${import.meta.env.REACT_APP_FILE_BASE_URL}/${url}`
        a.href = href;
        a.download = url;
        a.click();
        setTimeout(() => {
        window.URL.revokeObjectURL(url);
        if (openInNewTab) window.open(href, '_blank')
        document.body.removeChild(a);
        }, 0)
}

export default downloadFile