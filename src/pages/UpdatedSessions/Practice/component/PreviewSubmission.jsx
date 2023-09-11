import React from "react";
import fileThumbnail from "../assets/fileThumbnail.png";
import DeleteButton from "./DeleteButton";
function PreviewSubmission({ type, fileLink, fileDelete, onDeleteFile, fromEvaluation }) {
  let preview = null;
  if (type === "image") {
    preview = (
      <div
        className="practice-file-preview preview"
        style={{
          backgroundImage: `url("${fileLink}")`,
          height: '100%'
        }}
      >
        {!fromEvaluation ? <DeleteButton onDelete={onDeleteFile} isDelete={false}></DeleteButton> : null}
      </div>
    );
  } else if (type === "video" && fileLink) {
    preview = (
      <div className="practice-file-preview preview">
        <video controls src={fileLink} type="video/mp4" />
        {!fromEvaluation ? <DeleteButton onDelete={onDeleteFile} isDelete={false}></DeleteButton> : null}
      </div>
    );
  } else if (type !== "image" && type !== "video" && fileLink) {
    preview = (
      <div
        className="practice-file-preview default-thumbnail"
        style={{ backgroundImage: `url(${fileThumbnail})`, height: '100%' }}
      >
      {!fromEvaluation ? <DeleteButton onDelete={onDeleteFile} isDelete={false}></DeleteButton> : null}
      </div>
    );
  }
  return <>{preview}</>;
}

export default PreviewSubmission;
