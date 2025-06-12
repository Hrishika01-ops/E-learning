import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../home/Navbar.tsx";
import { courseService } from "../../services/courseService.ts";
import CourseLearning from "./CourseLearning.tsx";
import "./InstructorCourse.css";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface QuizData {
  questions: QuizQuestion[];
  passingScore: number;
}

interface CourseContent {
  _id?: string;
  type: 'Video' | 'Youtube Url' | 'Quiz' | 'Assignment' | 'Resource';
  title: string;
  description: string;
  videoUrl?: string;
  url?: string;
  quizData?: QuizData;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  content: CourseContent[];
  status: 'Draft' | 'Published' | 'Archived';
  createdAt: string;
  enrolledStudents: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

const InstructorCourse: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'Student' | 'Instructor'>('Student');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and get role
    const token = window.sessionStorage.getItem("token");
    const storedRole = window.sessionStorage.getItem("userRole");
    
    if (!token) {
      navigate('/login', { state: { from: '/instructor/courses' } });
      return;
    }

    // Set user role from session storage
    if (storedRole === 'Instructor' || storedRole === 'Student') {
      setUserRole(storedRole);
    }

    fetchCourses();
  }, [navigate]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await courseService.getInstructorCourses();
      setCourses(response.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      if (err.response?.status === 401) {
        // Unauthorized - redirect to login
        navigate('/login', { state: { from: '/instructor/courses' } });
        return;
      }
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await courseService.deleteCourse(courseId);
      setShowDeleteConfirm(null);
      fetchCourses();
    } catch (err: any) {
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/instructor/courses' } });
        return;
      }
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  if (isLoading) {
    return (
      <>
        <Navbar userRole={userRole} />
        <div className="container mt-4 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (selectedCourse) {
    return (
      <CourseLearning
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        userRole={userRole}
      />
    );
  }

  return (
    <>
      <Navbar userRole={userRole} />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Courses</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/instructor/create-course")}
          >
            Create New Course
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center mt-5">
            <h3>No courses created yet</h3>
            <p>Start by creating your first course!</p>
          </div>
        ) : (
          <div className="row">
            {courses.map((course) => (
              <div key={course._id} className="col-md-4 mb-4">
                <div className="card h-100">
                  <img
                    src={course.thumbnail}
                    className="card-img-top course-thumbnail"
                    alt={course.title}
                    onClick={() => handleViewCourse(course)}
                    style={{ cursor: 'pointer' }}
                    onError={(e) => {
                      console.error(e);
                    }}
                  />
                  <div className="card-body">
                    <h5 className="card-title" onClick={() => handleViewCourse(course)} style={{ cursor: 'pointer' }}>
                      {course.title}
                    </h5>
                    <p className="card-text description">{course.description}</p>
                    <div className="course-meta">
                      <span className="badge bg-primary me-2">{course.category}</span>
                      <span className="badge bg-secondary me-2">{course.status}</span>
                      <span className="badge bg-info">
                        {course.enrolledStudents.length} Students
                      </span>
                    </div>
                    <div className="course-content mt-2">
                      <small className="text-muted">
                        {course.content.length} {course.content.length === 1 ? 'item' : 'items'}
                      </small>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => navigate(`/instructor/courses/${course._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => setShowDeleteConfirm(course._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirm === course._id && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <h4>Delete Course</h4>
                        <p>Are you sure you want to delete "{course.title}"?</p>
                        <p className="text-danger">This action cannot be undone.</p>
                        <div className="modal-actions">
                          <button
                            className="btn btn-secondary"
                            onClick={() => setShowDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteCourse(course._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default InstructorCourse;
