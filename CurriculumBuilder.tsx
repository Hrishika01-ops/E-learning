import React, { useState } from "react";
import { courseService, CourseData, ContentItem } from "../../services/courseService.ts";
import InstructorQuiz from "../assessments/InstructorQuiz.tsx";
import InstructorAssignment from "../assessments/InstructorAssignment.tsx";
import './CurriculumBuilder.css';

interface CurriculumBuilderProps {
  courseData: CourseData;
  setCourseData: (data: Partial<CourseData>) => void;
}

const CurriculumBuilder: React.FC<CurriculumBuilderProps> = ({ courseData, setCourseData }) => {
  const [contentTitle, setContentTitle] = useState<string>("");
  const [contentType, setContentType] = useState<"Video" | "Youtube Url" | "Quiz" | "Assignment">("Video");
  const [contentUrl, setContentUrl] = useState<string>("");
  const [contentDescription, setContentDescription] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<ContentItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  const handleFileUpload = async () => {
    if (!selectedFile) return null;
    
    // Validate file size (max 500MB)
    if (selectedFile.size > 500 * 1024 * 1024) {
      setUploadError('File size should be less than 500MB');
      return null;
    }

    // Validate file type for videos
    if (contentType === "Video" && !selectedFile.type.startsWith('video/')) {
      setUploadError('Please upload a video file');
      return null;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const { fileUrl } = await courseService.uploadContent(selectedFile);
      if (!fileUrl) {
        throw new Error('Failed to get file URL');
      }
      setIsUploading(false);
      return fileUrl;
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setUploadError(error.message || "Failed to upload file. Please try again.");
      setIsUploading(false);
      return null;
    }
  };

  const handleQuizSubmit = (quizData: any) => {
    const newContent: ContentItem = {
      type: "Quiz",
      title: quizData.title,
      description: quizData.description,
      quizData: {
        questions: quizData.questions.map((q: any) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points
        })),
        passingScore: quizData.passingScore
      }
    };

    setCourseData({
      content: [...(courseData.content || []), newContent]
    });
    setIsAddingNew(false);
  };

  const handleAssignmentSubmit = (assignmentData: any) => {
    const newContent: ContentItem = {
      type: "Assignment",
      title: assignmentData.title,
      description: assignmentData.description,
      assignmentData: {
        dueDate: assignmentData.dueDate,
        totalMarks: assignmentData.totalMarks,
        instructions: assignmentData.instructions
      }
    };

    setCourseData({
      content: [...(courseData.content || []), newContent]
    });
    setIsAddingNew(false);
  };

  const addContent = async () => {
    if (!contentTitle.trim()) {
      setUploadError("Please enter a title for the lecture");
      return;
    }

    let fileUrl = null;
    if (selectedFile) {
      fileUrl = await handleFileUpload();
      if (!fileUrl) return;
    }

    let newContent: ContentItem;

    switch (contentType) {
      case "Video":
        if (!fileUrl) {
          setUploadError("Please upload a video file");
          return;
        }
        newContent = {
          type: "Video",
          title: contentTitle,
          description: contentDescription || "",
          url: fileUrl
        };
        break;

      case "Youtube Url":
        if (!contentUrl) {
          setUploadError("Please enter a YouTube URL");
          return;
        }
        newContent = {
          type: "Youtube Url",
          title: contentTitle,
          description: contentDescription || "",
          url: contentUrl
        };
        break;

      default:
        setUploadError("Invalid content type");
        return;
    }

    // Add new content directly to the content array
    setCourseData({
      content: [...(courseData.content || []), newContent]
    });
    
    // Reset form
    setContentTitle("");
    setContentUrl("");
    setContentDescription("");
    setSelectedFile(null);
    setUploadError(null);
    setIsAddingNew(false);
  };

  const renderContentForm = () => {
    if (contentType === "Quiz") {
      return <InstructorQuiz onSubmit={handleQuizSubmit} />;
    }

    if (contentType === "Assignment") {
      return <InstructorAssignment onSubmit={handleAssignmentSubmit} />;
    }

    return (
      <div className="content-form">
        <select
          className="form-select mb-2"
          value={contentType}
          onChange={(e) => setContentType(e.target.value as "Video" | "Youtube Url" | "Quiz" | "Assignment")}
        >
          <option value="Video">Video</option>
          <option value="Youtube Url">YouTube Video</option>
          <option value="Quiz">Quiz</option>
          <option value="Assignment">Assignment</option>
        </select>

        {(contentType === "Video" || contentType === "Youtube Url") && (
          <>
            <input
              className="form-control mb-2"
              placeholder="Lecture Title"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
            />

            <textarea
              className="form-control mb-2"
              placeholder="Description"
              value={contentDescription}
              onChange={(e) => setContentDescription(e.target.value)}
            />

            {contentType === "Youtube Url" ? (
              <input
                className="form-control mb-2"
                placeholder="YouTube URL"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
              />
            ) : (
              <input
                type="file"
                className="form-control mb-2"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept="video/*"
              />
            )}

            {uploadError && (
              <div className="alert alert-danger mb-2">
                {uploadError}
              </div>
            )}

            <button
              className="btn btn-outline-primary"
              onClick={addContent}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Add Lecture"}
            </button>
            <button
              className="btn btn-outline-secondary ms-2"
              onClick={() => {
                setIsAddingNew(false);
                setContentTitle("");
                setContentUrl("");
                setContentDescription("");
                setSelectedFile(null);
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    );
  };

  const renderLecturePreview = (lecture: ContentItem) => {
    if (lecture.type === "Quiz") {
      return (
        <div className="lecture-preview">
          <h4>{lecture.title}</h4>
          <p className="text-muted">Quiz</p>
          {lecture.description && (
            <div className="description mb-3">
              <h5>Description</h5>
              <p>{lecture.description}</p>
            </div>
          )}
          {/* Add quiz preview if needed */}
        </div>
      );
    }

    if (lecture.type === "Assignment") {
      return (
        <div className="lecture-preview">
          <h4>{lecture.title}</h4>
          <p className="text-muted">Assignment</p>
          {lecture.description && (
            <div className="description mb-3">
              <h5>Description</h5>
              <p>{lecture.description}</p>
            </div>
          )}
          {/* Add assignment preview if needed */}
        </div>
      );
    }

    return (
      <div className="lecture-preview">
        <h4>{lecture.title}</h4>
        <p className="text-muted">{lecture.type}</p>
        
        {lecture.description && (
          <div className="description mb-3">
            <h5>Description</h5>
            <p>{lecture.description}</p>
          </div>
        )}
        
        {lecture.type === "Youtube Url" && lecture.url && (
          <div className="video-container mb-3">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(lecture.url)}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        
        {lecture.type === "Video" && lecture.url && (
          <div className="video-container mb-3">
            <video controls width="100%">
              <source src={lecture.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    );
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="curriculum-builder">
      <div className="sections-list">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Course Content</h4>
          {!isAddingNew && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddingNew(true)}
            >
              Add New Content
            </button>
          )}
        </div>
        <div className="sections">
          <div className="section-item active">
            <ul className="list-unstyled">
              {courseData.content.map((content, contentIdx) => (
                <li 
                  key={contentIdx}
                  className={`lecture-item ${selectedLecture === content ? 'selected' : ''}`}
                  onClick={() => setSelectedLecture(content)}
                >
                  <span className="content-type badge bg-secondary me-2">{content.type}</span>
                  {content.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="content-builder">
        {isAddingNew ? (
          renderContentForm()
        ) : selectedLecture ? (
          renderLecturePreview(selectedLecture)
        ) : (
          <div className="text-center text-muted mt-4">
            <p>Select a lecture to view its contents or add new content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurriculumBuilder;
