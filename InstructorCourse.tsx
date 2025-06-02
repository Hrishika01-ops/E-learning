import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../home/Navbar.tsx";

interface Course {
  title: string;
  description: string;
  instructorName: string;
  category: string;
  imageUrl: string;
  courseID: string;
}

const LOCAL_STORAGE_KEY = "instructor-courses";

const InstructorCourse: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCourses = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedCourses) {
      setCourses(JSON.parse(storedCourses));
    } else {
      let defaultCourses: Course[] = JSON.parse(localStorage.getItem("evidwan-available-courses") || "[]");
      defaultCourses = [...defaultCourses, ...JSON.parse(localStorage.getItem("evidwan-enrolled-courses") || "[]")];
      setCourses(defaultCourses);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultCourses));
    }
  }, []);

  const updateStorage = (updatedCourses: Course[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCourses));
  };

  const handleDeleteCourse = (index: number) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
    updateStorage(updatedCourses);
  };

  return (
    <>
      <Navbar userRole="Instructor" />
      <div className="container mt-4">
        <style>
          {`
            .uniform-img {
              height: 180px;
              width: 100%;
              object-fit: cover;
              border-top-left-radius: 0.375rem;
              border-top-right-radius: 0.375rem;
            }
          `}
        </style>

        <div className="text-center">
          <button
            className="btn btn-secondary btn-outline-light mb-3 createButton"
            onClick={() => navigate("/instructor/create-course")}
          >
            Create Course
          </button>
        </div>

        <div className="row">
          {courses.map((course, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card h-100">
                <img
                  src={course.imageUrl}
                  className="card-img-top uniform-img"
                  alt={course.title}
                />
                <div className="card-body cbody">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">Course ID: {course.courseID}</p>
                  <p className="card-text">Description: {course.description}</p>
                  <p className="card-text">Instructor: {course.instructorName}</p>
                  <p className="card-text">Category: {course.category}</p>
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/edit-course/${index}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDeleteCourse(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InstructorCourse;
