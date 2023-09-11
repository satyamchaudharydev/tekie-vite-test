
export const convertFileName = (fileName) => {
    const name = fileName && fileName.substring(0, fileName.lastIndexOf(".") + 1).split("_")[0]
    const ext = fileName && fileName.substring(fileName.lastIndexOf(".") + 1)
    const newFileName = `${name || 'file'}.${ext || ''}`;
    return newFileName
}
