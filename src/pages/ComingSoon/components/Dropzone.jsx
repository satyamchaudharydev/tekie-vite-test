import { get } from "lodash";
import React, { memo } from "react";
import { useDropzone } from "react-dropzone";
import styles from './Dropzone.module.scss'
import MemoClose from '../../../assets/Close'


const FileInput = (props) => {
  const {
    files, setFile
  } = props;
  const { getRootProps, getInputProps } = useDropzone({
      accept: 'image/*, .pdf, .doc, .docx',
      multiple: true,
      maxFiles: 5,
    onDrop: (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const isExist = files.find(f => get(f, 'name') === file.name && get(f, 'type') === file.type)
        if (!isExist) {
          setFile(prevFiles => [...prevFiles, { file, id: `${new Date().getTime()}${file.name}` }])
        }
    });
    },
  });
    
  const removeImage = (id) => {
    if (files && files.length > 0) {
      const filesArray = [...files]
      const isExist = filesArray.find(f => get(f, 'id') === id)
      if (isExist) {
        const newFiles = filesArray.filter(file => get(file, 'id') !== id)
        setFile(newFiles)
      }
    }
  }
  return (
    <>
    <div className={styles.dropContainer}>
        <div className={styles.dropInput}>
            <div
            {...getRootProps({
              className: styles.dropInput,
            })}
            >
                <input {...getInputProps()} />
                <div>
                    <div className={styles.uploadIcon}></div>
                    <div className={styles.uploadTextDrop}><strong>Upload File (max 5)</strong></div>
                    <div className={styles.uploadTextDrop}>Click to add or drag & drop files</div>
                </div>
            </div>
        </div>
        <div className={styles.thumbnailContainer}>
            {files.map((file, i) => (
                <p key={i}>{get(file, 'file.name')}
                    <span className={styles.removeFile}>
                        <MemoClose onClick={() => removeImage(file.id)} fill={'gray'} />
                    </span>
                </p>
            ))}
        </div> 
    </div>
    </>
  );
};

export default memo(FileInput);
