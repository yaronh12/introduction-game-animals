import type { NextApiRequest, NextApiResponse } from 'next';
import { getDatabase } from '../../lib/database';
import { generateImagesForAllStudents } from '../../lib/imageGeneration';
import { APIResponse } from '../../types';

interface GenerationResult {
  success: boolean;
  totalStudents: number;
  generatedImages: number;
  errors: string[];
  results: { studentId: number; imageUrl: string; error?: string }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<GenerationResult>>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} Not Allowed` 
    });
  }

  const db = getDatabase();

  try {
    // Get all students who don't have images yet
    const allStudents = await db.getAllStudents();
    const studentsNeedingImages = allStudents.filter(student => !student.isImageGenerated);

    if (studentsNeedingImages.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          success: true,
          totalStudents: allStudents.length,
          generatedImages: 0,
          errors: [],
          results: []
        }
      });
    }

    console.log(`Generating images for ${studentsNeedingImages.length} students...`);

    // Generate images for all students
    const results = await generateImagesForAllStudents(studentsNeedingImages);
    
    let generatedCount = 0;
    const errors: string[] = [];

    // Update database with generated images
    for (const result of results) {
      if (result.imageUrl && !result.error) {
        try {
          await db.updateStudentImage(result.studentId, result.imageUrl);
          generatedCount++;
        } catch (dbError) {
          console.error(`Failed to update student ${result.studentId}:`, dbError);
          errors.push(`Failed to save image for student ${result.studentId}`);
        }
      } else if (result.error) {
        errors.push(`Student ${result.studentId}: ${result.error}`);
      }
    }

    const generationResult: GenerationResult = {
      success: generatedCount > 0,
      totalStudents: studentsNeedingImages.length,
      generatedImages: generatedCount,
      errors,
      results
    };

    res.status(200).json({ success: true, data: generationResult });
  } catch (error) {
    console.error('Image generation API error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate images' 
    });
  }
} 