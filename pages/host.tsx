import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Student } from '../types';

export default function HostDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const result = await response.json();
      
      if (result.success) {
        setStudents(result.data);
      } else {
        setError(result.error || 'Failed to fetch students');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  const clearAllStudents = async () => {
    if (!confirm('Are you sure you want to clear all student data? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setStudents([]);
      } else {
        setError(result.error || 'Failed to clear students');
      }
    } catch (err) {
      setError('Network error while clearing data.');
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Host Dashboard - Animal Introduction Game</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎮 Host Dashboard - Animal Introduction Game
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                Total Students: {students.length}
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                🎨 Images Auto-Generated!
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={fetchStudents}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                🔄 Refresh
              </button>

              <button
                onClick={clearAllStudents}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}
        </div>

        {/* Students Grid */}
        {students.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Yet</h2>
            <p className="text-gray-600">
              Share the main page URL with your students so they can submit their introductions!
            </p>
            <div className="mt-4 bg-gray-100 p-3 rounded-lg">
              <code className="text-sm">{typeof window !== 'undefined' ? window.location.origin : 'your-domain.com'}</code>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map((student) => (
              <div key={student.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Image Section */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {student.isImageGenerated && student.imageUrl ? (
                    <img
                      src={student.imageUrl}
                      alt={`${student.name}'s ${student.animal}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎨</div>
                      <div className="text-sm text-gray-500">
                        Image Pending
                      </div>
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{student.name}</h3>
                    <span className="text-2xl">{
                      student.animal === 'Cat' ? '🐱' :
                      student.animal === 'Dog' ? '🐶' :
                      student.animal === 'Rabbit' ? '🐰' :
                      student.animal === 'Fox' ? '🦊' :
                      student.animal === 'Bear' ? '🐻' :
                      student.animal === 'Panda' ? '🐼' :
                      student.animal === 'Lion' ? '🦁' :
                      student.animal === 'Tiger' ? '🐯' :
                      student.animal === 'Elephant' ? '🐘' :
                      '🐾'
                    }</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Animal:</span> {student.animal}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Personalities:</span> 
                    <div className="mt-1">
                      {student.personalities && student.personalities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {student.personalities.map((trait, index) => (
                            <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {trait}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">
                          {(student as any).personality || 'No traits specified'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Interests:</span>
                    <div className="mt-1">
                      {student.likes && student.likes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {student.likes.map((hobby, index) => (
                            <span key={index} className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                              {hobby}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">
                          {(student as any).likes || 'No interests specified'}
                        </span>
                      )}
                    </div>
                  </div>
                  


                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      student.isImageGenerated 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.isImageGenerated ? '✅ Image Ready' : '⏳ Pending'}
                    </span>
                    
                    {student.createdAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">📋 Instructions for Hosts</h3>
          <ul className="list-disc list-inside text-blue-700 space-y-2">
            <li>Share the main page URL with students to collect their submissions</li>
            <li>🎨 <strong>Images are generated automatically</strong> when students submit their forms!</li>
            <li>Use "Refresh" to check for new student submissions and updated avatars</li>
            <li>Students can update their submissions anytime - it will replace their previous entry</li>
            <li>Display the generated images during your introduction activity</li>
            <li>Use "Clear All" to reset for a new session (⚠️ permanently deletes all data)</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 