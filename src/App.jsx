import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { FontSizeProvider } from './contexts/FontSizeContext'
import { MainLayout, HomePage, CoursePage, CoursesPage, LessonPage, ProgressDashboard, UserProfile } from './components'
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLogin, setShowLogin] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [courseRefreshTrigger, setCourseRefreshTrigger] = useState(0);

  const { currentUser, logout } = useAuth();

  const [user, setUser] = useState({
    name: currentUser?.displayName || 'User',
    email: currentUser?.email || '',
    streak: 0,
    completedLessons: 0,
    points: 0,
    joinDate: new Date().toISOString().split('T')[0]
  });

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
              {currentPage === 'home' && <HomePage user={user} onCourseSelect={handleCourseSelect} />}
              {currentPage === 'courses' && <CoursesPage onCourseSelect={handleCourseSelect} />}
              {currentPage === 'course' && <CoursePage
                selectedCourse={selectedCourse}
                onStartLesson={handleLessonSelect}
                user={user}
                refreshTrigger={courseRefreshTrigger}
              />}
              {currentPage === 'lesson' && <LessonPage
                lesson={selectedLesson}
                course={selectedCourse}
                onComplete={handleLessonComplete}
                onBack={handleBackToCourse}
              />}
              {currentPage === 'progress' && <ProgressDashboard user={user} />}
            </main>
          </MainLayout>
        )}
      </div>
    </FontSizeProvider>
  )
}

export default App
