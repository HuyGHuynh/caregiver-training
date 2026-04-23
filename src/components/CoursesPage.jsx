import React from 'react';
import './HomePage.css'; // Reuse HomePage styles

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
    totalLessons: 11,
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
    totalLessons: 14,
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
    description: 'Explore research-focused caregiver training, implementation science, and emerging technologies in dementia care.',
    icon: '🔬',
    color: '#7B61FF',
    lessonCount: 7,
    totalLessons: 7,
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
    <div className="course-content">
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
          {course.completedLessons > 0 ? `${course.progress}% complete` : 'Not started'}
        </span>
      </div>
    </div>
    <div className="course-actions">
      <button
        className="btn btn-primary"
        onClick={() => onCourseSelect(course)}
      >
        {course.isCompleted ? 'Review' : course.completedLessons > 0 ? 'Continue' : 'Start Course'}
      </button>
    </div>
  </div>
);

const CoursesPage = ({ courses = [], categories = [], progressEntries = [], onCourseSelect }) => {
  const courseList = (courses.length > 0 ? courses : COURSE_DEFINITIONS).map(course =>
    buildCourseProgress(course, progressEntries)
  );

  const categoryList = categories.length > 0
    ? categories
    : ['Basic Caregiving', 'Intermediate Care', 'Advanced Research'];

  return (
    <div className="home-page">
      <section className="browse-section">
        <div className="section-header">
          <h1 className="section-title">All Courses</h1>
          <p className="section-subtitle">Comprehensive dementia caregiving education</p>
          <div className="category-filters">
            <button className="category-filter active">All</button>
            {categoryList.map(category => (
              <button key={category} className="category-filter">
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="courses-grid">
          {courseList.map(course => (
            <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;