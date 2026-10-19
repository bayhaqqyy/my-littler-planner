import { parseDate } from './dates';

export const QUOTES = [
  { text: 'Small steps every day add up to big results.', author: 'Little Planner' },
  { text: 'You don’t have to be perfect, just keep going.', author: 'Little Planner' },
  { text: 'Believe you can and you’re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'It always seems impossible until it’s done.', author: 'Nelson Mandela' },
  { text: 'Be proud of how far you’ve come.', author: 'Little Planner' },
  { text: 'Focus on progress, not perfection.', author: 'Little Planner' },
  { text: 'A little progress each day adds up to big results.', author: 'Satya Nani' },
  { text: 'Bloom where you are planted.', author: 'Little Planner' },
  { text: 'Rest is part of the plan too.', author: 'Little Planner' },
  { text: 'Dream big, start small, act now.', author: 'Robin Sharma' },
  { text: 'You are capable of amazing things.', author: 'Little Planner' },
  { text: 'One task at a time, one day at a time.', author: 'Little Planner' },
];

export function quoteOfDay(date: string) {
  const day = Math.floor(parseDate(date).getTime() / 86400000);
  return QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length];
}

export const CHEERS = [
  'Yay! One task completed!',
  'Good job, you did it!',
  'Look at you go! 🌷',
  'Another one done, so proud of you!',
  'Sparkly work today! ✨',
  'Keep blooming! 🌸',
  'You’re on fire! 🔥',
];
