import React, { useState, useRef } from "react";
import { courseService, CourseData } from "../../services/courseService.ts";
import "./CourseLanding.css";

interface CourseLandingProps {
  courseData: CourseData;
  setCourseData: (data: Partial<CourseData>) => void;
}

const CourseLanding: React.FC<CourseLandingProps> = ({ courseData, setCourseData }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    setUploadError(null);

    try {
      const { fileUrl } = await courseService.uploadThumbnail(file);
      if (!fileUrl) {
        throw new Error('Failed to get image URL');
      }
      setCourseData({ imageUrl: fileUrl });
      // Clean up the preview URL
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setUploadError(error.message || "Failed to upload image. Please try again.");
      // Keep the preview URL in case of error
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCourseData({ [name]: value });
  };

  return (
    <div className="course-landing">
      <div className="form-section">
        <div className="form-group">
          <label>Course Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            placeholder="Enter course title"
          />
        </div>

        <div className="form-group">
          <label>Course Description</label>
          <textarea
            className="form-control"
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            placeholder="Enter course description"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            className="form-select"
            name="category"
            value={courseData.category}
            onChange={handleInputChange}
          >
            <option value="">Select a category</option>
            <option value="Programming">Programming</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="DevOps">DevOps</option>
            <option value="Database">Database</option>
            <option value="Cloud Computing">Cloud Computing</option>
          </select>
        </div>
      </div>

      <div className="image-section">
        <div className="image-upload">
          <label>Course Thumbnail</label>
          <div className="image-preview" onClick={() => fileInputRef.current?.click()}>
            {previewUrl ? (
              <img src={previewUrl} alt="Upload preview" />
            ) : courseData.imageUrl ? (
              <img src={courseData.imageUrl} alt="Course thumbnail" />
            ) : (
              <div className="upload-placeholder">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>Click to upload thumbnail</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {isUploading && <div className="upload-status">Uploading...</div>}
          {uploadError && <div className="alert alert-danger mt-2">{uploadError}</div>}
        </div>
      </div>
    </div>
  );
};

export default CourseLanding;

