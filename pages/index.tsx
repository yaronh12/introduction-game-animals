import React, { useState } from 'react';
import { Student, AnimalOption } from '../types';
import { ANIMAL_OPTIONS } from '../lib/constants';

export default function Home() {
  const [formData, setFormData] = useState<{
    name: string;
    animal: string;
    personalities: string;
    likes: string;
    motto: string;
  }>({
    name: '',
    animal: '',
    personalities: '',
    likes: '',
    motto: ''
  });
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnimalSelect = (animal: AnimalOption) => {
    setSelectedAnimal(animal);
    setFormData(prev => ({
      ...prev,
      animal: animal.name
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.animal || !formData.personalities || !formData.likes) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert comma-separated strings to arrays for the API
      const personalities = formData.personalities.split(',').map(p => p.trim()).filter(p => p.length > 0);
      const likes = formData.likes.split(',').map(l => l.trim()).filter(l => l.length > 0);

      const studentData: Partial<Student> = {
        name: formData.name,
        animal: formData.animal,
        personalities,
        likes,
        motto: formData.motto.trim() || undefined
      };

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create student');
      }

      const result = await response.json();
      const student = result.data;
      // Redirect to success page with student data
      window.location.href = `/success?name=${encodeURIComponent(student.name)}`;
    } catch (error) {
      console.error('Error creating student:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 w-full max-w-4xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 lg:mb-4">
            🎭 Animal Introduction Game
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl">
            Create your unique animal character!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 lg:space-y-10">
          {/* Name Input */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-3">
              Your Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Animal Selection Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Choose Your Animal Spirit
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {ANIMAL_OPTIONS.map((animal) => (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => handleAnimalSelect(animal)}
                  className={`p-6 sm:p-7 md:p-8 rounded-2xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center min-h-[120px] sm:min-h-[130px] md:min-h-[140px] lg:min-h-[150px] ${
                    selectedAnimal?.id === animal.id
                      ? 'border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 shadow-xl transform scale-105'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 shadow-md'
                  }`}
                  title={animal.name}
                >
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 drop-shadow-sm">{animal.emoji}</div>
                  <div className="text-xs sm:text-sm md:text-base text-center text-gray-700 leading-tight font-semibold tracking-wide">
                    {animal.name}
                  </div>
                </button>
              ))}
            </div>
            {selectedAnimal && (
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 shadow-lg border border-purple-200">
                  ✨ Selected: {selectedAnimal.emoji} {selectedAnimal.name}
                </span>
              </div>
            )}
          </div>

          {/* Personalities Input */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-3">
              Your Personalities
            </label>
            <input
              type="text"
              value={formData.personalities}
              onChange={(e) => handleInputChange('personalities', e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="e.g., funny, creative, thoughtful"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Describe your personality traits - be creative!
            </p>
          </div>

          {/* Likes Input */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-3">
              Things You Like
            </label>
            <input
              type="text"
              value={formData.likes}
              onChange={(e) => handleInputChange('likes', e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="e.g., reading, sports, music, video games"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Tell us what you enjoy doing!
            </p>
          </div>

          {/* Motto Input */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-3">
              Your Animal's Motto <span className="text-sm text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.motto}
              onChange={(e) => handleInputChange('motto', e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="e.g., Always be curious, Live life to the fullest, Dream big!"
            />
            <p className="text-sm text-gray-500 mt-2">
              What's your animal character's life motto or favorite saying?
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
              <p className="text-red-600 text-base font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedAnimal}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-6 px-8 text-lg rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-white mr-4"></div>
                Creating Your Character...
              </div>
            ) : (
              '🎨 Create My Animal Character!'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}