import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService.ts';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface QuizAttemptProps {
  courseId: string;
  quizContent: {
    _id: string;
    title: string;
    quizData: {
      questions?: QuizQuestion[];
      passingScore: number;
    };
  };
}

const QuizAttempt: React.FC<QuizAttemptProps> = ({ courseId, quizContent }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousAttempt, setPreviousAttempt] = useState<any>(null);

  useEffect(() => {
    // Check for previous attempt
    const checkPreviousAttempt = async () => {
      try {
        const response = await courseService.getQuizAttempt(quizContent._id);
        if (response.data) {
          setPreviousAttempt(response.data);
        }
      } catch (err) {
        // Ignore error if no previous attempt
      }
    };
    checkPreviousAttempt();
  }, [quizContent._id]);

  const handleOptionChange = (questionIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = async () => {
    if (!quizContent.quizData.questions) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([index, answer]) => ({
        questionIndex: parseInt(index),
        selectedAnswer: answer
      }));

      // Submit quiz attempt
      const response = await courseService.submitQuizAttempt(
        courseId,
        quizContent._id,
        formattedAnswers
      );

      setScore(response.data.score);
      setMaxScore(response.data.maxScore);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  if (!quizContent?.quizData?.questions?.length) {
    return <p>No quiz data available.</p>;
  }

  if (previousAttempt) {
    return (
      <div className="quiz-attempt previous-attempt">
        <h3>Previous Attempt Results</h3>
        <p>Score: {previousAttempt.score} / {previousAttempt.maxScore}</p>
        <p>Attempted on: {new Date(previousAttempt.attemptedAt).toLocaleString()}</p>
        <div className="answers-review">
          {previousAttempt.answers.map((answer: any, idx: number) => (
            <div key={idx} className={`answer ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
              <p><strong>Q{answer.questionIndex + 1}:</strong> {quizContent.quizData.questions![answer.questionIndex].question}</p>
              <p>Your answer: {answer.selectedAnswer}</p>
              {!answer.isCorrect && (
                <p>Correct answer: {quizContent.quizData.questions![answer.questionIndex].correctAnswer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-attempt">
      <h3>{quizContent.title}</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {quizContent.quizData.questions.map((q, idx) => (
        <div key={idx} className="question-container">
          <p><strong>Q{idx + 1}: {q.question}</strong> ({q.points} points)</p>
          {q.options.map((opt, i) => (
            <div key={i} className="option-container">
              <label>
                <input
                  type="radio"
                  name={`question-${idx}`}
                  value={opt}
                  checked={answers[idx] === opt}
                  onChange={() => handleOptionChange(idx, opt)}
                  disabled={submitted || loading}
                />
                {opt}
              </label>
            </div>
          ))}
        </div>
      ))}

      {!submitted ? (
        <button 
          onClick={handleSubmit} 
          disabled={loading || Object.keys(answers).length !== quizContent.quizData.questions.length}
          className="btn btn-primary mt-3"
        >
          {loading ? 'Submitting...' : 'Submit Quiz'}
        </button>
      ) : (
        <div className="result-container mt-3">
          <h4>Quiz Results</h4>
          <p>Your Score: {score} / {maxScore}</p>
          <p>Passing Score: {quizContent.quizData.passingScore}%</p>
          {score !== null && maxScore !== null && (
            <p>
              {(score / maxScore * 100) >= quizContent.quizData.passingScore 
                ? '🎉 Congratulations! You passed the quiz!' 
                : '😔 Unfortunately, you did not pass the quiz. Keep practicing!'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;
