const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    points: Number
  }],
  passingScore: { type: Number, default: 70 }
});

const contentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['Video', 'Youtube Url', 'Quiz', 'Assignment', 'Resource']
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  // For Youtube URL and Resource content
  url: String,
  // For Video content
  videoUrl: String,
  // For Quiz content only
  quizData: {
    type: quizSchema,
    required: function() {
      return this.type === 'Quiz';
    },
    validate: {
      validator: function(value) {
        // Only validate if type is Quiz
        if (this.type === 'Quiz') {
          return value && value.questions && value.questions.length > 0;
        }
        return true;
      },
      message: 'Quiz must have at least one question'
    }
  }
});

// Add validation for URL based on content type
contentSchema.pre('save', function(next) {
  if (this.type === 'Youtube Url' || this.type === 'Resource') {
    if (!this.url) {
      next(new Error(`${this.type} content must have a URL`));
      return;
    }
  }
  if (this.type === 'Video' && !this.videoUrl) {
    next(new Error('Video content must have a video URL'));
    return;
  }
  next();
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, required: true },
  content: [contentSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  }
}, {
  timestamps: true
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course; 