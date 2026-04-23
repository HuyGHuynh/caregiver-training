import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { getRandomQuote } from './quotes';

const extractSubsectionNumber = (subsection) => {
  if (!subsection) return '';

  const subsectionText = String(subsection);
  const match = subsectionText.match(/^(\d+\.\d+)/);
  return match ? match[1] : subsectionText;
};

const COURSE_DEFINITIONS = [
  {
    id: 1,
    title: 'Basic Best Practices of Dementia Caregiving',
    category: 'Basic Caregiving',
    description: 'Master fundamental dementia care principles including communication, daily routines, and safety measures.',
    icon: '🏥',
    color: '#4285F4',
    lessonCount: 11,
    duration: '4-6 weeks',
    estimatedTime: '8-12 weeks',
    level: 'Beginner',
    recommended: true,
    subsections: ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3']
  },
  {
    id: 2,
    title: 'Intermediate Dementia Caregiving Knowledge',
    category: 'Intermediate Care',
    description: 'Advanced techniques for managing challenging behaviors, medication assistance, and specialized care approaches.',
    icon: '🧠',
    color: '#00AF54',
    lessonCount: 14,
    duration: '6-8 weeks',
    estimatedTime: '10-14 weeks',
    level: 'Intermediate',
    recommended: true,
    subsections: ['4.1', '4.2', '4.3', '4.4', '5.1', '5.2', '5.3', '5.4', '5.5', '6.1', '6.2', '6.3', '6.4', '6.5']
  },
  {
    id: 3,
    title: 'Advanced Dementia Caregiving Research',
    category: 'Advanced Research',
    description: 'Explore implementation science, AI-supported learning, and ethnocultural personalization in dementia caregiver training.',
    icon: '🔬',
    color: '#7B61FF',
    lessonCount: 7,
    duration: '5-7 weeks',
    estimatedTime: '7-10 weeks',
    level: 'Advanced',
    recommended: false,
    subsections: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7']
  }
];

const buildCourseProgress = (course, progressEntries = []) => {
  const completedSubsections = new Map();

  progressEntries.forEach(entry => {
    if (entry?.completed === false) return;

    const subsection = extractSubsectionNumber(entry?.subsection);
    if (!course.subsections.includes(subsection)) return;

    const current = completedSubsections.get(subsection);
    const currentTime = current ? new Date(current.completedAt || current.createdAt || 0).getTime() : 0;
    const nextTime = new Date(entry.completedAt || entry.createdAt || 0).getTime();

    if (!current || nextTime >= currentTime) {
      completedSubsections.set(subsection, entry);
    }
  });

  const completedLessons = completedSubsections.size;
  const progress = course.lessonCount > 0 ? Math.min(Math.round((completedLessons / course.lessonCount) * 100), 100) : 0;

  return {
    ...course,
    completedLessons,
    progress,
    isCompleted: progress >= 100
  };
};

const CourseCard = ({ course, onCourseSelect }) => (
  <div className="course-card">
    <div className="course-image">
      <div className="course-icon" style={{ background: course.color }}>
        {course.icon}
      </div>
    </div>
    <div className="course-card-content">
      <div className="course-category">{course.category}</div>
      <h3 className="course-title">{course.title}</h3>
      <p className="course-description">{course.description}</p>
      <div className="course-stats">
        <span className="stat">
          <span className="stat-icon">📚</span>
          {course.lessonCount} lessons
        </span>
        <span className="stat">
          <span className="stat-icon">⏱️</span>
          {course.duration}
        </span>
        <span className="stat">
          <span className="stat-icon">📈</span>
          {course.level}
        </span>
      </div>
      <div className="course-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${course.progress || 0}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {course.progress ? `${course.progress}% complete` : 'Not started'}
        </span>
      </div>
    </div>
    <div className="course-actions">
      <button
        className="btn btn-primary"
        onClick={() => onCourseSelect(course)}
      >
        {course.progress ? 'Continue' : 'Start Course'}
      </button>
    </div>
  </div>
);

