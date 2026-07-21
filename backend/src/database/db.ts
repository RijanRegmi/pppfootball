import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import csvParser from 'csv-parser';
import { config } from '../config/env.config';
import { PlayerRecordModel, SupplementaryDataModel } from '../models/player.schema';

function findFile(filename: string): string {
  const rootPath = path.join(config.dataDir, filename);
  if (fs.existsSync(rootPath)) return rootPath;
  const dataSubpath = path.join(config.dataDir, 'data', filename);
  if (fs.existsSync(dataSubpath)) return dataSubpath;
  return '';
}

export async function initDatabase(): Promise<void> {
  console.log('[Database] Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Database] Connected successfully to MongoDB Atlas (pppfootball)!');

    // Check if data already exists in MongoDB
    const pCount = await PlayerRecordModel.countDocuments();
    const sCount = await SupplementaryDataModel.countDocuments();

    if (pCount > 0) {
      console.log(`[Database] MongoDB Atlas ready with ${pCount.toLocaleString()} player records + ${sCount.toLocaleString()} supplementary records.`);
      return;
    }

    console.log('[Database] Seeding initial dataset into MongoDB Atlas...');
    const playersPath = findFile('players.csv.gz');
    const suppPath = findFile('supplementary.csv.gz');

    if (playersPath) {
      console.log(`[Database] Seeding ${path.basename(playersPath)} to MongoDB...`);
      await seedGzipCsvToMongo(playersPath, PlayerRecordModel);
    }

    if (suppPath) {
      console.log(`[Database] Seeding ${path.basename(suppPath)} to MongoDB...`);
      await seedGzipCsvToMongo(suppPath, SupplementaryDataModel);
    }

    const finalPCount = await PlayerRecordModel.countDocuments();
    const finalSCount = await SupplementaryDataModel.countDocuments();
    console.log(`[Database] Successfully seeded ${finalPCount.toLocaleString()} player records + ${finalSCount.toLocaleString()} supplementary records into MongoDB Atlas!`);
  } catch (err) {
    console.error('[Database] MongoDB Atlas connection/seeding error:', err);
  }
}

function seedGzipCsvToMongo(filePath: string, model: mongoose.Model<any>): Promise<void> {
  return new Promise((resolve, reject) => {
    let batch: any[] = [];
    const BATCH_SIZE = 2500;
    let totalInserted = 0;

    const readStream = fs.createReadStream(filePath).pipe(zlib.createGunzip()).pipe(csvParser());

    readStream.on('data', async (row) => {
      batch.push(row);
      if (batch.length >= BATCH_SIZE) {
        readStream.pause();
        const toInsert = [...batch];
        batch = [];
        try {
          await model.insertMany(toInsert, { ordered: false });
          totalInserted += toInsert.length;
          console.log(`[Database] Seeded ${totalInserted.toLocaleString()} rows into ${model.collection.name}...`);
        } catch (e: any) {
          // Ignore duplicate errors
        }
        readStream.resume();
      }
    });

    readStream.on('end', async () => {
      if (batch.length > 0) {
        try {
          await model.insertMany(batch, { ordered: false });
          totalInserted += batch.length;
        } catch (e) {}
      }
      console.log(`[Database] Completed seeding ${totalInserted.toLocaleString()} rows to ${model.collection.name}.`);
      resolve();
    });

    readStream.on('error', (err) => reject(err));
  });
}
