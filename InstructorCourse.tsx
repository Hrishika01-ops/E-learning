import React, { useEffect, useState } from "react";
import Navbar from "../home/Navbar.tsx";

interface Course {
  title: string;
  creator: string;
  level: string;
  imageUrl: string;
}

const LOCAL_STORAGE_KEY = "instructor-courses";

const InstructorCourse: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState<Course>({
    title: "",
    creator: "",
    level: "",
    imageUrl: ""
  });

  useEffect(() => {
    const storedCourses = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedCourses) {
      setCourses(JSON.parse(storedCourses));
    } else {
      const defaultCourses: Course[] = [
        {
          title: "Python for Data Science",
          creator: "Patel MemStack",
          level: "Medium",
          imageUrl: "https://tse3.mm.bing.net/th/id/OIP.adyId6xev41Zm0pO6B1zZQHaDt?w=337&h=174&c=7&r=0&o=5&dpr=1.5&pid=1.7"
        },
        {
          title: "Mastering Next.js: Full Stack Development",
          creator: "Patel MemStack",
          level: "Medium",
          imageUrl: "https://cdn.filestackcontent.com/8MbtJ4hTAaOk3KPcptqZ"
        },
        {
          title: "Introduction to Cybersecurity",
          creator: "Patel MemStack",
          level: "Beginner",
          imageUrl: "https://www.aqskill.com/wp-content/uploads/2023/09/cybersecurity-scaled.jpg"
        },
        {
          title: "UI/UX Design Fundamentals",
          creator: "Patel MemStack",
          level: "Beginner",
          imageUrl: "https://tse4.mm.bing.net/th?id=OIP.9Gmoyz-plh976-yepyrPigHaEW&rs=1&pid=ImgDetMain"
        }
      ];
      setCourses(defaultCourses);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultCourses));
    }
  }, []);

  const updateStorage = (updatedCourses: Course[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCourses));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleCreateCourse = () => {
    let updatedCourses: Course[];
    if (editIndex !== null) {
      updatedCourses = courses.map((course, index) =>
        index === editIndex ? newCourse : course
      );
      setEditIndex(null);
    } else {
      updatedCourses = [...courses, newCourse];
    }

    setCourses(updatedCourses);
    updateStorage(updatedCourses);
    setShowDialog(false);
    setNewCourse({ title: "", creator: "", level: "", imageUrl: "" });
  };

  const handleEditCourse = (index: number) => {
    setEditIndex(index);
    setNewCourse(courses[index]);
    setShowDialog(true);
  };

  const handleDeleteCourse = (index: number) => {
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
    updateStorage(updatedCourses);
  };

  return (
    <>
      <Navbar role="Instructor" />
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
            onClick={() => setShowDialog(true)}
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
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">Instructor: {course.creator}</p>
                  <p className="card-text">Level: {course.level}</p>
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditCourse(index)}
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

        {showDialog && (
          <div className="modal show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editIndex !== null ? "Edit Course" : "Create New Course"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDialog(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="title"
                    value={newCourse.title}
                    onChange={handleInputChange}
                    placeholder="Course Title"
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="creator"
                    value={newCourse.creator}
                    onChange={handleInputChange}
                    placeholder="Instructor Name"
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="level"
                    value={newCourse.level}
                    onChange={handleInputChange}
                    placeholder="Course Level"
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="imageUrl"
                    value={newCourse.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Image URL"
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCreateCourse}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InstructorCourse;
