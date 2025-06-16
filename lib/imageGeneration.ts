import { Student } from '../types';
import OpenAI from 'openai';

// Polyfills for Node.js compatibility with OpenAI SDK
if (typeof global !== 'undefined') {
  // Add Blob polyfill
  if (!global.Blob) {
    const { Blob } = require('buffer');
    (global as any).Blob = Blob;
  }
  
  // Add FormData polyfill
  if (!global.FormData) {
    const FormData = require('form-data');
    (global as any).FormData = FormData;
  }
  
  // Add AbortController polyfill
  if (!global.AbortController) {
    const { AbortController } = require('abort-controller');
    (global as any).AbortController = AbortController;
  }
}

// Initialize OpenAI client safely with Node.js compatibility
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file');
    }
    
    // Initialize with Node.js-specific configuration to avoid Blob issues
    openai = new OpenAI({ 
      apiKey,
      // Ensure compatibility with Node.js environment
      dangerouslyAllowBrowser: false,
      // Explicitly set timeout for better error handling
      timeout: 60000, // 60 seconds
    });
  }
  return openai;
}

export async function generateImagePrompt(student: Student): Promise<string> {
  const { animal, personalities, likes } = student;
  
  // Keep it very simple - just the basics
  const personalityText = personalities.slice(0, 2).join(' '); // Max 2 traits
  const likesText = likes.slice(0, 1).join(''); // Max 1 hobby
  
  // MUCH SIMPLER prompt - under 100 characters
  const prompt = `A ${personalityText} ${animal} enjoying ${likesText}. a realistic, photo taken style that clarify the ${animal}'s ${personalityText}, no text, and not hand drawn image.`;
  
  return prompt;
}

export async function generateAnimalImage(student: Student): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ OpenAI API key not found, using emoji fallback');
    return generateEmojiAvatar(student);
  }

  console.log('🎨 Generating image with OpenAI DALL-E...');
  console.log('📝 Student:', student.name, 'as', student.animal);
  console.log('🎭 Personalities:', student.personalities.join(', '));
  console.log('❤️ Likes:', student.likes.join(', '));

  try {
    const prompt = await generateImagePrompt(student);
    
    console.log('🤖 Using OpenAI DALL-E 3 (advanced model - $0.04/image)...');
    console.log('📋 Prompt:', prompt);
    
    // Validate prompt length (DALL-E 3 has limits)
    if (prompt.length > 4000) {
      throw new Error('Prompt too long for DALL-E 3 API');
    }
    
    const openaiClient = getOpenAIClient();
    const response = await openaiClient.images.generate({
      model: "dall-e-3",
      prompt: prompt.trim(),
      n: 1,
      size: "1024x1024",  // DALL-E 3 supports higher resolution
      quality: "standard", // Can be "standard" or "hd" (hd costs more)
      style: "vivid",      // Can be "vivid" or "natural"
      response_format: "url"
    });

    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error('No image URL returned from OpenAI API');
    }

    const imageUrl = response.data[0].url;
    console.log('✅ Image generated successfully!');
    console.log('🔗 Image URL:', imageUrl);
    return imageUrl;

  } catch (error) {
    console.error('❌ Error generating image with OpenAI:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('insufficient_quota')) {
        console.log('💡 OpenAI API quota exceeded. Using emoji fallback.');
      } else if (error.message.includes('invalid_api_key')) {
        console.log('💡 Invalid OpenAI API key. Please check your .env.local file.');
      } else if (error.message.includes('image_generation_user_error')) {
        console.log('💡 Invalid prompt for DALL-E. Using simplified prompt or emoji fallback.');
      } else if (error.message.includes('BadRequestError')) {
        console.log('💡 OpenAI request error (possibly prompt issue). Using emoji fallback.');
        console.log('🔍 Error details:', error.message);
      } else {
        console.log('💡 OpenAI API error. Using emoji fallback.');
        console.log('🔍 Error type:', error.constructor.name);
      }
    }
    
    // Return emoji avatar as fallback so the app still works
    return generateEmojiAvatar(student);
  }
}

// Emoji-based avatar generator as fallback
function generateEmojiAvatar(student: Student): string {
  const animalEmojis: { [key: string]: string } = {
    'cat': '🐱', 'dog': '🐶', 'elephant': '🐘', 'lion': '🦁', 'tiger': '🐯',
    'bear': '🐻', 'panda': '🐼', 'fox': '🦊', 'wolf': '🐺', 'rabbit': '🐰',
    'mouse': '🐭', 'hamster': '🐹', 'guinea pig': '🐹', 'horse': '🐴', 'unicorn': '🦄',
    'cow': '🐮', 'pig': '🐷', 'sheep': '🐑', 'goat': '🐐', 'chicken': '🐔',
    'duck': '🦆', 'penguin': '🐧', 'bird': '🐦', 'eagle': '🦅', 'owl': '🦉',
    'frog': '🐸', 'snake': '🐍', 'turtle': '🐢', 'fish': '🐠', 'shark': '🦈',
    'dolphin': '🐬', 'whale': '🐳', 'octopus': '🐙', 'butterfly': '🦋', 'bee': '🐝',
    'ladybug': '🐞', 'spider': '🕷️', 'monkey': '🐵', 'gorilla': '🦍', 'sloth': '🦥'
  };
  
  const emoji = animalEmojis[student.animal.toLowerCase()] || '🐾';
  
  console.log(`✨ Creating emoji avatar for ${student.name} (${student.animal}) -> ${emoji}`);
  
  // Create a beautiful SVG with the emoji as fallback - updated for multiple traits
  const personalitiesText = student.personalities.join(' • ');
  const likesText = student.likes.join(' • ');
  
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e3f2fd;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bbdefb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" rx="20"/>
      <circle cx="200" cy="160" r="80" fill="#ffffff" opacity="0.3"/>
      <text x="200" y="180" font-family="Arial, sans-serif" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      <text x="200" y="260" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#1565c0">${student.name}</text>
      <text x="200" y="280" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#1976d2">${student.animal}</text>
      <text x="200" y="305" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#42a5f5">${personalitiesText}</text>
      <text x="200" y="325" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#42a5f5">Loves: ${likesText}</text>
    </svg>
  `;
  
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  console.log(`✅ Generated emoji avatar data URL (${dataUrl.length} chars)`);
  
  return dataUrl;
}

export async function generateImagesForAllStudents(students: Student[]): Promise<{ studentId: number; imageUrl: string; error?: string }[]> {
  const results: { studentId: number; imageUrl: string; error?: string }[] = [];
  
  for (const student of students) {
    try {
      if (!student.isImageGenerated && student.id) {
        console.log(`🎨 Generating image for ${student.name}...`);
        const imageUrl = await generateAnimalImage(student);
        results.push({ studentId: student.id, imageUrl });
      }
    } catch (error) {
      console.error(`❌ Failed to generate image for ${student.name}:`, error);
      results.push({ 
        studentId: student.id || 0, 
        imageUrl: generateEmojiAvatar(student), 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
} 