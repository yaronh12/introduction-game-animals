import { Student } from '../types';

// Simple in-memory database for cloud deployment
let students: Student[] = [];
let nextId = 1;

// Cloud-compatible database adapter
export class CloudDatabase {
  private initialized: boolean = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🗄️ Initializing in-memory database for cloud deployment...');
    students = [];
    nextId = 1;
    this.initialized = true;
    console.log('✅ In-memory database initialized successfully');
  }

  public async addStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<number> {
    await this.initialize();
    
    const newStudent: Student = {
      id: nextId++,
      name: student.name,
      animal: student.animal,
      personalities: student.personalities || [],
      likes: student.likes || [],
      attributes: student.attributes || '',
      imageUrl: student.imageUrl || undefined,
      isImageGenerated: student.isImageGenerated || false,
      createdAt: new Date()
    };
    
    students.push(newStudent);
    console.log(`✅ Added student: ${newStudent.name} (ID: ${newStudent.id})`);
    return newStudent.id!;
  }

  public async getStudent(name: string): Promise<Student | null> {
    await this.initialize();
    
    // Find the most recent student with this name
    const student = students
      .filter(s => s.name === name)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })[0];
    
    return student || null;
  }

  public async updateStudentImage(studentId: number, imageUrl: string): Promise<void> {
    await this.initialize();
    
    const student = students.find(s => s.id === studentId);
    if (student) {
      student.imageUrl = imageUrl;
      student.isImageGenerated = true;
      console.log(`✅ Updated image for student ID ${studentId}`);
    }
  }

  public async getAllStudents(): Promise<Student[]> {
    await this.initialize();
    
    // Return a copy sorted by creation date (newest first)
    return [...students].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  private parseJsonArray(jsonString: string): string[] {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

// Export a singleton instance
export const cloudDb = new CloudDatabase(); 