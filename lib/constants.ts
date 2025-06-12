// Animal options with emojis for the grid selection
export interface AnimalOption {
  id: string;
  name: string;
  emoji: string;
}

export const ANIMAL_OPTIONS: AnimalOption[] = [
  { id: 'cat', name: 'Cat', emoji: '🐱' },
  { id: 'dog', name: 'Dog', emoji: '🐶' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰' },
  { id: 'fox', name: 'Fox', emoji: '🦊' },
  { id: 'bear', name: 'Bear', emoji: '🐻' },
  { id: 'panda', name: 'Panda', emoji: '🐼' },
  { id: 'koala', name: 'Koala', emoji: '🐨' },
  { id: 'lion', name: 'Lion', emoji: '🦁' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘' },
  { id: 'giraffe', name: 'Giraffe', emoji: '🦒' },
  { id: 'zebra', name: 'Zebra', emoji: '🦓' },
  { id: 'horse', name: 'Horse', emoji: '🐴' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄' },
  { id: 'penguin', name: 'Penguin', emoji: '🐧' },
  { id: 'owl', name: 'Owl', emoji: '🦉' },
  { id: 'eagle', name: 'Eagle', emoji: '🦅' },
  { id: 'parrot', name: 'Parrot', emoji: '🦜' },
  { id: 'flamingo', name: 'Flamingo', emoji: '🦩' },
  { id: 'turtle', name: 'Turtle', emoji: '🐢' },
  { id: 'frog', name: 'Frog', emoji: '🐸' },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬' },
  { id: 'whale', name: 'Whale', emoji: '🐳' },
  { id: 'octopus', name: 'Octopus', emoji: '🐙' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋' },
  { id: 'bee', name: 'Bee', emoji: '🐝' },
  { id: 'ladybug', name: 'Ladybug', emoji: '🐞' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵' },
  { id: 'sloth', name: 'Sloth', emoji: '🦥' },
  { id: 'hedgehog', name: 'Hedgehog', emoji: '🦔' },
  { id: 'shark', name: 'Shark', emoji: '🦈' },
  { id: 'crocodile', name: 'Crocodile', emoji: '🐊' },
  { id: 'snake', name: 'Snake', emoji: '🐍' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉' },
  { id: 'dinosaur', name: 'Dinosaur', emoji: '🦕' },
  { id: 't-rex', name: 'T-Rex', emoji: '🦖' },
];

// Legacy ANIMALS array for backward compatibility
export const ANIMALS: string[] = ANIMAL_OPTIONS.map(animal => animal.name);

export const APP_CONFIG = {
  MAX_STUDENTS: 50,
  IMAGE_GENERATION_TIMEOUT: 30000, // 30 seconds
  SUPPORTED_IMAGE_FORMATS: ['png', 'jpg', 'jpeg', 'webp'],
  DEFAULT_IMAGE_SIZE: { width: 1024, height: 1024 }, // DALL-E 3 default size
}; 