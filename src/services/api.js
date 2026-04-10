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

// Create a new progress entry
export const createProgress = async (progressData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to create progress entry');
    }
  } catch (error) {
    console.error('Error creating progress entry:', error);
    throw error;
  }
};

// Get all progress for a user
export const getProgress = async (firebaseUid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/progress/${firebaseUid}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch progress');
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

// Get lesson content by lesson key
export const getLessonContent = async (lessonKey) => {
  try {
    const useSubsectionLookup = /^\d+\.\d+$/.test(String(lessonKey));
    const url = useSubsectionLookup
      ? `${API_BASE_URL}/api/lessons/by-subsection/${encodeURIComponent(lessonKey)}`
      : `${API_BASE_URL}/api/lessons/${encodeURIComponent(lessonKey)}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data;
    }

    throw new Error(result.error || 'Failed to fetch lesson content');
  } catch (error) {
    console.error('Error fetching lesson content:', error);
    throw error;
  }
};

const COURSE_PROGRESS_MAP = {
  1: {
    title: 'Basic Best Practices of Dementia Caregiving',
    subsections: ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3']
  },
  2: {
    title: 'Intermediate Dementia Caregiving Knowledge',
    subsections: ['4.1', '4.2', '4.3', '5.1', '5.2', '5.3', '5.4', '5.5', '6.1', '6.2', '6.3', '6.4', '6.5']
  },
  3: {
    title: 'Advanced Dementia Caregiving Research',
    subsections: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7']
  }
};

const resolveCourseConfig = (courseKey) => {
  if (courseKey === undefined || courseKey === null) {
    return COURSE_PROGRESS_MAP[1];
  }

  const numericKey = Number(courseKey);
  if (!Number.isNaN(numericKey) && COURSE_PROGRESS_MAP[numericKey]) {
    return COURSE_PROGRESS_MAP[numericKey];
  }

  const courseName = String(courseKey);
  return Object.values(COURSE_PROGRESS_MAP).find(course => course.title === courseName) || COURSE_PROGRESS_MAP[1];
};

const getUniqueProgressEntries = (entries = [], subsections = []) => {
  const uniqueEntries = new Map();

  entries.forEach(entry => {
    if (entry?.completed === false) return;

    const subsection = extractSubsectionNumber(entry?.subsection);
    if (subsections.length > 0 && !subsections.includes(subsection)) return;

    const current = uniqueEntries.get(subsection);
    const currentTime = current ? new Date(current.completedAt || current.createdAt || 0).getTime() : 0;
    const nextTime = new Date(entry.completedAt || entry.createdAt || 0).getTime();

    if (!current || nextTime >= currentTime) {
      uniqueEntries.set(subsection, entry);
    }
  });

  return Array.from(uniqueEntries.values());
};

export const getCourseProgress = async (firebaseUid, courseKey) => {
  try {
    const entries = await getProgress(firebaseUid);
    const courseConfig = resolveCourseConfig(courseKey);
    const courseEntries = getUniqueProgressEntries(entries, courseConfig.subsections);
    const completedSubsections = courseEntries.map(entry => extractSubsectionNumber(entry.subsection));
    const progress = courseConfig.subsections.length > 0
      ? Math.min(Math.round((completedSubsections.length / courseConfig.subsections.length) * 100), 100)
      : 0;

    return {
      category: courseConfig.title,
      completedSubsections,
      currentSubsection: courseConfig.subsections.find(subsection => !completedSubsections.includes(subsection)) || courseConfig.subsections[0] || '1.1',
      progress,
      isStarted: completedSubsections.length > 0,
      isCompleted: completedSubsections.length >= courseConfig.subsections.length,
      pointsEarned: courseEntries.reduce((sum, entry) => sum + (entry.xpEarned || 0), 0)
    };
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

// Get dashboard data
export const getDashboardData = async (firebaseUid) => {
  try {
    const entries = await getProgress(firebaseUid);
    const uniqueEntries = getUniqueProgressEntries(entries);
    const totalPoints = uniqueEntries.reduce((sum, entry) => sum + (entry.xpEarned || 0), 0);

    return {
      stats: {
        streak: 0,
        lessonsCompleted: uniqueEntries.length,
        totalPoints,
        completedSubsections: uniqueEntries.length,
        currentSubsection: uniqueEntries.length > 0 ? extractSubsectionNumber(uniqueEntries[uniqueEntries.length - 1].subsection) : '1.1'
      },
      progress: uniqueEntries
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Check if subsection is unlocked
export const checkSubsectionUnlock = async (firebaseUid, subsection) => {
  try {
    const entries = await getProgress(firebaseUid);
    const isUnlocked = canAccessLesson(subsection, entries);
    const isCompleted = getUniqueProgressEntries(entries).some(entry => extractSubsectionNumber(entry.subsection) === extractSubsectionNumber(subsection));

    return {
      isUnlocked,
      isCompleted
    };
  } catch (error) {
    console.error('Error checking subsection unlock:', error);
    throw error;
  }
};

// Get available subsections for course
export const getAvailableSubsections = async (firebaseUid, courseKey) => {
  try {
    const entries = await getProgress(firebaseUid);
    const courseConfig = resolveCourseConfig(courseKey);
    const completed = new Set(getUniqueProgressEntries(entries, courseConfig.subsections).map(entry => extractSubsectionNumber(entry.subsection)));

    return {
      subsections: courseConfig.subsections.map((subsection, index) => ({
        subsection,
        isUnlocked: index === 0 || completed.has(courseConfig.subsections[index - 1]),
        isCompleted: completed.has(subsection)
      }))
    };
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
  if (!userProgress) {
    return lessonSubsection === '1.1';
  }

  const completedSubsections = Array.isArray(userProgress)
    ? getUniqueProgressEntries(userProgress).map(entry => extractSubsectionNumber(entry.subsection))
    : Array.isArray(userProgress.completedSubsections)
      ? userProgress.completedSubsections.map(subsection => extractSubsectionNumber(subsection))
      : [];

  if (completedSubsections.length === 0) {
    return lessonSubsection === '1.1';
  }

  const subsectionNum = extractSubsectionNumber(lessonSubsection);
  if (subsectionNum === '1.1') {
    return true;
  }

  const [section, sub] = subsectionNum.split('.').map(Number);
  if (sub > 1) {
    const previousSubsection = `${section}.${sub - 1}`;
    return completedSubsections.includes(previousSubsection);
  }

  if (section > 1) {
    const previousSectionPattern = `${section - 1}.`;
    return completedSubsections.some(completed => completed.startsWith(previousSectionPattern));
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