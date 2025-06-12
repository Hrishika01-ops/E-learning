import React, { useEffect, useState } from "react";
import './StudentCourse.css';
import Navbar from "../home/Navbar.tsx";
import CourseDetail from "./CourseDetail.tsx";
import CourseLearning from "./CourseLearning.tsx";
import { courseService } from "../../services/courseService.ts";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  content: CourseContent[];
  status: 'Published';
  createdAt: string;
  instructorName: string;
  enrolledStudents: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

interface CourseContent {
  _id?: string;
  type: 'Video' | 'Youtube Url' | 'Quiz' | 'Assignment' | 'Resource';
  title: string;
  description: string;
  videoUrl?: string;
  url?: string;
  quizData?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      points: number;
    }>;
    passingScore: number;
  };
}

const StudentCourse: React.FC = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [showEnrolled, setShowEnrolled] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewingCourse, setIsViewingCourse] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch available courses (published courses)
      const availableResponse = await courseService.getAvailableCourses();
      setAvailableCourses(availableResponse.data);

      // Fetch enrolled courses for the current student
      const enrolledResponse = await courseService.getEnrolledCourses();
      setEnrolledCourses(enrolledResponse.data);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (course: Course) => {
    try {
      await courseService.enrollInCourse(course._id);
      // Refresh courses after enrollment
      await fetchCourses();
      setShowEnrolled(true);
      setIsEnrolled(true);
    } catch (err: any) {
      console.error("Error enrolling in course:", err);
      setError(err.response?.data?.message || "Failed to enroll in course");
    }
  };

  const handleCourseClick = (course: Course) => {
    const isAlreadyEnrolled = enrolledCourses.some(
      (enrolledCourse) => enrolledCourse._id === course._id
    );
    setIsEnrolled(isAlreadyEnrolled);
    setSelectedCourse(course);
  };

  if (isLoading) {
    return (
      <>
        <Navbar userRole="student" />
        <div className="container mt-4 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (isViewingCourse && selectedCourse) {
    return (
      <CourseLearning
        course={selectedCourse}
        onClose={() => {
          setIsViewingCourse(false);
          setSelectedCourse(null);
        }}
        userRole="Student"
      />
    );
  }

  return (
    <>
      <Navbar userRole="student" />
      <div className="student-course-page">
        <div className="custom-toggle-wrapper">
          <div className="custom-toggle">
            <div
              className={`toggle-option ${!showEnrolled ? 'active' : ''}`}
              onClick={() => setShowEnrolled(false)}
            >
              Available Courses
            </div>
            <div
              className={`toggle-option ${showEnrolled ? 'active' : ''}`}
              onClick={() => setShowEnrolled(true)}
            >
              Enrolled Courses
            </div>
          </div>
        </div>

        <h2 className="heading">{showEnrolled ? 'Enrolled Courses' : 'Available Courses'}</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="course-container">
          {(showEnrolled ? enrolledCourses : availableCourses).length === 0 ? (
            <p style={{ textAlign: 'center', width: '100%', color: '#666' }}>
              {showEnrolled
                ? "You haven't enrolled in any courses yet"
                : "No courses available at the moment"}
            </p>
          ) : (
            <div className="row">
              {(showEnrolled ? enrolledCourses : availableCourses).map((course) => (
                <div key={course._id} className="col-md-4 mb-4">
                  <div className="course-card">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="course-image"
                      onClick={() => handleCourseClick(course)}
                    />
                    <div className="course-details">
                      <h3 onClick={() => handleCourseClick(course)}>{course.title}</h3>
                      <p><strong>Instructor:</strong> {course.instructorName}</p>
                      <p><strong>Category:</strong> {course.category}</p>
                      <p className="description">{course.description}</p>
                      <div className="course-meta">
                        <span className="badge bg-primary me-2">{course.category}</span>
                        <span className="badge bg-info">
                          {course.content.length} {course.content.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      {!showEnrolled && (
                        <button
                          className="enroll-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnroll(course);
                          }}
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCourse && !isViewingCourse && (
        <CourseDetail
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={() => handleEnroll(selectedCourse)}
          isEnrolled={isEnrolled}
          onStartLearning={() => {
            setIsViewingCourse(true);
          }}
        />
      )}
    </>
  );
};

export default StudentCourse;