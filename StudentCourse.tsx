import React, { useEffect, useState } from "react";
import './StudentCourse.css';
import Navbar from "../home/Navbar.tsx";

interface Course {
  courseID: string;
  title: string;
  description: string;
  instructorID: string;
  instructorName: string;
  category: string;
  imageUrl: string;
}

// Key names for localStorage
const AVAILABLE_KEY = "evidwan-available-courses";
const ENROLLED_KEY = "evidwan-enrolled-courses";

const initialCourses: Course[] = [
  {
    courseID: "C001",
    title: "Mastering Docker: From Beginner to Expert",
    description: "Learn Docker from scratch with real-world examples.",
    instructorID: "I101",
    instructorName: "Patel MemStack",
    category: "DevOps",
    imageUrl: "https://miro.medium.com/v2/resize:fit:1358/1*DPC6qsPLlL-PScG_TX_29w.png"
  },
  {
    courseID: "C002",
    title: "Mastering Next.js: Full Stack Development",
    description: "Build scalable full-stack apps using Next.js.",
    instructorID: "I101",
    instructorName: "Patel MemStack",
    category: "Web Development",
    imageUrl: "https://cdn.filestackcontent.com/8MbtJ4hTAaOk3KPcptqZ"
  },
  {
    courseID: "C003",
    title: "Master HTML: The Complete Guide",
    description: "Comprehensive guide to HTML for building web pages.",
    instructorID: "I102",
    instructorName: "Ayesha R.",
    category: "Frontend",
    imageUrl: "https://www.devopsschool.com/blog/wp-content/uploads/2022/03/html2.jpg"
  },
  {
    courseID: "C004",
    title: "JavaScript Basics for Beginners",
    description: "Start your journey into web development with JavaScript.",
    instructorID: "I102",
    instructorName: "Ayesha R.",
    category: "Frontend",
    imageUrl: "https://tse2.mm.bing.net/th/id/OIP.5znA8ctt6uLN1TUPDBnTIgHaEK?w=307&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7"
  },
  {
    courseID: "C005",
    title: "Advanced CSS Techniques",
    description: "Master layout, animations, and responsiveness with CSS.",
    instructorID: "I103",
    instructorName: "Rahul Singh",
    category: "Frontend",
    imageUrl: "https://tse1.mm.bing.net/th?id=OIP.FjIXN3-_EwNrq6b7qURTTAHaEA&rs=1&pid=ImgDetMain"
  },
  {
    courseID: "C006",
    title: "React Native for Mobile Development",
    description: "Build native mobile apps using React Native.",
    instructorID: "I104",
    instructorName: "Neha K.",
    category: "Mobile Development",
    imageUrl: "https://mobilecoderz.com/blog/wp-content/uploads/2022/04/React-Native-Featured-Image-2.png"
  },
  {
    courseID: "C007",
    title: "Python for Data Science",
    description: "Explore data science concepts using Python libraries.",
    instructorID: "I105",
    instructorName: "Dr. Meera B.",
    category: "Data Science",
    imageUrl: "https://tse3.mm.bing.net/th/id/OIP.adyId6xev41Zm0pO6B1zZQHaDt?w=337&h=174&c=7&r=0&o=5&dpr=1.5&pid=1.7"
  },
  {
    courseID: "C008",
    title: "Machine Learning with TensorFlow",
    description: "Apply ML techniques using TensorFlow framework.",
    instructorID: "I105",
    instructorName: "Dr. Meera B.",
    category: "Machine Learning",
    imageUrl: "https://tse2.mm.bing.net/th?id=OIP.OnoEu9UgBS6rGITyZ0MmUAHaEF&w=700&h=386&rs=1&pid=ImgDetMain"
  },
  {
    courseID: "C009",
    title: "Introduction to Cybersecurity",
    description: "Understand cybersecurity fundamentals and threats.",
    instructorID: "I106",
    instructorName: "Shiv Kumar",
    category: "Security",
    imageUrl: "https://www.aqskill.com/wp-content/uploads/2023/09/cybersecurity-scaled.jpg"
  },
  {
    courseID: "C010",
    title: "Full Stack Development with MERN",
    description: "Build web apps with MongoDB, Express, React, and Node.",
    instructorID: "I101",
    instructorName: "Patel MemStack",
    category: "Web Development",
    imageUrl: "https://tse1.mm.bing.net/th?id=OIP.NyMJXpO2cd2frppx3BeFngHaFj&rs=1&pid=ImgDetMain"
  },
  {
    courseID: "C011",
    title: "Building RESTful APIs with Node.js",
    description: "Create REST APIs using Express and Node.",
    instructorID: "I101",
    instructorName: "Patel MemStack",
    category: "Backend",
    imageUrl: "https://tse4.mm.bing.net/th/id/OIP.XkMfcwgGJMW8JUf9eAqZvwHaEl?rs=1&pid=ImgDetMain"
  },
  {
    courseID: "C012",
    title: "UI/UX Design Fundamentals",
    description: "Design engaging and user-friendly interfaces.",
    instructorID: "I107",
    instructorName: "Sneha Desai",
    category: "Design",
    imageUrl: "https://tse4.mm.bing.net/th?id=OIP.9Gmoyz-plh976-yepyrPigHaEW&rs=1&pid=ImgDetMain"
  }
];

const StudentCourse: React.FC = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [showEnrolled, setShowEnrolled] = useState(false);

  // Load from localStorage or use defaults on first mount
  useEffect(() => {
    const storedAvailable = localStorage.getItem(AVAILABLE_KEY);
    const storedEnrolled = localStorage.getItem(ENROLLED_KEY);

    if (storedAvailable && storedEnrolled) {
      setAvailableCourses(JSON.parse(storedAvailable));
      setEnrolledCourses(JSON.parse(storedEnrolled));
    } else {
      // First-time visit: populate with initialCourses
      localStorage.setItem(AVAILABLE_KEY, JSON.stringify(initialCourses));
      localStorage.setItem(ENROLLED_KEY, JSON.stringify([]));
      setAvailableCourses(initialCourses);
      setEnrolledCourses([]);
    }
  }, []);

  // Handle enroll action
  const handleEnroll = (course: Course) => {
    const updatedAvailable = availableCourses.filter(c => c.courseID !== course.courseID);
    const updatedEnrolled = [...enrolledCourses, course];

    setAvailableCourses(updatedAvailable);
    setEnrolledCourses(updatedEnrolled);

    localStorage.setItem(AVAILABLE_KEY, JSON.stringify(updatedAvailable));
    localStorage.setItem(ENROLLED_KEY, JSON.stringify(updatedEnrolled));
  };

  const displayCourses = showEnrolled ? enrolledCourses : availableCourses;

  return (
    <>
    <Navbar role="student" />
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

      <div className="course-container">
        {displayCourses.length === 0 ? (
          <p style={{ textAlign: 'center', width: '100%' }}>No courses to display</p>
        ) : (
          displayCourses.map((course) => (
            <div key={course.courseID} className="course-card">
              <img src={course.imageUrl} alt={course.title} className="course-image" />
              <div className="course-details">
                <h3>{course.title}</h3>
                <p><strong>Description:</strong> {course.description}</p>
                <p><strong>Instructor:</strong> {course.instructorName}</p>
                <p><strong>Category:</strong> {course.category}</p>
                {!showEnrolled && (
                  <button className="enroll-button" onClick={() => handleEnroll(course)}>
                    Enroll
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default StudentCourse;
