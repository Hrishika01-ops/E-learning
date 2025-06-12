import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService.ts';

interface AssignmentContent {
  _id: string;
  title: string;
  description: string;
}

interface AssignmentUploadProps {
  courseId: string;
  assignmentContent: AssignmentContent;
}

const AssignmentUpload: React.FC<AssignmentUploadProps> = ({ courseId, assignmentContent }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousSubmission, setPreviousSubmission] = useState<any>(null);

  useEffect(() => {
    // Check for previous submission
    const checkPreviousSubmission = async () => {
      try {
        const response = await courseService.getAssignmentSubmission(assignmentContent._id);
        if (response.data) {
          setPreviousSubmission(response.data);
          setSubmitted(true);
        }
      } catch (err) {
        // Ignore error if no previous submission
      }
    };
    checkPreviousSubmission();
  }, [assignmentContent._id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await courseService.submitAssignment(
        courseId,
        assignmentContent._id,
        file
      );

      setPreviousSubmission(response.data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  if (previousSubmission) {
    return (
      <div className="assignment-submission">
        <h3>Submission Status</h3>
        <div className="submission-details">
          <p><strong>Submitted on:</strong> {new Date(previousSubmission.submittedAt).toLocaleString()}</p>
          <p><strong>File:</strong> <a href={previousSubmission.fileUrl} target="_blank" rel="noopener noreferrer">View Submission</a></p>
          {previousSubmission.grade !== undefined && (
            <>
              <p><strong>Grade:</strong> {previousSubmission.grade}</p>
              {previousSubmission.feedback && (
                <div className="feedback">
                  <strong>Feedback:</strong>
                  <p>{previousSubmission.feedback}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-upload">
      <h3>{assignmentContent.title}</h3>
      <p>{assignmentContent.description}</p>

      {error && <div className="alert alert-danger">{error}</div>}

      {!submitted ? (
        <div className="upload-section">
          <div className="mb-3">
            <input
              type="file"
              onChange={handleFileChange}
              className="form-control"
              disabled={loading}
            />
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress mb-3">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${uploadProgress}%` }}
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {uploadProgress}%
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="btn btn-primary"
          >
            {loading ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>
      ) : (
        <p className="alert alert-success">Assignment submitted successfully!</p>
      )}
    </div>
  );
};

export default AssignmentUpload;
