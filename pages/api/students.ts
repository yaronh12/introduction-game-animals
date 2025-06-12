import type { NextApiRequest, NextApiResponse } from 'next';
import { getCloudDatabase } from '../../lib/database-cloud';
import { generateAnimalImage } from '../../lib/imageGeneration';
import { Student, APIResponse } from '../../types';

interface FlexibleFormData {
  name: string;
  animal: string;
  personalities: string[] | string;
  likes: string[] | string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Student[] | Student>>
) {
  const db = getCloudDatabase();

  try {
    if (req.method === 'GET') {
      const { name } = req.query;
      
      if (name && typeof name === 'string') {
        // Get specific student by name
        const student = await db.getStudentByName(name);
        if (!student) {
          return res.status(404).json({ 
            success: false, 
            error: 'Student not found' 
          });
        }
        res.status(200).json({ success: true, data: [student] });
      } else {
        // Get all students
        const students = await db.getAllStudents();
        res.status(200).json({ success: true, data: students });
      }
    } else if (req.method === 'POST') {
      // Add new student
      const formData: FlexibleFormData = req.body;
      
      // Validate required fields
      if (!formData.name || !formData.animal || !formData.personalities || !formData.likes) {
        return res.status(400).json({ 
          success: false, 
          error: 'All fields are required: name, animal, personalities, likes' 
        });
      }

      // Parse text input if it's a string (split by commas)
      let personalities: string[] = [];
      let likes: string[] = [];

      if (typeof formData.personalities === 'string') {
        personalities = formData.personalities.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0);
      } else if (Array.isArray(formData.personalities)) {
        personalities = formData.personalities.filter((p: string) => typeof p === 'string' && p.trim().length > 0);
      }

      if (typeof formData.likes === 'string') {
        likes = formData.likes.split(',').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
      } else if (Array.isArray(formData.likes)) {
        likes = formData.likes.filter((l: string) => typeof l === 'string' && l.trim().length > 0);
      }

      // Validate arrays
      if (personalities.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'At least one personality trait is required' 
        });
      }

      if (likes.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'At least one hobby/interest is required' 
        });
      }

      // Create student object
      const newStudent: Omit<Student, 'id' | 'createdAt'> = {
        name: formData.name.trim(),
        animal: formData.animal,
        personalities: personalities,
        likes: likes,
        isImageGenerated: false,
      };

      // Check if student already exists (to update instead of duplicate)
      const existingStudent = await db.getStudentByName(formData.name.trim());
      
      let studentId: number;

      if (existingStudent) {
        // Update existing student
        console.log(`Updating existing student: ${formData.name}`);
        studentId = existingStudent.id!;
      } else {
        // Create new student
        console.log(`Creating new student: ${formData.name}`);
        studentId = await db.addStudent(newStudent);
      }
      
      // Generate image immediately for the student
      try {
        console.log(`🎨 Generating image immediately for ${newStudent.name}...`);
        const imageUrl = await generateAnimalImage({
          ...newStudent,
          id: studentId,
          createdAt: new Date()
        });
        console.log(`🔄 Updating database with image URL (${imageUrl.length} chars)...`);
        await db.updateStudentImage(studentId, imageUrl);
        
        // Get updated student with image
        const updatedStudent = await db.getStudentByName(newStudent.name);
        console.log(`✅ Student updated successfully. Image generated: ${updatedStudent?.isImageGenerated}`);
        res.status(201).json({ 
          success: true, 
          data: updatedStudent!
        });
      } catch (imageError) {
        console.error('Failed to generate image for student:', imageError);
        // Still return the student even if image generation fails
        const student = await db.getStudentByName(newStudent.name);
        res.status(201).json({ 
          success: true, 
          data: student!,
          error: 'Student created but image generation failed'
        });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
} 