import React, { useState, useEffect } from 'react';
import SpeakerButton from './SpeakerButton';
import './LessonPage.css';
import AIChatbot from './AIChatbot';
import { useAuth } from '../contexts/AuthContext';
import {
  completeSubsection,
  checkSubsectionUnlock,
  extractSubsectionNumber,
  canAccessLesson
} from '../services/api';

const KnowledgeAssessment = ({ questions, onAnswer, userAnswers, onReset }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const question = questions[currentQuestion];
  const hasAnswered = userAnswers[question?.id || currentQuestion];

  return (
    <div className="practice-section">
      <div className="practice-header">
        <h3>Knowledge Assessment</h3>
        <div className="practice-header-controls">
          <div className="question-counter">
            {currentQuestion + 1} of {questions.length}
          </div>
          <button
            className="btn btn-secondary btn-small"
            onClick={onReset}
            title="Reset all answers"
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      <div className="question-progress">
        {questions.map((_, index) => {
          const isAnswered = userAnswers[questions[index]?.id || index];
          const isCorrect = isAnswered?.isCorrect;
          return (
            <div
              key={index}
              className={`progress-dot ${index === currentQuestion ? 'current' : ''
                } ${isAnswered ? (isCorrect ? 'completed-correct' : 'completed-incorrect') : ''
                }`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </div>
          );
        })}
      </div>

      <div className="question-container">
        <div className="question-content">
          <div className="text-with-speaker">
            <div className="text-content">
              <div className="question-text">{question?.question}</div>
            </div>
            <SpeakerButton text={question?.question || ''} />
          </div>
        </div>

        <div className="question-type">
          <div className="multiple-choice">
            {question?.options?.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              const questionId = question.id || currentQuestion;
              return (
                <div key={index} className="choice-option-container">
                  <button
                    className={`choice-option ${hasAnswered?.answer === option ? 'selected' : ''
                      } ${hasAnswered?.isCorrect !== undefined
                        ? letter === question.answer
                          ? 'correct'
                          : hasAnswered?.answer === option && !hasAnswered?.isCorrect
                            ? 'incorrect'
                            : ''
                        : ''
                      }`}
                    onClick={() => onAnswer(questionId, option)}
                    disabled={hasAnswered?.isCorrect !== undefined}
                  >
                    <span className="option-content">
                      {letter}. {option}
                    </span>
                  </button>
                  <SpeakerButton text={`${letter}. ${option}`} className="option-speaker" />
                </div>
              );
            })}
          </div>
        </div>

        {hasAnswered && (
          <div className={`answer-feedback ${hasAnswered.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-icon">
              {hasAnswered.isCorrect ? '✅' : '❌'}
            </div>
            <div className="text-with-speaker">
              <div className="text-content">
                <div className="feedback-text">
                  {hasAnswered.isCorrect
                    ? 'Great job! That\'s correct.'
                    : 'Not quite right. The correct answer is highlighted above.'}
                </div>
              </div>
              <SpeakerButton
                text={hasAnswered.isCorrect
                  ? 'Great job! That\'s correct.'
                  : 'Not quite right. The correct answer is highlighted above.'
                }
                className="feedback-speaker"
              />
            </div>
          </div>
        )}

        <div className="question-actions">
          <button
            className="btn btn-secondary btn-small"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          <button
            className="btn btn-secondary btn-small"
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? 'Hide Explanation' : 'Show Explanation'}
          </button>
        </div>

        {showHint && (
          <div className="hint-container">
            <div className="text-with-speaker">
              <div className="text-content">
                <h4>💡 Hint</h4>
                <p>{question?.hint || 'Think about the key concepts from the lesson content above.'}</p>
              </div>
              <SpeakerButton text={question?.hint || 'Think about the key concepts from the lesson content above.'} />
            </div>
          </div>
        )}

        {showSolution && (
          <div className="solution-container">
            <div className="text-with-speaker">
              <div className="text-content">
                <h4>📝 Explanation</h4>
                <div className="solution-steps">
                  <div className="step">
                    <span className="step-text">{question?.explanation || `The correct answer is ${question?.answer}. This relates to the fundamental understanding of dementia as covered in the lesson.`}</span>
                  </div>
                </div>
              </div>
              <SpeakerButton text={question?.explanation || `The correct answer is ${question?.answer}. This relates to the fundamental understanding of dementia as covered in the lesson.`} />
            </div>
          </div>
        )}
      </div>

      <div className="practice-navigation">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary"
          onClick={() =>
            setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))
          }
          disabled={currentQuestion === questions.length - 1}
        >
          Next
        </button>
      </div>

      {/* AI Chatbot - only visible during knowledge assessment */}
      <AIChatbot
        currentQuestion={question}
        isVisible={true}
      />
    </div>
  );
};

const LessonContent = ({ lesson, onQuizAnswer, quizAnswers, onQuizReset }) => {
  // Check if this is lesson 1.1 with quiz data
  if (lesson?.id === 1 && lesson?.quiz) {
    return (
      <div className="lesson-content">
        <div className="content-section">
          <h3>Understanding Dementia and Disease Progression</h3>
          <div className="content-text">
            <p>{lesson.description}</p>
          </div>
        </div>

        <KnowledgeAssessment
          questions={lesson.quiz}
          onAnswer={onQuizAnswer}
          userAnswers={quizAnswers}
          onReset={onQuizReset}
        />
      </div>
    );
  }

  // Default lesson content for other lessons
  return (
    <div className="lesson-content">
      <div className="content-section">
        <h3>Key Concepts</h3>
        <div className="content-text">
          <p>
            In this lesson, we'll explore effective communication strategies for dementia caregiving.
            Clear, respectful communication is essential for providing quality care and maintaining dignity.
          </p>
          <p>
            The key principle is to adapt your communication style to the person's current abilities
            while maintaining patience, empathy, and understanding throughout all interactions.
          </p>
        </div>
      </div>

      <div className="content-section">
        <h3>Examples</h3>
        <div className="example-container">
          <div className="example">
            <div className="example-title">Example 1: Responding to Repetitive Questions</div>
            <div className="scenario-text">"What time is it?" asked repeatedly every few minutes</div>
            <div className="solution-steps">
              <div className="step">
                <span className="step-number">1.</span>
                <span className="step-text">Answer calmly and patiently each time</span>
              </div>
              <div className="step">
                <span className="step-number">2.</span>
                <span className="step-text">Consider underlying needs: anxiety, boredom, or routine disruption</span>
              </div>
              <div className="step">
                <span className="step-number">3.</span>
                <span className="step-text">Redirect to a comforting activity or provide reassurance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h3>Communication Techniques</h3>
        <div className="visualization-container">
          <div className="technique-placeholder">
            <div className="technique-content">
              <div className="technique-title">Do's and Don'ts</div>
              <div className="technique-list">
                <div className="do-item">✓ Use simple, clear sentences</div>
                <div className="do-item">✓ Maintain eye contact</div>
                <div className="dont-item">✗ Don't argue or correct</div>
                <div className="dont-item">✗ Don't use complex instructions</div>
              </div>
            </div>
          </div>
          <div className="visualization-controls">
            <label>
              Tone of Voice:
              <select><option>Calm and gentle</option><option>Reassuring</option></select>
            </label>
            <label>
              Body Language:
              <select><option>Open and relaxed</option><option>Attentive</option></select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonNavigation = ({ lesson, onPrevious, onNext, onComplete, isCompleting, canComplete }) => (
  <div className="lesson-navigation">
    <button className="btn btn-secondary" onClick={onPrevious}>
      ← Previous Lesson
    </button>
    <div className="lesson-info">
      <div className="lesson-title">{lesson.title}</div>
      <div className="lesson-progress">Lesson {lesson.number} of {lesson.totalLessons}</div>
    </div>
    {lesson.isCompleted ? (
      <button className="btn btn-primary" onClick={onNext}>
        Next Lesson →
      </button>
    ) : (
      <button
        className="btn btn-success"
        onClick={onComplete}
        disabled={!canComplete || isCompleting}
      >
        {isCompleting ? 'Completing...' : 'Complete Lesson'}
      </button>
    )}
  </div>
);

const LessonPage = ({ lesson, course, onComplete = () => { }, onNext = () => { }, onPrevious = () => { }, onBack = () => { } }) => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [completionError, setCompletionError] = useState(null);
  const [completionSuccess, setCompletionSuccess] = useState(false);

  const { currentUser, userProfile, refreshProfile } = useAuth();

  // Mock data
  const mockLesson = {
    id: 22,
    number: 3,
    totalLessons: 32,
    title: 'Effective Communication Strategies',
    description: 'Learn person-centered communication techniques for dementia caregiving',
    type: 'Interactive Lesson',
    duration: 25,
    isCompleted: false,
    subsection: '1.1', // Default subsection
    category: 'Basic Best Practices of Dementia Caregiving',
    section: 'Foundational Knowledge and Early-Stage Care (Basic)',

    ...lesson
  };

  // Check if user can access this lesson on mount
  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser || !mockLesson.subsection) return;

      try {
        const subsectionNum = extractSubsectionNumber(mockLesson.subsection);
        const unlockStatus = await checkSubsectionUnlock(currentUser.uid, subsectionNum);
        setIsUnlocked(unlockStatus.isUnlocked);

        if (unlockStatus.isCompleted) {
          mockLesson.isCompleted = true;
        }
      } catch (error) {
        console.error('Error checking lesson access:', error);
        // Default to checking with userProfile data
        if (userProfile) {
          const canAccess = canAccessLesson(mockLesson.subsection, userProfile.progress);
          setIsUnlocked(canAccess);
        }
      }
    };

    checkAccess();
  }, [currentUser, mockLesson.subsection, userProfile]);

  const handleQuizReset = () => {
    setQuizAnswers({});
  };

  const handleQuizAnswer = (questionId, answer) => {
    const question = mockLesson.quiz?.find(q => (q.id || mockLesson.quiz?.indexOf(q)) === questionId) ||
      mockLesson.quiz?.[questionId];
    if (!question) return;

    const correctOption = question.options[question.answer.charCodeAt(0) - 65]; // Convert A/B/C/D to option text
    const isCorrect = answer === correctOption;

    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: { answer, isCorrect }
    }));
  };

  // Check if all quiz questions are answered correctly
  const canCompleteLesson = () => {
    if (!mockLesson.quiz || mockLesson.quiz.length === 0) {
      return true; // No quiz, can complete
    }

    return mockLesson.quiz.every((question, index) => {
      const questionId = question.id || index;
      const userAnswer = quizAnswers[questionId];
      return userAnswer && userAnswer.isCorrect;
    });
  };

  // Handle lesson completion
  const handleLessonComplete = async () => {
    if (!currentUser || !mockLesson.subsection) {
      console.error('Cannot complete lesson: missing user or subsection data');
      return;
    }

    if (!canCompleteLesson()) {
      alert('Please complete the knowledge assessment correctly before finishing the lesson.');
      return;
    }

    setIsCompleting(true);
    setCompletionError(null);

    try {
      const subsectionNum = extractSubsectionNumber(mockLesson.subsection);

      const completionData = {
        subsection: subsectionNum,
        category: mockLesson.category || course?.category || 'Basic Best Practices of Dementia Caregiving',
        section: mockLesson.section || course?.section || 'Foundational Knowledge and Early-Stage Care (Basic)',
        points: mockLesson.points || 10
      };

      const result = await completeSubsection(currentUser.uid, completionData);

      // Refresh user profile to get updated progress
      await refreshProfile();

      setCompletionSuccess(true);
      mockLesson.isCompleted = true;

      // Show success message with next lesson info
      const nextLessonInfo = result.nextSubsection ? `Next lesson: ${result.nextSubsection}` : 'Course completed!';
      alert(`🎉 Lesson completed! You earned ${result.pointsEarned} points. ${nextLessonInfo}\n\nRedirecting back to course...`);

      // Call the onComplete callback
      onComplete(mockLesson, result);

    } catch (error) {
      console.error('Error completing lesson:', error);
      setCompletionError(error.message);
      alert('Error completing lesson. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Show access denied if lesson is locked
  if (!isUnlocked) {
    return (
      <div className="lesson-page">
        <div className="lesson-header">
          <div className="lesson-breadcrumb">
            <button onClick={onBack} className="btn btn-link">← Back to Course</button>
          </div>
          <h1 className="lesson-title">🔒 Lesson Locked</h1>
        </div>
        <div className="lesson-body">
          <div className="content-section">
            <h3>Complete Previous Lessons First</h3>
            <p>This lesson is currently locked. Complete the previous lessons in order to unlock it.</p>
            <p><strong>Current lesson:</strong> {mockLesson.title}</p>
            <p><strong>Subsection:</strong> {mockLesson.subsection}</p>
            <button className="btn btn-primary" onClick={onBack}>
              ← Return to Course Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <div className="lesson-header">
        <div className="lesson-breadcrumb">
          <button onClick={onBack} className="btn btn-link">Courses</button> →
          <button onClick={onBack} className="btn btn-link">{course?.title || 'Course'}</button> →
          <span>Lesson {mockLesson.number}</span>
        </div>
        <h1 className="lesson-title">{mockLesson.title}</h1>
        <div className="lesson-meta">
          <span className="lesson-type">{mockLesson.type}</span>
          <span className="lesson-duration">{mockLesson.duration} min</span>
          <span className="lesson-status">
            {mockLesson.isCompleted ? '✅ Completed' : '📚 In Progress'}
          </span>
          {mockLesson.subsection && (
            <span className="lesson-subsection">Section: {mockLesson.subsection}</span>
          )}
        </div>
      </div>

      {completionError && (
        <div className="alert alert-error">
          <strong>Error:</strong> {completionError}
        </div>
      )}

      {completionSuccess && (
        <div className="alert alert-success">
          <strong>🎉 Congratulations!</strong> You've completed this lesson successfully!
        </div>
      )}

      <div className="lesson-body">
        <div className="learn-content">
          <LessonContent
            lesson={mockLesson}
            onQuizAnswer={handleQuizAnswer}
            quizAnswers={quizAnswers}
            onQuizReset={handleQuizReset}
          />
        </div>
      </div>

      <LessonNavigation
        lesson={mockLesson}
        onPrevious={onPrevious}
        onNext={onNext}
        onComplete={handleLessonComplete}
        isCompleting={isCompleting}
        canComplete={canCompleteLesson()}
      />
    </div>
  );
};

export default LessonPage;