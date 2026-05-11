export const dailyQuotes = [
  {
    text: "You don't have to figure everything out today.",
    author: "Unknown",
  },
  {
    text: "It's okay to take a break. You are not a machine.",
    author: "Unknown",
  },
  {
    text: "Your mental health is more important than your grades.",
    author: "Unknown",
  },
  {
    text: "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    author: "Sophia Bush",
  },
  {
    text: "Healing is not linear. Be gentle with yourself.",
    author: "Unknown",
  },
  {
    text: "The strongest people are those who ask for help when they need it.",
    author: "Unknown",
  },
  {
    text: "You don't have to be positive all the time. It's okay to feel sad, angry, or frustrated.",
    author: "Unknown",
  },
  {
    text: "Small steps still count. Don't underestimate your progress.",
    author: "Unknown",
  },
  {
    text: "You are not alone in this. Reach out when you need to.",
    author: "Unknown",
  },
  {
    text: "Rest is not giving up. Rest is taking care of yourself.",
    author: "Unknown",
  },
  {
    text: "It's okay to not be okay. What matters is you don't stay there.",
    author: "Unknown",
  },
  {
    text: "Your feelings are valid. Never apologize for how you feel.",
    author: "Unknown",
  },
  {
    text: "One day at a time. One step at a time. You've got this.",
    author: "Unknown",
  },
  {
    text: "Be kind to your mind.",
    author: "Unknown",
  },
  {
    text: "You are more resilient than you think.",
    author: "Unknown",
  },
  {
    text: "Progress, not perfection, is what we should be asking of ourselves.",
    author: "Julia Cameron",
  },
  {
    text: "The only person you need to be better than is the person you were yesterday.",
    author: "Unknown",
  },
  {
    text: "Breathe. You're going to be okay.",
    author: "Unknown",
  },
  {
    text: "Mental health is not a destination, but a process.",
    author: "Noam Shpancer",
  },
  {
    text: "You carry so much love in your heart. Give some to yourself.",
    author: "Unknown",
  },
  {
    text: "Stars can't shine without darkness.",
    author: "D.H. Sidebottom",
  },
  {
    text: "There is hope, even when your brain tells you there isn't.",
    author: "John Green",
  },
  {
    text: "Self-care is giving the world the best of you, instead of what's left of you.",
    author: "Katie Reed",
  },
  {
    text: "Your pace is not your failure.",
    author: "Unknown",
  },
  {
    text: "You are worthy of the love you keep trying to give everyone else.",
    author: "Unknown",
  },
  {
    text: "Difficult roads often lead to beautiful destinations.",
    author: "Zig Ziglar",
  },
  {
    text: "Take it one day at a time. You don't have to solve everything at once.",
    author: "Unknown",
  },
  {
    text: "Asking for help is brave, not weak.",
    author: "Unknown",
  },
  {
    text: "You have survived 100% of your worst days so far.",
    author: "Unknown",
  },
  {
    text: "Tomorrow is a new page. Write a good one.",
    author: "Unknown",
  },
];

/**
 * Get the quote for today based on the date.
 * Rotates through the list daily.
 */
export function getTodayQuote() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % dailyQuotes.length;
  return dailyQuotes[index];
}
