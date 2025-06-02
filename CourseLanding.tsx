import React, { useRef } from "react";
import './CourseLanding.css';


const CourseLanding = ({ courseData, setCourseData }) => {
  const imageInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a JPG or PNG image.");
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width < 750 || img.height < 422) {
        alert("Image must be at least 750x422 pixels.");
      } else {
        const imageUrl = URL.createObjectURL(file);
        setCourseData({ ...courseData, imageUrl });
      }
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="card p-4 mb-4">
      <h4>🏠 Course Landing Page</h4>

      <label>Course Title (max 57 characters)</label>
      <input
        type="text"
        name="title"
        maxLength={57}
        className="form-control mb-3"
        value={courseData.title}
        onChange={handleChange}
        placeholder="e.g. Master React in 30 Days"
      />

      <label>Course Subtitle (max 120 characters)</label>
      <input
        type="text"
        name="subtitle"
        maxLength={120}
        className="form-control mb-3"
        value={courseData.subtitle || ""}
        onChange={handleChange}
        placeholder="e.g. Build real-world apps with React"
      />

      <label>Course Description (min 300 characters recommended)</label>
      <textarea
        name="description"
        className="form-control mb-3"
        rows={5}
        value={courseData.description}
        onChange={handleChange}
        placeholder="What will students learn in your course?"
      />

      <div className="row mb-3">
        <div className="col-md-6">
          <label>Language</label>
          <select
            name="language"
            className="form-select"
            value={courseData.language || ""}
            onChange={handleChange}
          >
            <option value="">Select Language</option>
            <option value="English">English (US)</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
          </select>
        </div>
        <div className="col-md-6">
          <label>Level</label>
          <select
            name="level"
            className="form-select"
            value={courseData.level || ""}
            onChange={handleChange}
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      <label>Course Image (750x422px, JPG/PNG)</label>
      <input
        type="file"
        accept="image/png, image/jpeg"
        className="form-control mb-3"
        ref={imageInputRef}
        onChange={handleImageUpload}
      />
      {courseData.imageUrl && (
        <img
          src={courseData.imageUrl}
          alt="Course"
          className="img-fluid mb-3"
          style={{ maxHeight: "200px", objectFit: "cover" }}
        />
      )}
    </div>
  );
};

export default CourseLanding;

