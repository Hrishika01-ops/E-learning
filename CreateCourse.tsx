import React, { useState } from "react";
import CourseLanding from "./CourseLanding.tsx";
import CurriculumBuilder from "./CurriculumBuilder.tsx";
import ContentUpload from "./ContentUploader.tsx";

const CreateCourse: React.FC = () => {
  const [activeTab, setActiveTab] = useState("landing");

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    instructorName: "",
    category: "",
    imageUrl: "",
    curriculum: [],
    content: [],
  });

  const renderTab = () => {
    switch (activeTab) {
      case "landing":
        return <CourseLanding courseData={courseData} setCourseData={setCourseData} />;
      case "curriculum":
        return <CurriculumBuilder courseData={courseData} setCourseData={setCourseData} />;
      case "content":
        return <ContentUpload courseData={courseData} setCourseData={setCourseData} />;
      default:
        return null;
    }
  };

  const handleSaveCourse = () => {
    const existing = JSON.parse(localStorage.getItem("evidwan-available-courses") || "[]");
    localStorage.setItem("evidwan-available-courses", JSON.stringify([...existing, courseData]));
    alert("Course saved successfully!");
  };

  return (
    <div className="container mt-4">
      <h2>Create New Course</h2>

      <div className="btn-group mb-4" role="group">
        <button
          className={`btn btn-outline-primary ${activeTab === "landing" ? "active" : ""}`}
          onClick={() => setActiveTab("landing")}
        >
          🏠 Course Landing
        </button>
        <button
          className={`btn btn-outline-primary ${activeTab === "curriculum" ? "active" : ""}`}
          onClick={() => setActiveTab("curriculum")}
        >
          📚 Curriculum
        </button>
        <button
          className={`btn btn-outline-primary ${activeTab === "content" ? "active" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          📤 Upload Content
        </button>
      </div>

      {renderTab()}

      <button className="btn btn-success mt-4" onClick={handleSaveCourse}>
        Save Course
      </button>
    </div>
  );
};

export default CreateCourse;
