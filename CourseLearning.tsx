import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseLearning.css";
import QuizAttempt from "./QuizAttempt.tsx";
import AssignmentUpload from "./AssignmentUpload.tsx";

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

interface CourseLearningProps {
  course: Course;
  onClose: () => void;
  userRole: 'Student' | 'Instructor';
}

const CourseLearning: React.FC<CourseLearningProps> = ({
  course,
  onClose,
  userRole
}) => {
  const navigate = useNavigate();
  const [completedSections, setCompletedSections] = useState<boolean[]>(
    Array(course.content?.length || 0).fill(false)
  );
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [notesHtml, setNotesHtml] = useState<string>("");
  const notesRef = useRef<HTMLDivElement>(null);

  const tabs = userRole === 'Student' 
    ? ["Overview", "Q&A", "Notes", "Announcements"] 
    : ["Overview", "Q&A", "Announcements"];

  const toggleSection = (index: number) => {
    if (userRole !== 'Student') return; // Only students can mark sections as complete
    const updated = [...completedSections];
    updated[index] = !updated[index];
    setCompletedSections(updated);
  };

  const handleStyle = (style: "bold" | "italic" | "underline") => {
    document.execCommand(style);
  };

  const handleNotesInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (notesRef.current) {
      setNotesHtml(notesRef.current.innerHTML);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      // Handle different YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      if (match && match[2].length === 11) {
        // Return embed URL
        return `https://www.youtube.com/embed/${match[2]}`;
      }
      
      // If no match found, return original URL
      return url;
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
      return url;
    }
  };

  const renderSectionContent = () => {
    if (selectedSection === null) {
      return (
        <div style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>
          <em>Select a section to view its content.</em>
        </div>
      );
    }

    const section = course.content[selectedSection];

    switch (section.type) {
      case "Video":
        return (
          <div>
            <h4>{section.title}</h4>
            <video 
              controls
              style={{ width: "100%", maxHeight: "500px" }}
              src={section.videoUrl}
              controlsList={userRole === 'Student' ? "nodownload" : undefined}
              onContextMenu={(e) => userRole === 'Student' && e.preventDefault()}
            >
              Your browser does not support the video tag.
            </video>
            <p>{section.description}</p>
          </div>
        );

      case "Youtube Url":
        return (
          <div>
            <h4>{section.title}</h4>
            <div className="video-container">
              <iframe
                src={getYoutubeEmbedUrl(section.url || '')}
                title={section.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", aspectRatio: "16/9" }}
              ></iframe>
            </div>
            <p>{section.description}</p>
          </div>
        );

      case "Resource":
        return (
          <div>
            <h4>{section.title}</h4>
            <a href={section.url} target="_blank" rel="noopener noreferrer">
              {section.url}
            </a>
            <p>{section.description}</p>
          </div>
        );

      case "Quiz":
        if (!section.quizData) return null;
        if (userRole === 'Instructor') {
          return (
            <div className="quiz-preview">
              <h4>{section.title}</h4>
              <p>{section.description}</p>
              <div className="quiz-questions">
                {section.quizData.questions.map((q, idx) => (
                  <div key={idx} className="question-preview">
                    <p><strong>Q{idx + 1}:</strong> {q.question}</p>
                    <ul>
                      {q.options.map((opt, i) => (
                        <li key={i} className={opt === q.correctAnswer ? 'correct-answer' : ''}>
                          {opt} {opt === q.correctAnswer && ' ✓'}
                        </li>
                      ))}
                    </ul>
                    <p className="points">Points: {q.points}</p>
                  </div>
                ))}
                <p><strong>Passing Score:</strong> {section.quizData.passingScore}%</p>
              </div>
            </div>
          );
        }
        return (
          <QuizAttempt
            courseId={course._id}
            quizContent={{
              _id: section._id || selectedSection.toString(),
              title: section.title,
              quizData: section.quizData
            }}
          />
        );

      case "Assignment":
        if (userRole === 'Instructor') {
          return (
            <div className="assignment-preview">
              <h4>{section.title}</h4>
              <p>{section.description}</p>
              <div className="instructor-note">
                Students will be able to upload their assignments here.
              </div>
            </div>
          );
        }
        return (
          <AssignmentUpload
            courseId={course._id}
            assignmentContent={{
              _id: section._id || selectedSection.toString(),
              title: section.title,
              description: section.description
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="learning-page">
      <nav className="learning-navbar">
        <button className="back-btn" onClick={onClose}>
          &#8592;
        </button>
        <span className="navbar-title">{course.title}</span>
        {userRole === 'Instructor' && (
          <span className="instructor-badge">Instructor View</span>
        )}
      </nav>
      <div className="top-content">
        <div className="video-area" style={{ minHeight: "350px" }}>
          {renderSectionContent()}
        </div>

        <div className="sidebar">
          <h3>Course Content</h3>
          <ul>
            {course.content.map((section, index) => (
              <li
                key={index}
                style={{
                  background: selectedSection === index ? "#e3f2fd" : undefined,
                  borderRadius: "6px",
                  cursor: "pointer",
                  marginBottom: "0.5rem",
                  padding: "0.5rem"
                }}
                onClick={() => setSelectedSection(index)}
              >
                {userRole === 'Student' && (
                  <label
                    style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={completedSections[index]}
                      onChange={() => toggleSection(index)}
                      style={{ marginRight: 8 }}
                    />
                  </label>
                )}
                <div style={{ flex: 1, marginLeft: userRole === 'Student' ? 8 : 0 }}>
                  <strong>{section.title}</strong>
                  <div style={{ fontSize: "0.95em", color: "#666" }}>
                    {section.description}
                  </div>
                  <div>
                    <span style={{ 
                      color: section.type === "Video" ? "#1976d2" :
                             section.type === "Youtube Url" ? "#388e3c" :
                             section.type === "Quiz" ? "#fbc02d" :
                             section.type === "Assignment" ? "#d32f2f" :
                             "#666"
                    }}>
                      {section.type}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bottom-tabs">
        <div className="tab-buttons">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === "Overview" && (
            <div>
              <h4>Course Overview</h4>
              <p>{course.description}</p>
              <h5>Course Sections</h5>
              <ul>
                {course.content.map((section, idx) => (
                  <li key={idx}>
                    <strong>{section.title}</strong> - {section.description}
                    {section.type === "Quiz" && section.quizData && (
                      <div>
                        <em>
                          Quiz: {section.quizData.questions.length} questions, Passing Score: {section.quizData.passingScore}%
                        </em>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === "Q&A" && <p>Ask questions and get answers from instructors and peers.</p>}
          {activeTab === "Notes" && userRole === 'Student' && (
            <div>
              <div style={{ marginBottom: "0.5rem" }}>
                <button
                  onClick={() => handleStyle("bold")}
                  style={{
                    fontWeight: "bold",
                    background: "#fff",
                    border: "1px solid #ccc",
                    marginRight: 4,
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                  type="button"
                >
                  B
                </button>
                <button
                  onClick={() => handleStyle("italic")}
                  style={{
                    fontStyle: "italic",
                    background: "#fff",
                    border: "1px solid #ccc",
                    marginRight: 4,
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                  type="button"
                >
                  I
                </button>
                <button
                  onClick={() => handleStyle("underline")}
                  style={{
                    textDecoration: "underline",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                  type="button"
                >
                  U
                </button>
              </div>
              <div
                ref={notesRef}
                contentEditable
                suppressContentEditableWarning
                style={{
                  minHeight: "120px",
                  width: "100%",
                  padding: "0.5rem",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                  background: "#f9f9f9",
                  color: "#222",
                  resize: "vertical"
                }}
                onInput={handleNotesInput}
                dangerouslySetInnerHTML={notesHtml ? undefined : { __html: "" }}
                data-placeholder="Write your notes here..."
                className="notes-input"
              />
            </div>
          )}
          {activeTab === "Announcements" && <p>Stay updated with course announcements and notifications.</p>}
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;