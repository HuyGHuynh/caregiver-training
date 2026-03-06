// Inspirational quotes for dementia caregivers
export const caregiverQuotes = [
  "Dementia changes memory — not the need for love.",
  "They may forget your name, but they will always remember how you made them feel.",
  "Confusion is not defiance — it is a symptom.",
  "Behind every behavior is a need waiting to be understood.",
  "You are doing better than you think.",
  "Small victories matter — even a smile is progress.",
  "Behavior is communication.",
  "Preserve dignity in every interaction.",
  "Compassion over correction.",
  "Meet them where they are — not where they used to be."
];

// Function to get a random quote
export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * caregiverQuotes.length);
  return caregiverQuotes[randomIndex];
};