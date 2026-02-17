import React, { useState } from 'react';
import './ProgressDashboard.css';

const StatsOverview = ({ stats }) => (
  <div className="stats-overview">
    <div className="stats-grid">
      <div className="stat-card primary">
        <div className="stat-icon">🔥</div>
        <div className="stat-content">
          <div className="stat-number">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <div className="stat-number">{stats.lessonsCompleted}</div>
          <div className="stat-label">Lessons Completed</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⭐</div>
        <div className="stat-content">
          <div className="stat-number">{stats.totalPoints}</div>
          <div className="stat-label">Points Earned</div>
        </div>
      </div>
    </div>
  </div>
);

const CurrentCourse = ({ course }) => (
  <div className="current-course">
    <h3 className="section-title">Currently Studying</h3>
    <div className="course-card-current">
      <div className="course-icon" style={{ background: course.color }}>
        {course.icon}
      </div>
      <div className="course-info">
        <h4 className="course-name">{course.title}</h4>
        <div className="course-category">{course.category}</div>
        <div className="progress-info">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{course.progress}% complete</span>
        </div>
        <div className="course-stats">
          <span className="stat">
            <span className="stat-icon">📚</span>
            {course.completedLessons}/{course.totalLessons} lessons
          </span>
          <span className="stat">
            <span className="stat-icon">⏱️</span>
            {course.estimatedTime}
          </span>
        </div>
      </div>
      <div className="course-status">
        📚
      </div>
    </div>
  </div>
);

const WeeklyActivity = ({ activityData }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="weekly-activity">
      <h3 className="section-title">This Week's Activity</h3>
      <div className="activity-chart">
        {days.map((day, index) => {
          const activity = activityData[index] || 0;
          const height = Math.max(4, (activity / Math.max(...activityData)) * 100);
          
          return (
            <div key={day} className="activity-bar">
              <div 
                className="bar-fill"
                style={{ height: `${height}%` }}
                title={`${day}: ${activity} minutes`}
              ></div>
              <div className="bar-label">{day}</div>
            </div>
          );
        })}
      </div>
      <div className="activity-summary">
        <div className="summary-item">
          <span className="summary-number">{activityData.reduce((a, b) => a + b, 0)}</span>
          <span className="summary-label">Minutes this week</span>
        </div>
        <div className="summary-item">
          <span className="summary-number">{activityData.filter(d => d > 0).length}</span>
          <span className="summary-label">Active days</span>
        </div>
      </div>
    </div>
  );
};

