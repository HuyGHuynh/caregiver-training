import React from 'react';
import './HomePage.css'; // Reuse HomePage styles

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

const CoursesPage = ({ courses = [], categories = [], onCourseSelect }) => {
  const mockCourses = [
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
      progress: 65,
      recommended: true
    },
    {
      id: 2,
      title: 'Intermediate Dementia Caregiving Knowledge',
      category: 'Intermediate Care',
      description: 'Advanced techniques for managing challenging behaviors, medication assistance, and specialized care approaches.',
      icon: '🧠',
      color: '#00AF54',
      lessonCount: 13,
      totalLessons: 13,
      duration: '6-8 weeks',
      estimatedTime: '10-14 weeks',
      level: 'Intermediate',
      progress: 0,
      recommended: true
    }
  ];

  const mockCategories = ['Basic Caregiving', 'Intermediate Care'];

  return (
    <div className="home-page">
      <section className="browse-section">
        <div className="section-header">
          <h1 className="section-title">All Courses</h1>
          <p className="section-subtitle">Comprehensive dementia caregiving education</p>
          <div className="category-filters">
            <button className="category-filter active">All</button>
            {mockCategories.map(category => (
              <button key={category} className="category-filter">
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="courses-grid">
          {mockCourses.map(course => (
            <CourseCard key={course.id} course={course} onCourseSelect={onCourseSelect} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;