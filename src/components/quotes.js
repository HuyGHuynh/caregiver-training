// Inspirational quotes for dementia caregivers
export const caregiverQuotes = [
  "There are only four kinds of people in the world: those who have been caregivers, those who are currently caregivers, those who will be caregivers, and those who will need a caregiver. — Rosalynn Carter",
  "Caregiving often calls us to lean into love we didn’t know possible. — Tia Walker",
  "To care for those who once cared for us is one of the highest honors. — Tia Walker",
  "The simple act of caring is heroic. — Edward Albert",
  "My caregiver mantra is to remember: the only control you have is over the changes you choose to make. — Nancy L. Kriseman",
  "From caring comes courage. — Lao Tzu",
  "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage. — Lao Tzu",
  "Kindness can transform someone’s dark moment with a blaze of light. — Amy Leigh Mercree",
  "Never be so busy as not to think of others. — Mother Teresa",
  "It is not how much you do, but how much love you put in the doing. — Mother Teresa",
  "Sometimes our light goes out, but is blown again into instant flame by an encounter with another human being. — Albert Schweitzer",
  "Act as if what you do makes a difference. It does. — William James",
  "Do what you can, with what you have, where you are. — Theodore Roosevelt",
  "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
  "You never know how strong you are until being strong is your only choice. — Bob Marley",
  "Healing takes time, and asking for help is a courageous step. — Mariska Hargitay",
  "Hope is being able to see that there is light despite all the darkness. — Desmond Tutu",
  "Love and compassion are necessities, not luxuries. Without them humanity cannot survive. — Dalai Lama",
  "We can’t practice compassion with other people if we can’t treat ourselves kindly. — Brené Brown",
  "Sometimes the bravest and most important thing you can do is just show up. — Brené Brown",
  "The disease might hide the person underneath, but there’s still a person in there who needs your love and attention. — Jamie Calandriello",
  "While no one can change the outcome of dementia or Alzheimer's, with the right support you can change the journey. — Tara Reed",
  "One person caring about another represents life’s greatest value. — Jim Rohn",
  "To love a person is to learn the song in their heart, and sing it to them when they have forgotten. — Arne Garborg",
  "Dementia was like a truth serum. — Amy Tan"
];

// Function to get a random quote
export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * caregiverQuotes.length);
  return caregiverQuotes[randomIndex];
};