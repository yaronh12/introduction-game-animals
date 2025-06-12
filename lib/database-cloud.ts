import { Student } from '../types';

// Cloud-compatible database adapter
export class CloudDatabase {
  private isProduction: boolean;
  private db: any;
  private initialized: boolean = false;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production' || !!process.env.POSTGRES_URL;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    await this.initializeDatabase();
    this.initialized = true;
  }

  private async initializeDatabase(): Promise<void> {
    if (this.isProduction) {
      // Use Vercel Postgres in production
      try {
        const { sql } = require('@vercel/postgres');
        this.db = sql;
        await this.createPostgresTable();
      } catch (error) {
        console.warn('Vercel Postgres not available, falling back to SQLite');
        this.isProduction = false;
        await this.initializeSQLite();
      }
    } else {
      await this.initializeSQLite();
    }
  }

  private async initializeSQLite(): Promise<void> {
    const sqlite3 = require('sqlite3');
    const dbPath = process.env.DATABASE_URL || './students.db';
    this.db = new sqlite3.Database(dbPath);
    await this.createSQLiteTable();
  }

  private async createPostgresTable(): Promise<void> {
    try {
      await this.db`
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          animal VARCHAR(255) NOT NULL,
          personalities TEXT NOT NULL DEFAULT '[]',
          likes TEXT NOT NULL DEFAULT '[]',
          attributes TEXT NOT NULL DEFAULT '',
          imageUrl TEXT,
          isImageGenerated BOOLEAN DEFAULT FALSE,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('PostgreSQL database initialized successfully');
    } catch (error) {
      console.error('Error creating PostgreSQL table:', error);
    }
  }

  private createSQLiteTable(): Promise<void> {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          animal TEXT NOT NULL,
          personalities TEXT NOT NULL DEFAULT '[]',
          likes TEXT NOT NULL DEFAULT '[]',
          attributes TEXT NOT NULL DEFAULT '',
          imageUrl TEXT,
          isImageGenerated BOOLEAN DEFAULT FALSE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createTableSQL, (err: any) => {
        if (err) {
          console.error('Error creating SQLite table:', err.message);
          reject(err);
        } else {
          console.log('SQLite database initialized successfully');
          resolve();
        }
      });
    });
  }

  public async addStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<number> {
    await this.ensureInitialized();
    
    const personalitiesJson = JSON.stringify(student.personalities || []);
    const likesJson = JSON.stringify(student.likes || []);

    if (this.isProduction) {
      // PostgreSQL
      const result = await this.db`
        INSERT INTO students (name, animal, personalities, likes, attributes, imageUrl, isImageGenerated)
        VALUES (${student.name}, ${student.animal}, ${personalitiesJson}, ${likesJson}, ${student.attributes || ''}, ${student.imageUrl || null}, ${student.isImageGenerated || false})
        RETURNING id
      `;
      return result[0].id;
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO students (name, animal, personalities, likes, attributes, imageUrl, isImageGenerated)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        this.db.run(
          sql,
          [student.name, student.animal, personalitiesJson, likesJson, student.attributes || '', student.imageUrl || null, student.isImageGenerated || false],
          function(this: any, err: any) {
            if (err) {
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      });
    }
  }

  public async getStudentByName(name: string): Promise<Student | null> {
    await this.ensureInitialized();
    
    if (this.isProduction) {
      // PostgreSQL
      const result = await this.db`
        SELECT * FROM students WHERE name = ${name} ORDER BY createdAt DESC LIMIT 1
      `;
      
      if (result.length === 0) return null;
      
      const row = result[0];
      return {
        id: row.id,
        name: row.name,
        animal: row.animal,
        personalities: this.parseJsonArray(row.personalities),
        likes: this.parseJsonArray(row.likes),
        attributes: row.attributes || '',
        imageUrl: row.imageurl || null,
        isImageGenerated: row.isimaggenerated || false,
        createdAt: row.createdat
      };
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM students WHERE name = ? ORDER BY createdAt DESC LIMIT 1';
        
        this.db.get(sql, [name], (err: any, row: any) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve(null);
          } else {
            resolve({
              id: row.id,
              name: row.name,
              animal: row.animal,
              personalities: this.parseJsonArray(row.personalities),
              likes: this.parseJsonArray(row.likes),
              attributes: row.attributes || '',
              imageUrl: row.imageUrl || null,
              isImageGenerated: row.isImageGenerated || false,
              createdAt: row.createdAt
            });
          }
        });
      });
    }
  }

  public async updateStudentImage(studentId: number, imageUrl: string): Promise<void> {
    await this.ensureInitialized();
    
    if (this.isProduction) {
      // PostgreSQL
      await this.db`
        UPDATE students 
        SET imageUrl = ${imageUrl}, isImageGenerated = true 
        WHERE id = ${studentId}
      `;
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        const sql = 'UPDATE students SET imageUrl = ?, isImageGenerated = ? WHERE id = ?';
        
        this.db.run(sql, [imageUrl, true, studentId], (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }

  public async getAllStudents(): Promise<Student[]> {
    await this.ensureInitialized();
    
    if (this.isProduction) {
      // PostgreSQL
      const result = await this.db`
        SELECT * FROM students ORDER BY createdAt DESC
      `;
      
      return result.map((row: any) => ({
        id: row.id,
        name: row.name,
        animal: row.animal,
        personalities: this.parseJsonArray(row.personalities),
        likes: this.parseJsonArray(row.likes),
        attributes: row.attributes || '',
        imageUrl: row.imageurl || null,
        isImageGenerated: row.isimaggenerated || false,
        createdAt: row.createdat
      }));
    } else {
      // SQLite
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM students ORDER BY createdAt DESC';
        
        this.db.all(sql, [], (err: any, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const students = rows.map((row) => ({
              id: row.id,
              name: row.name,
              animal: row.animal,
              personalities: this.parseJsonArray(row.personalities),
              likes: this.parseJsonArray(row.likes),
              attributes: row.attributes || '',
              imageUrl: row.imageUrl || null,
              isImageGenerated: row.isImageGenerated || false,
              createdAt: row.createdAt
            }));
            resolve(students);
          }
        });
      });
    }
  }

  private parseJsonArray(jsonValue: string, fallbackValue?: string): string[] {
    if (!jsonValue) return fallbackValue ? [fallbackValue] : [];
    
    try {
      const parsed = JSON.parse(jsonValue);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
      console.error('Error parsing JSON array:', error);
      return fallbackValue ? [fallbackValue] : [];
    }
  }
}

// Export singleton instance
let dbInstance: CloudDatabase | null = null;

export function getCloudDatabase(): CloudDatabase {
  if (!dbInstance) {
    dbInstance = new CloudDatabase();
  }
  return dbInstance;
} 