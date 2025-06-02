import React, { useState } from "react";

const ContentUploader = ({ courseData, setCourseData }) => {
  const [contentType, setContentType] = useState("Lecture");
  const [contentTitle, setContentTitle] = useState("");

  const addContent = () => {
    if (contentTitle.trim()) {
      const updated = [...courseData.content, { type: contentType, title: contentTitle }];
      setCourseData({ ...courseData, content: updated });
      setContentTitle("");
    }
  };

  return (
    <div className="card p-3 mb-4">
      <h4>Upload Content</h4>
      <select className="form-select mb-2" value={contentType} onChange={(e) => setContentType(e.target.value)}>
        <option>Lecture</option>
        <option>Quiz</option>
        <option>Exercise</option>
        <option>Video</option>
      </select>
      <input className="form-control mb-2" placeholder="Content Title" value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} />
      <button className="btn btn-secondary mb-3" onClick={addContent}>Add Content</button>
      <ul>
        {courseData.content.map((item, idx) => (
          <li key={idx}>{item.type}: {item.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default ContentUploader;
