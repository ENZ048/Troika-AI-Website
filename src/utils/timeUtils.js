// Function to get time-based greeting messages with different tones
export function getTimeBasedGreeting() {
  const now = new Date();
  const hour = now.getHours();

  // Array of greeting messages for each time period
  const morningGreetings = [
    "☀️ Good morning! Ready to explore ITM Business School's programs?",
    "Morning! A fresh day = fresh opportunities at ITM. What would you like to know?",
    "Rise & shinelet's discover your future at ITM Business School today."
  ];

  const afternoonGreetings = [
    "Hey 👋 Hope your day's going well! Ready to learn about ITM's offerings?",
    "Welcome! Perfect time to explore ITM Business Schoolshall we start?"
  ];

  const eveningGreetings = [
    "Evenings are for planning your future ✨ What interests you about ITM?",
    "Hey! Don't worry if it's lateI'm here to help you discover ITM's programs.",
    "Good evening! Ready to explore what ITM Business School has to offer?"
  ];

  const lateNightGreetings = [
    "🌙 Burning the midnight oil? I'm here to help you learn about ITM.",
    "You're up late, and so am I. Let's explore ITM's opportunities together.",
    "Night owl or future student? Either wayI've got ITM info for you."
  ];

  let selectedGreeting;

  if (hour >= 6 && hour < 12) {
    // Morning (6 AM – 11 AM) → Fresh & Energetic
    const randomIndex = Math.floor(Math.random() * morningGreetings.length);
    selectedGreeting = morningGreetings[randomIndex];
  } else if (hour >= 12 && hour < 18) {
    // Afternoon (12 PM – 5 PM) → Friendly & Helpful
    const randomIndex = Math.floor(Math.random() * afternoonGreetings.length);
    selectedGreeting = afternoonGreetings[randomIndex];
  } else if (hour >= 18 && hour < 24) {
    // Evening/Night (6 PM – 11 PM) → Relaxed & Supportive
    const randomIndex = Math.floor(Math.random() * eveningGreetings.length);
    selectedGreeting = eveningGreetings[randomIndex];
  } else {
    // Late Night (12 AM – 5 AM) → Quirky & Reassuring
    const randomIndex = Math.floor(Math.random() * lateNightGreetings.length);
    selectedGreeting = lateNightGreetings[randomIndex];
  }

  return selectedGreeting;
}
