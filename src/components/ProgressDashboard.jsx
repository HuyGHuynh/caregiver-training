import React, { useState } from 'react';
import './ProgressDashboard.css';

const extractSubsectionNumber = (subsection) => {
  if (!subsection) return '';

  const subsectionText = String(subsection);
  const match = subsectionText.match(/^(\d+\.\d+)/);
  return match ? match[1] : subsectionText;
};

const getUniqueProgressEntries = (entries = []) => {
  const uniqueEntries = new Map();

  entries.forEach(entry => {
    if (entry?.completed === false) return;

    const subsection = extractSubsectionNumber(entry?.subsection);
    if (!subsection) return;

    const current = uniqueEntries.get(subsection);
    const currentTime = current ? new Date(current.completedAt || current.createdAt || 0).getTime() : 0;
    const nextTime = new Date(entry.completedAt || entry.createdAt || 0).getTime();

    if (!current || nextTime >= currentTime) {
      uniqueEntries.set(subsection, entry);
    }
  });

  return Array.from(uniqueEntries.values());
};

const calculateStreak = (entries = []) => {
  const dates = Array.from(
    new Set(
      entries
        .filter(entry => entry?.completed !== false && entry?.completedAt)
        .map(entry => new Date(entry.completedAt).toDateString())
    )
  )
    .map(dateString => new Date(dateString))
    .sort((left, right) => right.getTime() - left.getTime());

  if (dates.length === 0) return 0;

  let streak = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const previous = dates[index - 1];
    const current = dates[index];
    const expected = new Date(previous);
    expected.setDate(expected.getDate() - 1);

    if (expected.toDateString() === current.toDateString()) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

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

const CurrentCourse = ({ course, user }) => {
  // If user has no completed lessons, show getting started message
  if (!user?.completedLessons || user.completedLessons === 0) {
    return (
      <div className="current-course">
        <h3 className="section-title">Getting Started</h3>
        <div className="no-course-card">
          <div className="no-course-icon">🎯</div>
          <div className="no-course-content">
            <h4 className="no-course-title">No courses started yet</h4>
            <p className="no-course-description">
              Begin your learning journey by selecting a course from our recommendations below.
              Each course is designed to build your skills step by step.
            </p>
            <div className="no-course-stats">
              <div className="stat-item">
                <span className="stat-icon">📚</span>
                <span className="stat-text">0 lessons completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🏆</span>
                <span className="stat-text">0 courses finished</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-text">0 points earned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show current course if user has progress
  return (
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
};

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

const Badges = ({ achievements, user }) => {
  const unlockedAchievements = achievements.filter(achievement => achievement.unlocked);
  const upcomingAchievements = achievements.filter(achievement => !achievement.unlocked);

  // Show different content for new users
  if (!user?.completedLessons || user.completedLessons === 0) {
    return (
      <div className="badges-section">
        <h3 className="section-title">Your Badges</h3>
        <div className="no-badges-yet">
          <div className="no-badges-icon">🏆</div>
          <div className="no-badges-content">
            <h4 className="no-badges-title">No badges earned yet</h4>
            <p className="no-badges-description">
              Complete lessons and courses to earn your first badges!
            </p>
          </div>
        </div>

        <div className="upcoming-badges">
          <h4>Badges to Earn</h4>
          <div className="upcoming-badges-list">
            {upcomingAchievements.slice(0, 3).map(achievement => (
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
      </div>
    );
  }

  return (
    <div className="badges-section">
      <h3 className="section-title">Your Badges</h3>
      <div className="badges-grid">
        {unlockedAchievements.map(achievement => (
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

      {upcomingAchievements.length > 0 && (
        <div className="upcoming-badges">
          <h4>Next Badges to Earn</h4>
          <div className="upcoming-badges-list">
            {upcomingAchievements.slice(0, 2).map(achievement => (
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
};

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

const ProgressDashboard = ({ user, progressEntries = [] }) => {
  const [timeRange, setTimeRange] = useState('thisWeek');

  const uniqueProgressEntries = getUniqueProgressEntries(progressEntries);
  const lessonsCompleted = uniqueProgressEntries.length;
  const totalPoints = uniqueProgressEntries.reduce((sum, p) => sum + (p.xpEarned || 0), 0);

  const userStats = {
    streak: calculateStreak(uniqueProgressEntries),
    lessonsCompleted,
    totalPoints
  };

  // Mock current course data - in a real app, this would come from user's enrolled courses
  const mockCurrentCourse = {
    id: 1,
    title: 'Basic Best Practices of Dementia Caregiving',
    category: 'Basic Caregiving',
    icon: '🏥',
    color: '#4285F4',
    progress: lessonsCompleted > 0 ? Math.min(Math.round((lessonsCompleted / 11) * 100), 100) : 0,
    completedLessons: lessonsCompleted,
    totalLessons: 11,
    estimatedTime: '4-6 weeks'
  };

  // Mock activity data - would be based on user's actual learning activity
  const mockActivityData = lessonsCompleted > 0 ? [45, 60, 30, 75, 90, 25, 0] : [0, 0, 0, 0, 0, 0, 0];

  // Achievement badges - unlock based on actual user progress
  const mockAchievements = [
    {
      id: 1,
      name: 'First Steps in Care',
      description: 'Complete your first dementia caregiving lesson',
      icon: '🌟',
      points: 50,
      unlocked: lessonsCompleted > 0,
      dateEarned: 'Jan 15, 2026'
    },
    {
      id: 2,
      name: 'Week Warrior',
      description: 'Maintained 7-day learning streak',
      icon: '🔥',
      points: 100,
      unlocked: userStats.streak >= 7,
      dateEarned: 'Feb 8, 2026'
    },
    {
      id: 3,
      name: 'Knowledge Seeker',
      description: 'Complete 25 lessons',
      icon: '📚',
      points: 200,
      unlocked: lessonsCompleted >= 25
    },
    {
      id: 4,
      name: 'Course Master',
      description: 'Complete your first full course',
      icon: '👑',
      points: 500,
      unlocked: false // Would check if user completed any full course
    }
  ];

  // Recent lessons - empty for new users
  const mockRecentLessons = lessonsCompleted > 0 ? [
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
    }
  ] : [];

  // Skills - start at 0 for new users
  const mockSkills = [
    { name: 'Communication', level: Math.min(Math.floor(lessonsCompleted / 10) + 1, 5), progress: Math.min(lessonsCompleted * 5, 100) },
    { name: 'Behavioral Management', level: Math.min(Math.floor(lessonsCompleted / 15) + 1, 5), progress: Math.min(lessonsCompleted * 3, 100) },
    { name: 'Person-Centered Care', level: Math.min(Math.floor(lessonsCompleted / 8) + 1, 5), progress: Math.min(lessonsCompleted * 7, 100) },
    { name: 'Safety Assessment', level: Math.min(Math.floor(lessonsCompleted / 20) + 1, 5), progress: Math.min(lessonsCompleted * 2, 100) }
  ];

  return (
    <div className="progress-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Your Learning Progress</h1>
        {lessonsCompleted === 0 && (
          <p className="dashboard-subtitle">Start your first course to begin tracking your progress!</p>
        )}
      </div>

      <StatsOverview stats={userStats} />

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <CurrentCourse course={mockCurrentCourse} user={user} />
        </div>

        <div className="dashboard-sidebar">
          <Badges achievements={mockAchievements} user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;