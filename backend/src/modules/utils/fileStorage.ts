import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileStorage {
  static ensureDirectoryExistence(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  static loadFromFile<T>(filePath: string): T[] {
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
        return [];
      }

      const fileData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileData) as T[];
    } catch (error) {
      throw new InternalServerErrorException('Failed to load data from file');
    }
  }

  static saveToFile<T>(filePath: string, data: T[]): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      throw new InternalServerErrorException('Failed to save data to file');
    }
  }
}
