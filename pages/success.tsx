import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Student } from '../types';

export default function Success() {
  const router = useRouter();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { name } = router.query;
    if (name && typeof name === 'string') {
      fetchStudentData(name);
    }
  }, [router.query]);

  const fetchStudentData = async (studentName: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students?name=${encodeURIComponent(studentName)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      
      const result = await response.json();
      
      // Handle the API response format: { success: true, data: [student] }
      if (!result.success || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error('Student not found');
      }
      
      const student = result.data[0]; // Get the first (and only) student from the array
      setStudentData(student);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    router.push('/');
  };

  const handleViewDashboard = () => {
    router.push('/host');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-xl flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
          Loading your character...
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6">{error || 'Something went wrong loading your character.'}</p>
          <button
            onClick={handleCreateAnother}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl text-center">
        <div className="text-6xl mb-6">🎉</div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, {studentData.name}!
        </h1>
        
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your AI-Generated Animal Character</h2>
          
          {/* Display Generated Image */}
          {studentData.imageUrl && studentData.imageUrl.startsWith('http') ? (
            <div className="mb-4">
              <img 
                src={studentData.imageUrl} 
                alt={`${studentData.name} as ${studentData.animal}`}
                className="rounded-lg shadow-lg max-w-sm w-full mx-auto"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('Image failed to load:', studentData.imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                ✨ AI-generated image created with DALL-E
              </p>
            </div>
          ) : (
            <div className="text-4xl mb-4">
              {getAnimalEmoji(studentData.animal)}
            </div>
          )}
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-2">🎭 Animal</h3>
              <p className="text-gray-600">{studentData.animal}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-2">✨ Personalities</h3>
              <p className="text-gray-600">{studentData.personalities.join(', ')}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-2">❤️ Likes</h3>
              <p className="text-gray-600">{studentData.likes.join(', ')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-100 border border-green-300 rounded-xl p-4 mb-6">
          <p className="text-green-800 font-medium">
            🎊 Your character has been created successfully!
          </p>
          <p className="text-green-700 text-sm mt-1">
            Your teacher can now see your animal character on the host dashboard.
            {studentData.imageUrl && studentData.imageUrl.startsWith('http') && (
              <span> Your unique AI-generated image is ready!</span>
            )}
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleCreateAnother}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
          >
            🎨 Create Another Character
          </button>
          
          <button
            onClick={handleViewDashboard}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105"
          >
            📊 View Host Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function getAnimalEmoji(animal: string): string {
  const animalEmojis: { [key: string]: string } = {
    'Cat': '🐱',
    'Dog': '🐶',
    'Lion': '🦁',
    'Tiger': '🐯',
    'Bear': '🐻',
    'Panda': '🐼',
    'Fox': '🦊',
    'Wolf': '🐺',
    'Rabbit': '🐰',
    'Horse': '🐴',
    'Unicorn': '🦄',
    'Cow': '🐮',
    'Pig': '🐷',
    'Sheep': '🐑',
    'Goat': '🐐',
    'Elephant': '🐘',
    'Giraffe': '🦒',
    'Zebra': '🦓',
    'Hippo': '🦛',
    'Rhino': '🦏',
    'Kangaroo': '🦘',
    'Koala': '🐨',
    'Sloth': '🦥',
    'Monkey': '🐒',
    'Gorilla': '🦍',
    'Chimpanzee': '🐵',
    'Orangutan': '🦧',
    'Lemur': '🦧',
    'Bat': '🦇',
    'Eagle': '🦅',
    'Owl': '🦉',
    'Duck': '🦆',
    'Swan': '🦢',
    'Penguin': '🐧',
    'Flamingo': '🦩',
    'Parrot': '🦜',
    'Peacock': '🦚',
    'Dove': '🕊️',
    'Chicken': '🐔',
    'Rooster': '🐓',
    'Turkey': '🦃',
    'Crocodile': '🐊',
    'Turtle': '🐢',
    'Lizard': '🦎',
    'Snake': '🐍',
    'Dragon': '🐉',
    'Dinosaur': '🦕',
    'T-Rex': '🦖',
    'Shark': '🦈',
    'Whale': '🐋',
    'Dolphin': '🐬',
    'Octopus': '🐙',
    'Squid': '🦑',
    'Jellyfish': '🪼',
    'Fish': '🐠',
    'Tropical Fish': '🐟',
    'Crab': '🦀',
    'Lobster': '🦞',
    'Shrimp': '🦐',
    'Bee': '🐝',
    'Butterfly': '🦋',
    'Ladybug': '🐞',
    'Spider': '🕷️',
    'Ant': '🐜',
    'Grasshopper': '🦗',
    'Snail': '🐌',
    'Worm': '🪱'
  };
  
  return animalEmojis[animal] || '🐾';
} 