const Badges = ({ achievements }) => (
  <div className="badges-section">
    <h3 className="section-title">Your Badges</h3>
    <div className="badges-grid">
      {achievements.filter(achievement => achievement.unlocked).map(achievement => (
        <div key={achievement.id} className="badge-item">
          <div className="badge-icon">{achievement.icon}</div>
          <div className="badge-info">
            <h4 className="badge-name">{achievement.name}</h4>
            <p className="badge-description">{achievement.description}</p>
            <div className="badge-date">Earned {achievement.dateEarned}</div>
          </div>
        </div>
      ))}
    </div>
    
    {achievements.filter(achievement => !achievement.unlocked).length > 0 && (
      <div className="upcoming-badges">
        <h4>Next Badges to Earn</h4>
        <div className="upcoming-badges-list">
          {achievements.filter(achievement => !achievement.unlocked).slice(0, 2).map(achievement => (
            <div key={achievement.id} className="upcoming-badge">
              <div className="upcoming-badge-icon">{achievement.icon}</div>
              <div className="upcoming-badge-info">
                <span className="upcoming-badge-name">{achievement.name}</span>
                <span className="upcoming-badge-requirement">{achievement.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const RecentActivity = ({ recentLessons }) => (
  <div className="recent-activity">
    <h3 className="section-title">Recent Lessons</h3>
    <div className="activity-list">
      {recentLessons.map(lesson => (
        <div key={lesson.id} className="activity-item">
          <div className="activity-icon">{lesson.courseIcon}</div>
          <div className="activity-content">
            <div className="activity-main">
              <span className="lesson-title">{lesson.title}</span>
              <span className="course-name">{lesson.courseName}</span>
            </div>
            <div className="activity-meta">
              <span className="activity-date">{lesson.completedAt}</span>
              <span className="activity-score">{lesson.score}%</span>
            </div>
          </div>
          <div className="activity-status">
            {lesson.score >= 80 ? '🌟' : '✅'}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkillsProgress = ({ skills }) => (
  <div className="skills-progress">
    <h3 className="section-title">Skills Development</h3>
    <div className="skills-chart">
      {skills.map(skill => (
        <div key={skill.name} className="skill-item">
          <div className="skill-info">
            <span className="skill-name">{skill.name}</span>
            <span className="skill-level">Level {skill.level}</span>
          </div>
          <div className="skill-progress">
            <div className="skill-bar">
              <div 
                className="skill-fill" 
                style={{ width: `${skill.progress}%` }}
              ></div>
            </div>
            <span className="skill-percentage">{skill.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProgressDashboard = ({ user }) => {
  const [timeRange, setTimeRange] = useState('thisWeek');

  // Mock data
  const mockStats = {
    streak: 7,
    lessonsCompleted: 24,
    totalPoints: 1250
  };

  const mockCurrentCourse = {
    id: 1,
    title: 'Basic Best Practices of Dementia Caregiving',
    category: 'Basic Caregiving',
    icon: '🏥',
    color: '#4285F4',
    progress: 65,
    completedLessons: 7,
    totalLessons: 11,
    estimatedTime: '4-6 weeks'
  };

  const mockCourses = [
    {
      id: 1,
      title: 'Algebra Fundamentals',
      category: 'Mathematics',
      icon: '📊',
      color: '#4285F4',
      progress: 85,
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'Geometry Basics',
      category: 'Mathematics',
      icon: '📐',
      color: '#00AF54',
      progress: 100,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Introduction to Calculus',
      category: 'Mathematics',
      icon: '∫',
      color: '#FF6B35',
      progress: 0,
      status: 'upcoming'
    }
  ];

  const mockActivityData = [45, 60, 30, 75, 90, 25, 0]; // Minutes per day

  const mockAchievements = [
    {
      id: 1,
      name: 'First Steps in Care',
      description: 'Complete your first dementia caregiving lesson',
      icon: '🌟',
      points: 50,
      unlocked: true,
      dateEarned: 'Jan 15, 2026'
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: 'Maintained 7-day learning streak',
      icon: '🔥',
      points: 100,
      unlocked: true,
      dateEarned: 'Feb 8, 2026'
    },
    {
      id: 3,
      name: 'Knowledge Seeker',
      description: 'Complete 25 lessons',
      icon: '📚',
      points: 200,
      unlocked: false
    },
    {
      id: 4,
      name: 'Course Master',
      description: 'Complete your first full course',
      icon: '👑',
      points: 500,
      unlocked: false
    }
  ];

  const mockRecentLessons = [
    {
      id: 1,
      title: 'Communication Strategies',
      courseName: 'Basic Best Practices of Dementia Caregiving',
      courseIcon: '🏥',
      completedAt: '2 hours ago',
      score: 92
    },
    {
      id: 2,
      title: 'Managing Sundown Syndrome',
      courseName: 'Basic Best Practices of Dementia Caregiving',
      courseIcon: '🏥',
      completedAt: '1 day ago',
      score: 78
    },
    {
      id: 3,
      title: 'Creating Safe Environments',
      courseName: 'Basic Best Practices of Dementia Caregiving',
      courseIcon: '🏥',
      completedAt: '2 days ago',
      score: 95
    }
  ];

  const mockSkills = [
    { name: 'Communication', level: 3, progress: 75 },
    { name: 'Behavioral Management', level: 2, progress: 45 },
    { name: 'Person-Centered Care', level: 4, progress: 90 },
    { name: 'Safety Assessment', level: 1, progress: 25 }
  ];

  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Your Learning Progress</h1>
      </div>

      <StatsOverview stats={mockStats} />

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <CurrentCourse course={mockCurrentCourse} />
        </div>
        
        <div className="dashboard-sidebar">
          <Badges achievements={mockAchievements} />
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;