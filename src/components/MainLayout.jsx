import React from 'react';
import './MainLayout.css';

const Header = ({ user, currentPage, onNavigate }) => (
  <header className="main-header">
    <div className="container">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <h1>EduPlatform</h1>
          </div>
          <nav className="main-nav">
            <button 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              Home
            </button>
            <button 
              className={`nav-link ${currentPage === 'courses' ? 'active' : ''}`}
              onClick={() => onNavigate('courses')}
            >
              Courses
            </button>
            <button 
              className={`nav-link ${currentPage === 'progress' ? 'active' : ''}`}
              onClick={() => onNavigate('progress')}
            >
              My Progress
            </button>
            <button 
              className={`nav-link ${currentPage === 'course' ? 'active' : ''}`}
              onClick={() => onNavigate('course')}
            >
              Practice
            </button>
          </nav>
        </div>
        <div className="header-right">
          <div className="search-container">
            <input type="search" placeholder="Search courses..." className="search-input" />
            <button className="search-btn">🔍</button>
          </div>
          <div className="user-menu">
            <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

const Sidebar = ({ isOpen, onToggle }) => (
  <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
    <div className="sidebar-content">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Course Categories</h3>
        <ul className="sidebar-menu">
          <li><a href="/basic-caregiving" className="sidebar-link">Basic Caregiving</a></li>
          <li><a href="/intermediate-care" className="sidebar-link">Intermediate Care</a></li>
          <li><a href="/advanced-care" className="sidebar-link">Advanced Care</a></li>
          <li><a href="/behavioral-management" className="sidebar-link">Behavioral Management</a></li>
          <li><a href="/specialized-interventions" className="sidebar-link">Specialized Interventions</a></li>
        </ul>
      </div>
      <div className="sidebar-section">
        <h3 className="sidebar-title">My Learning</h3>
        <ul className="sidebar-menu">
          <li><a href="/bookmarks" className="sidebar-link">Bookmarks</a></li>
          <li><a href="/achievements" className="sidebar-link">Achievements</a></li>
          <li><a href="/streak" className="sidebar-link">Daily Streak</a></li>
        </ul>
      </div>
    </div>
  </aside>
);

const MainLayout = ({ children, user, sidebarOpen = false, onSidebarToggle = () => {}, currentPage, onNavigate }) => {
  return (
    <div className="main-layout">
      <Header user={user} currentPage={currentPage} onNavigate={onNavigate} />
      <div className="layout-body">
        <Sidebar isOpen={sidebarOpen} onToggle={onSidebarToggle} />
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;