const HeroSection = ({ user }) => {
  const isNewUser = !user?.completedLessons || user.completedLessons === 0;
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    // Set a random quote when the component loads
    setDailyQuote(getRandomQuote());
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-content">
        {dailyQuote && (
          <div className="daily-quote">
            <p className="quote-text">"{dailyQuote}"</p>
          </div>
        )}
        <h1 className="hero-title">
          {isNewUser ? `Welcome to EduPlatform, ${user?.name || 'Student'}! 👋` : `Welcome back, ${user?.name || 'Student'}! 👋`}
        </h1>
        <p className="hero-subtitle">
          {isNewUser
            ? 'Start your journey in dementia caregiving with evidence-based courses designed by healthcare professionals.'
            : 'Continue mastering dementia caregiving with evidence-based courses designed by healthcare professionals.'
          }
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="stat-number">{user?.streak || 0}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">{user?.completedLessons || 0}</div>
            <div className="stat-label">Lessons Completed</div>
          </div>
          <div className="hero-stat">
            <div className="stat-number">{user?.points || 0}</div>
            <div className="stat-label">Points Earned</div>
          </div>
        </div>
        {isNewUser && (
          <div className="new-user-encouragement">
            <p className="encouragement-text">
              🎯 Ready to get started? Choose your first course below!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const RecommendedSection = ({ courses, onCourseSelect, user }) => {
  // Determine which course to recommend based on user progress
  const getRecommendedCourse = () => {
    const basicCourse = courses.find(course => course.id === 1);
    const intermediateCourse = courses.find(course => course.id === 2);

    // Case 1: User is currently on a course (progress > 0 and < 100)
    const currentCourse = courses.find(course => course.progress > 0 && course.progress < 100);
    if (currentCourse) {
      return [currentCourse];
    }

    // Case 3: User completed basic course (progress >= 100), recommend intermediate
    if (basicCourse && basicCourse.progress >= 100) {
      return intermediateCourse ? [intermediateCourse] : [];
    }

    // Case 2: User hasn't done any course, recommend basic
    return basicCourse ? [basicCourse] : [];
  };

  const recommendedCourses = getRecommendedCourse();

  if (recommendedCourses.length === 0) {
    return null;
  }

  return (
    <section className="recommended-section">
      <div className="section-header">
        <h2 className="section-title">Recommended for You</h2>
        <p className="section-subtitle">Courses picked based on your learning progress</p>
      </div>
      <div className="courses-grid">
        {recommendedCourses.map(course => (
          <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
        ))}
      </div>
    </section>
  );
};

const BrowseSection = ({ courses, categories, onCourseSelect }) => (
  <section className="browse-section">
    <div className="section-header">
      <h2 className="section-title">Browse All Courses</h2>
      <div className="category-filters">
        <button className="category-filter active">All</button>
        {categories.map(category => (
          <button key={category} className="category-filter">
            {category}
          </button>
        ))}
      </div>
    </div>
    <div className="courses-grid">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
      ))}
    </div>
  </section>
);

const HomePage = ({ user, progressEntries = [], courses = [], categories = [], onCourseSelect }) => {
  const mockUser = {
    name: 'Alex Johnson',
    streak: 7,
    completedLessons: 24,
    points: 1250,
    ...user
  };
  const mockCourses = (courses.length > 0 ? courses : COURSE_DEFINITIONS).map(course =>
    buildCourseProgress(course, progressEntries)
  );

  const mockCategories = categories.length > 0
    ? categories
    : ['Basic Caregiving', 'Intermediate Care', 'Advanced Research', 'Advanced Care', 'Safety & Environment'];

  const isNewUser = (mockUser.completedLessons || 0) === 0;

  return (
    <div className="home-page">
      <HeroSection user={mockUser} />
      <RecommendedSection courses={mockCourses} onCourseSelect={onCourseSelect} user={mockUser} />
      <BrowseSection courses={mockCourses} categories={mockCategories} onCourseSelect={onCourseSelect} />
    </div>
  );
};

export default HomePage;