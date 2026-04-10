import { useEffect, useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { getProgress } from './services/api'
import { FontSizeProvider } from './contexts/FontSizeContext'
import { MainLayout, HomePage, CoursePage, CoursesPage, LessonPage, ProgressDashboard, UserProfile } from './components'
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import './App.css'

const getUniqueCompletedSubsections = (entries = []) => {
  const completed = new Map();

  entries.forEach(entry => {
    if (entry?.completed === false) return;

    const subsection = entry?.subsection ? String(entry.subsection) : null;
    if (!subsection) return;

    const key = subsection.trim();
    const current = completed.get(key);
    const currentTime = current ? new Date(current.completedAt || current.createdAt || 0).getTime() : 0;
    const nextTime = new Date(entry.completedAt || entry.createdAt || 0).getTime();

    if (!current || nextTime >= currentTime) {
      completed.set(key, entry);
    }
  });

  return Array.from(completed.values());
};

const getStreakFromProgress = (entries = []) => {
  const completedDates = Array.from(
    new Set(
      entries
        .filter(entry => entry?.completed !== false && entry?.completedAt)
        .map(entry => new Date(entry.completedAt).toDateString())
    )
  )
    .map(dateString => new Date(dateString))
    .sort((left, right) => right.getTime() - left.getTime());

  if (completedDates.length === 0) return 0;

  let streak = 1;
  for (let index = 1; index < completedDates.length; index += 1) {
    const previous = completedDates[index - 1];
    const current = completedDates[index];
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

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLogin, setShowLogin] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [courseRefreshTrigger, setCourseRefreshTrigger] = useState(0);
  const [progressEntries, setProgressEntries] = useState([]);

  const { currentUser, logout } = useAuth();

  const [user, setUser] = useState({
    name: currentUser?.displayName || 'User',
    email: currentUser?.email || '',
    streak: 0,
    completedLessons: 0,
    points: 0,
    joinDate: new Date().toISOString().split('T')[0]
  });

  const refreshProgress = async () => {
    if (!currentUser) {
      setProgressEntries([]);
      return;
    }

    try {
      const entries = await getProgress(currentUser.uid);
      const completedEntries = getUniqueCompletedSubsections(entries);
      const totalPoints = completedEntries.reduce((sum, entry) => sum + (entry.xpEarned || 0), 0);

      setProgressEntries(entries);
      setUser(prev => ({
        ...prev,
        name: currentUser.displayName || prev.name || 'User',
        email: currentUser.email || prev.email || '',
        completedLessons: completedEntries.length,
        points: totalPoints,
        streak: getStreakFromProgress(completedEntries)
      }));
    } catch (error) {
      console.error('Error loading progress:', error);
      setProgressEntries([]);
    }
  };

  useEffect(() => {
    refreshProgress();
  }, [currentUser, courseRefreshTrigger]);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentPage('course');
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentPage('lesson');
  };

  const handleLessonComplete = async (lesson, result) => {
    console.log('🎉 Lesson completed:', lesson.title, result);

    // Trigger course refresh to show updated progress
    setCourseRefreshTrigger(prev => prev + 1);

    // Show success notification
    const nextSubsection = result.nextSubsection;
    const pointsEarned = result.pointsEarned;

    // Clear refresh trigger after 5 seconds
    setTimeout(() => {
      setCourseRefreshTrigger(0);
    }, 5000);

    // Redirect back to course page after a short delay
    setTimeout(() => {
      setCurrentPage('course');
    }, 2000);

    console.log(`✅ Next lesson unlocked: ${nextSubsection}`);
  };

  const handleBackToCourse = () => {
    setCurrentPage('course');
  };

  const handleRegisterSuccess = (userData) => {
    // Update user data with registration info
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
      joinDate: new Date().toISOString().split('T')[0],
      streak: 0,
      completedLessons: 0,
      points: 0
    }));
    // After successful registration, user is auto-logged in by Firebase
    setShowLogin(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setProgressEntries([]);
      setUser({
        name: 'User',
        email: '',
        streak: 0,
        completedLessons: 0,
        points: 0,
        joinDate: new Date().toISOString().split('T')[0]
      });
      setCurrentPage('home');
      console.log('✅ Logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser) {
    return (
      <FontSizeProvider>
        {showLogin ? (
          <LoginPage
            onLoginSuccess={() => console.log('Logged in')}
            onNavigateToRegister={() => setShowLogin(false)}
          />
        ) : (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onBackToLogin={() => setShowLogin(true)}
          />
        )}
      </FontSizeProvider>
    );
  }

  return (
    <FontSizeProvider>
      <div className="App">
        {currentPage === 'profile' ? (
          <UserProfile user={user} onBack={() => setCurrentPage('home')} />
        ) : (
          <MainLayout
            user={user}
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onSignOut={handleLogout}
          >
            <main className="app-main">
              {currentPage === 'home' && <HomePage user={user} progressEntries={progressEntries} onCourseSelect={handleCourseSelect} />}
              {currentPage === 'courses' && <CoursesPage progressEntries={progressEntries} onCourseSelect={handleCourseSelect} />}
              {currentPage === 'course' && <CoursePage
                selectedCourse={selectedCourse}
                onStartLesson={handleLessonSelect}
                user={user}
                progressEntries={progressEntries}
                refreshTrigger={courseRefreshTrigger}
              />}
              {currentPage === 'lesson' && <LessonPage
                lesson={selectedLesson}
                course={selectedCourse}
                progressEntries={progressEntries}
                onComplete={handleLessonComplete}
                onBack={handleBackToCourse}
              />}
              {currentPage === 'progress' && <ProgressDashboard user={user} progressEntries={progressEntries} />}
            </main>
          </MainLayout>
        )}
      </div>
    </FontSizeProvider>
  )
}

export default App
