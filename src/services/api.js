const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Fetch questions with fallback to mock data
export const fetchQuestions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/questions?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Transform API data to match frontend format
      return result.data.map(q => ({
        id: q._id,
        question: q.content?.text || q.question,
        options: q.choices?.map(c => c.text) || q.options || [],
        answer: q.correctAnswer || q.answer,
        explanation: q.explanation,
        hint: q.hint
      }));
    } else {
      throw new Error(result.error || 'Failed to fetch questions');
    }
  } catch (error) {
    console.warn('API Error, using mock data:', error.message);
    return getMockQuestions(filters);
  }
};

// Mock data fallback
const getMockQuestions = (filters) => {
  const mockQuestions = [
    {
      id: "mock-1",
      question: "Dementia is best defined as:",
      options: [
        "A normal part of aging",
        "A disease caused only by stress",
        "A group of symptoms that affect thinking and daily functioning",
        "A type of depression"
      ],
      answer: "C",
      subsection: "1.1",
      explanation: null
    },
    {
      id: "mock-2",
      question: "Alzheimer's disease is:",
      options: [
        "The same thing as dementia",
        "A type/cause of dementia and the most common one",
        "A temporary memory problem",
        "Only caused by lack of sleep"
      ],
      answer: "B",
      subsection: "1.1",
      explanation: null
    },
    {
      id: "mock-3",
      question: "Which statement about \"stages\" of dementia is most accurate?",
      options: [
        "Stages predict the exact timeline for everyone",
        "Stages are general guides; symptoms and speed vary by person",
        "Stages are the same as test scores",
        "Stages only matter for research, not caregiving"
      ],
      answer: "B",
      subsection: "1.1",
      explanation: null
    },
    {
      id: "mock-4",
      question: "Which example suggests more than normal aging and may indicate dementia?",
      options: [
        "Occasionally forgetting a name but remembering later",
        "Misplacing keys sometimes",
        "Getting lost in a familiar place",
        "Taking longer to learn a new app"
      ],
      answer: "C",
      subsection: "1.1",
      explanation: null
    }
  ];

  // Apply filters
  let filtered = mockQuestions;

  if (filters.subsection) {
    filtered = filtered.filter(q => q.subsection === filters.subsection);
  }

  return filtered;
};

// ==========================================
// USER MANAGEMENT API FUNCTIONS
// ==========================================

// Create or update user profile
export const createOrUpdateUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to create/update user');
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

// Get user profile and progress
export const getUserProfile = async (firebaseUid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${firebaseUid}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch user profile');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (firebaseUid, preferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${firebaseUid}/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to update preferences');
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

// ==========================================
// PROGRESS TRACKING API FUNCTIONS
// ==========================================

// Complete a subsection
export const completeSubsection = async (firebaseUid, subsectionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/complete-subsection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUid,
        ...subsectionData
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to complete subsection');
    }
  } catch (error) {
    console.error('Error completing subsection:', error);
    throw error;
  }
};

// Get course progress
export const getCourseProgress = async (firebaseUid, category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/${firebaseUid}/course/${encodeURIComponent(category)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch course progress');
    }
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

// Get dashboard data
export const getDashboardData = async (firebaseUid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/${firebaseUid}/dashboard`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch dashboard data');
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Check if subsection is unlocked
export const checkSubsectionUnlock = async (firebaseUid, subsection) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/${firebaseUid}/unlock/${subsection}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to check subsection unlock status');
    }
  } catch (error) {
    console.error('Error checking subsection unlock:', error);
    throw error;
  }
};

// Get available subsections for course
export const getAvailableSubsections = async (firebaseUid, category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/${firebaseUid}/available/${encodeURIComponent(category)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch available subsections');
    }
  } catch (error) {
    console.error('Error fetching available subsections:', error);
    throw error;
  }
};

// ==========================================
// HELPER FUNCTIONS FOR PROGRESS
// ==========================================

// Extract subsection number from string (e.g., "1.1. Understanding..." -> "1.1")
export const extractSubsectionNumber = (subsection) => {
  // Handle non-string inputs
  if (!subsection) return '1.1'; // Default fallback

  // Convert to string if it's a number
  const subStr = String(subsection);

  // If it's already in the correct format (e.g., "1.1"), return as is
  if (/^\d+\.\d+$/.test(subStr)) {
    return subStr;
  }

  // Extract from longer string (e.g., "1.1. Understanding..." -> "1.1")
  const match = subStr.match(/^(\d+\.\d+)/);
  return match ? match[1] : subStr;
};

// Check if user can access a lesson based on progress
export const canAccessLesson = (lessonSubsection, userProgress) => {
  if (!userProgress || !userProgress.completedSubsections) {
    return lessonSubsection === '1.1'; // Only first lesson accessible for new users
  }

  const subsectionNum = extractSubsectionNumber(lessonSubsection);

  // First lesson is always accessible
  if (subsectionNum === '1.1') {
    return true;
  }

  // Check if previous lesson is completed
  const [section, sub] = subsectionNum.split('.').map(Number);
  if (sub > 1) {
    const previousSubsection = `${section}.${sub - 1}`;
    return userProgress.completedSubsections.includes(previousSubsection);
  }

  // For new sections, check if previous section is completed
  if (section > 1) {
    // Simple check: look for any completed lesson in previous section
    const previousSectionPattern = `${section - 1}.`;
    return userProgress.completedSubsections.some(completed =>
      completed.startsWith(previousSectionPattern)
    );
  }

  return false;
};

// Calculate overall progress percentage
export const calculateOverallProgress = (completedSubsections, totalSubsections = 20) => {
  if (!completedSubsections || completedSubsections.length === 0) {
    return 0;
  }
  return Math.min(Math.round((completedSubsections.length / totalSubsections) * 100), 100);
};