import sqlite3 from 'sqlite3';
import { Student } from '../types';

// Environment variables - Create a .env.local file with:
// DATABASE_URL=./students.db
// HUGGINGFACE_API_TOKEN=your_token_here

const dbPath = process.env.DATABASE_URL || './students.db';

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // First, check if table exists and what columns it has
    this.db.all(`PRAGMA table_info(students)`, [], (err, columns: any[]) => {
      if (err) {
        console.error('Error checking table info:', err.message);
        return;
      }

      if (columns.length === 0) {
        // Table doesn't exist, create with new schema
        this.createNewTable();
      } else {
        // Table exists, check if we need to migrate
        const hasPersonalities = columns.some(col => col.name === 'personalities');
        const hasOldPersonality = columns.some(col => col.name === 'personality');
        
        if (!hasPersonalities && hasOldPersonality) {
          console.log('Migrating existing data to new format...');
          this.migrateFromOldSchema();
        } else if (!hasPersonalities) {
          // Add missing columns
          this.addMissingColumns();
        } else {
          console.log('Database initialized successfully');
        }
      }
    });
  }

  private createNewTable(): void {
    const createTableSQL = `
      CREATE TABLE students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        animal TEXT NOT NULL,
        personalities TEXT NOT NULL DEFAULT '[]',
        likes TEXT NOT NULL DEFAULT '[]',
        motto TEXT,
        attributes TEXT NOT NULL DEFAULT '',
        imageUrl TEXT,
        isImageGenerated BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Database initialized successfully');
      }
    });
  }

  private addMissingColumns(): void {
    this.db.run(`ALTER TABLE students ADD COLUMN personalities TEXT DEFAULT '[]'`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding personalities column:', err.message);
      }
    });
    
    this.db.run(`ALTER TABLE students ADD COLUMN likes TEXT DEFAULT '[]'`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding likes column:', err.message);
      }
    });

    this.db.run(`ALTER TABLE students ADD COLUMN motto TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding motto column:', err.message);
      } else {
        console.log('Database initialized successfully');
      }
    });
  }

  private migrateFromOldSchema(): void {
    // Read all existing data
    this.db.all(`SELECT * FROM students`, [], (err, rows: any[]) => {
      if (err) {
        console.error('Error reading existing data:', err.message);
        return;
      }

      // Create new table with correct schema
      const createNewTableSQL = `
        CREATE TABLE students_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          animal TEXT NOT NULL,
          personalities TEXT NOT NULL DEFAULT '[]',
          likes TEXT NOT NULL DEFAULT '[]',
          motto TEXT,
          attributes TEXT NOT NULL DEFAULT '',
          imageUrl TEXT,
          isImageGenerated BOOLEAN DEFAULT FALSE,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createNewTableSQL, (err) => {
        if (err) {
          console.error('Error creating new table:', err.message);
          return;
        }

        // Migrate data
        const insertPromises = rows.map((row) => {
          return new Promise<void>((resolve, reject) => {
            const personalities = row.personality ? [row.personality] : [];
            const likes = row.likes ? [row.likes] : [];
            
            const insertSQL = `
              INSERT INTO students_new (name, animal, personalities, likes, motto, attributes, imageUrl, isImageGenerated, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            this.db.run(insertSQL, [
              row.name,
              row.animal,
              JSON.stringify(personalities),
              JSON.stringify(likes),
              row.motto || null,
              row.attributes || '',
              row.imageUrl,
              row.isImageGenerated || false,
              row.createdAt
            ], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });

        Promise.all(insertPromises).then(() => {
          // Drop old table and rename new one
          this.db.run(`DROP TABLE students`, (err) => {
            if (err) {
              console.error('Error dropping old table:', err.message);
              return;
            }
            
            this.db.run(`ALTER TABLE students_new RENAME TO students`, (err) => {
              if (err) {
                console.error('Error renaming table:', err.message);
              } else {
                console.log('Database migration completed successfully');
              }
            });
          });
        }).catch((err) => {
          console.error('Error migrating data:', err.message);
        });
      });
    });
  }

  public addStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO students (name, animal, personalities, likes, motto, attributes, imageUrl, isImageGenerated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const personalitiesJson = JSON.stringify(student.personalities || []);
      const likesJson = JSON.stringify(student.likes || []);
      
      this.db.run(
        sql,
        [student.name, student.animal, personalitiesJson, likesJson, student.motto || null, student.attributes || '', student.imageUrl || null, student.isImageGenerated || false],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  public getStudentByName(name: string): Promise<Student | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM students WHERE name = ?';
      
      this.db.get(sql, [name], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const student: Student = {
              id: row.id,
              name: row.name,
              animal: row.animal,
              personalities: this.parseJsonArray(row.personalities || row.personalities_new, row.personality),
              likes: this.parseJsonArray(row.likes || row.likes_new, row.likes),
              motto: row.motto,
              attributes: row.attributes,
              imageUrl: row.imageUrl,
              isImageGenerated: Boolean(row.isImageGenerated),
              createdAt: new Date(row.createdAt)
            };
            resolve(student);
          } catch (parseErr) {
            reject(parseErr);
          }
        }
      });
    });
  }

  public updateStudent(studentId: number, student: Omit<Student, 'id' | 'createdAt'>): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE students 
        SET name = ?, animal = ?, personalities = ?, likes = ?, motto = ?, attributes = ?, imageUrl = ?, isImageGenerated = ?
        WHERE id = ?
      `;
      
      const personalitiesJson = JSON.stringify(student.personalities || []);
      const likesJson = JSON.stringify(student.likes || []);

      this.db.run(
        sql,
        [student.name, student.animal, personalitiesJson, likesJson, student.motto || null, student.attributes || '', student.imageUrl || null, student.isImageGenerated || false, studentId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public getAllStudents(): Promise<Student[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM students ORDER BY createdAt ASC';
      
      this.db.all(sql, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const students: Student[] = rows.map(row => ({
              id: row.id,
              name: row.name,
              animal: row.animal,
              personalities: this.parseJsonArray(row.personalities || row.personalities_new, row.personality),
              likes: this.parseJsonArray(row.likes || row.likes_new, row.likes),
              motto: row.motto,
              attributes: row.attributes,
              imageUrl: row.imageUrl,
              isImageGenerated: Boolean(row.isImageGenerated),
              createdAt: new Date(row.createdAt)
            }));
            resolve(students);
          } catch (parseErr) {
            reject(parseErr);
          }
        }
      });
    });
  }

  public updateStudentImage(studentId: number, imageUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE students SET imageUrl = ?, isImageGenerated = TRUE WHERE id = ?';
      
      this.db.run(sql, [imageUrl, studentId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public getStudentById(id: number): Promise<Student | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM students WHERE id = ?';
      
      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const student: Student = {
              id: row.id,
              name: row.name,
              animal: row.animal,
              personalities: this.parseJsonArray(row.personalities || row.personalities_new, row.personality),
              likes: this.parseJsonArray(row.likes || row.likes_new, row.likes),
              motto: row.motto,
              attributes: row.attributes,
              imageUrl: row.imageUrl,
              isImageGenerated: Boolean(row.isImageGenerated),
              createdAt: new Date(row.createdAt)
            };
            resolve(student);
          } catch (parseErr) {
            reject(parseErr);
          }
        }
      });
    });
  }

  public clearAllStudents(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM students';
      
      this.db.run(sql, [], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private parseJsonArray(jsonValue: string, fallbackValue?: string): string[] {
    if (jsonValue) {
      try {
        const parsed = JSON.parse(jsonValue);
        return Array.isArray(parsed) ? parsed : [jsonValue];
      } catch (e) {
        // If it's not valid JSON, treat as single value
        return [jsonValue];
      }
    }
    
    // Handle migration case where we might have old single values
    if (fallbackValue) {
      return [fallbackValue];
    }
    
    return [];
  }

  public close(): void {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: Database;

export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
} 