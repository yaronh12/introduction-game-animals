import { NextApiRequest, NextApiResponse } from 'next';
import { Student } from '../../types';
import { generateAnimalImage } from '../../lib/imageGeneration';
import { cloudDb } from '../../lib/database-cloud';

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Student>>
) {
  try {
    // Initialize database
    await cloudDb.initialize();
    console.log('Database initialized successfully');

    if (req.method === 'POST') {
      const { name, animal, personalities = [], likes = [] } = req.body;

      if (!name || !animal) {
        return res.status(400).json({
          success: false,
          error: 'Name and animal are required'
        });
      }

      console.log(`Creating new student: ${name}`);

      // Check if student already exists
      const existingStudent = await cloudDb.getStudent(name);
      
      let studentId: number;
      let student: Student;

      if (existingStudent) {
        console.log(`Updating existing student: ${name}`);
        student = existingStudent;
        studentId = student.id!;
        
        // Update the student data
        student.animal = animal;
        student.personalities = Array.isArray(personalities) ? personalities : [];
        student.likes = Array.isArray(likes) ? likes : [];
      } else {
        // Create new student
        studentId = await cloudDb.addStudent({
          name,
          animal,
          personalities: Array.isArray(personalities) ? personalities : [],
          likes: Array.isArray(likes) ? likes : [],
          attributes: '',
          imageUrl: undefined,
          isImageGenerated: false
        });

        student = (await cloudDb.getStudent(name))!;
      }

      // Generate image immediately
      console.log(`🎨 Generating image immediately for ${name}...`);
      
      try {
        const imageUrl = await generateAnimalImage(student);

        if (imageUrl) {
          await cloudDb.updateStudentImage(studentId, imageUrl);
          console.log(`✅ Student updated successfully. Image generated: ${!!imageUrl}`);
          
          // Get updated student
          const updatedStudent = await cloudDb.getStudent(name);
          if (updatedStudent) {
            student = updatedStudent;
          }
        }
      } catch (error) {
        console.error('Failed to generate image for student:', error);
        // Continue without image - don't fail the entire request
      }

      return res.status(200).json({
        success: true,
        data: student
      });

    } else if (req.method === 'GET') {
      const { name } = req.query;

      if (name && typeof name === 'string') {
        const student = await cloudDb.getStudent(name);
        
        if (!student) {
          return res.status(404).json({
            success: false,
            error: 'Student not found'
          });
        }

        return res.status(200).json({
          success: true,
          data: student
        });
      } else {
        // Get all students
        const students = await cloudDb.getAllStudents();
        
        return res.status(200).json({
          success: true,
          data: students as any
        });
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 