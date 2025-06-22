export interface Student {
  id?: number;
  name: string;
  animal: string;
  personalities: string[];
  likes: string[];
  motto?: string; // New field for student's animal motto
  attributes?: string; // Optional for backward compatibility
  imageUrl?: string;
  createdAt?: Date;
  isImageGenerated?: boolean;
}

export interface AnimalOption {
  id: string;
  name: string;
  emoji: string;
}

export interface FormData {
  name: string;
  animal: string;
  personalities: string[];
  likes: string[];
  motto?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  studentId: number;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  success: boolean;
}

// New interfaces for personality traits and hobbies
export interface PersonalityTrait {
  id: string;
  name: string;
  emoji: string;
}

export interface Hobby {
  id: string;
  name: string;
  emoji: string;
} 