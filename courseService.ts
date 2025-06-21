import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = window.sessionStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`
  };
};

interface BaseContent {
  title: string;
  description: string;
}

interface VideoContent extends BaseContent {
  type: 'Video';
  videoUrl: string;
}

interface YoutubeContent extends BaseContent {
  type: 'Youtube Url';
  url: string;
}

interface QuizContent extends BaseContent {
  type: 'Quiz';
  quizData: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      points: number;
    }>;
    passingScore: number;
  };
}

interface AssignmentContent extends BaseContent {
  type: 'Assignment';
  dueDate?: string;
  totalMarks?: number;
}


interface ResourceContent extends BaseContent {
  type: 'Resource';
  url: string;
}

export type ContentItem = VideoContent | YoutubeContent | QuizContent | AssignmentContent | ResourceContent;

export interface CourseData {
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  content: ContentItem[];
}

interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: string;
}

interface QuizAttempt {
  _id: string;
  score: number;
  maxScore: number;
  answers: Array<{
    questionIndex: number;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
  attemptedAt: string;
}

interface AssignmentSubmission {
  _id: string;
  fileUrl: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
}

export const courseService = {
  createCourse: async (courseData: CourseData) => {
    // Ensure content array exists and handle video uploads
    const validatedCourseData = {
      ...courseData,
      content: courseData.content || []
    };

    const response = await axios.post(`${API_URL}/courses/create`, validatedCourseData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  uploadThumbnail: async (file: File, onProgress?: (progress: number) => void) => {
    if (!file) throw new Error('No file provided');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image file.');
    }
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/courses/uploadThumbnail`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });

      if (!response.data.success || !response.data.fileUrl) {
        throw new Error('Failed to upload thumbnail');
      }

      return { fileUrl: response.data.fileUrl };
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload thumbnail. Please try again.');
    }
  },

  uploadVideo: async (file: File, onProgress?: (progress: number) => void) => {
    if (!file) throw new Error('No file provided');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/courses/uploadContent`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });

      if (!response.data.success || !response.data.fileUrl) {
        throw new Error('Failed to upload video');
      }

      return { fileUrl: response.data.fileUrl };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Failed to upload video. Please try again.');
    }
  },


  getAvailableCourses: async () => {
    const response = await axios.get(`${API_URL}/courses/all`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getCourse: async (courseId: string) => {
    const response = await axios.get(`${API_URL}/courses/${courseId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getInstructorCourses: async () => {
    const response = await axios.get(`${API_URL}/courses/instructor/me`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateCourse: async (courseId: string, updates: Partial<CourseData>) => {
    const response = await axios.put(`${API_URL}/courses/${courseId}`, updates, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteCourse: async (courseId: string) => {
    const response = await axios.delete(`${API_URL}/courses/${courseId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  enrollInCourse: async (courseId: string) => {
    const response = await axios.post(`${API_URL}/courses/enroll/${courseId}`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getEnrolledCourses: async () => {
    const response = await axios.get(`${API_URL}/courses/enrolled/me`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getQuizById: async (courseId: string, quizId: string) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}/quizzes/${quizId}`, {
    headers: getAuthHeader()
  });
  return response.data;
},

getAssignmentById: async (courseId: string, assignmentId: string) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}/assignments/${assignmentId}`, {
    headers: getAuthHeader()
  });
  return response.data;
},

submitQuizAttempt: async (courseId: string, quizId: string, answers: QuizAnswer[]) => {
  try {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/quizzes/${quizId}/attempt`,
      { answers },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit quiz');
  }
},

getQuizAttempt: async (quizId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/courses/quizzes/${quizId}/attempt`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting quiz attempt:', error);
    throw new Error(error.response?.data?.message || 'Failed to get quiz attempt');
  }
},

submitAssignment: async (courseId: string, assignmentId: string, file: File) => {
  try {
    // First upload the file
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await axios.post(
      `${API_URL}/courses/uploadContent`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    if (!uploadResponse.data.success || !uploadResponse.data.fileUrl) {
      throw new Error('Failed to upload assignment file');
    }

    // Then submit the assignment with the file URL
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/assignments/${assignmentId}/submit`,
      { fileUrl: uploadResponse.data.fileUrl },
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error submitting assignment:', error);
    throw new Error(error.response?.data?.message || 'Failed to submit assignment');
  }
},

getAssignmentSubmission: async (assignmentId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/courses/assignments/${assignmentId}/submission`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting assignment submission:', error);
    throw new Error(error.response?.data?.message || 'Failed to get assignment submission');
  }
},

gradeSubmission: async (submissionId: string, grade: number, feedback: string) => {
  const response = await axios.patch(`${API_URL}/assignments/${submissionId}/grade`, {
    grade, feedback
  }, {
    headers: getAuthHeader()
  });
  return response.data;
},

}; 