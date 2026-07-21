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

export async function runFullMongoSeed(): Promise<void> {
  console.log('[Mongo Seeder] Starting full database seeding into MongoDB Atlas...');
  await mongoose.connect(config.mongoUri);
  console.log('[Mongo Seeder] Connected to MongoDB Atlas!');

  const playersPath = findFile('players.csv.gz');
  const suppPath = findFile('supplementary.csv.gz');

  if (!playersPath || !suppPath) {
    console.error('[Mongo Seeder] CSV Gzip files not found!');
    process.exit(1);
  }

  // Clear existing collections for clean full dataset insert
  console.log('[Mongo Seeder] Clearing existing collections for full clean dataset import...');
  await PlayerRecordModel.deleteMany({});
  await SupplementaryDataModel.deleteMany({});

  console.log(`[Mongo Seeder] Importing ${path.basename(playersPath)} (170k+ player records)...`);
  await seedFileToCollection(playersPath, PlayerRecordModel);

  console.log(`[Mongo Seeder] Importing ${path.basename(suppPath)} (21k+ supplementary records)...`);
  await seedFileToCollection(suppPath, SupplementaryDataModel);

  const finalPCount = await PlayerRecordModel.countDocuments();
  const finalSCount = await SupplementaryDataModel.countDocuments();

  console.log(`==================================================`);
  console.log(`  MongoDB Atlas Seeding Complete!`);
  console.log(`  -> Player Records: ${finalPCount.toLocaleString()}`);
  console.log(`  -> Supplementary Records: ${finalSCount.toLocaleString()}`);
  console.log(`==================================================`);
}

function seedFileToCollection(filePath: string, model: mongoose.Model<any>): Promise<void> {
  return new Promise((resolve, reject) => {
    let batch: any[] = [];
    const BATCH_SIZE = 5000;
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
          console.log(`[Mongo Seeder] Uploaded ${totalInserted.toLocaleString()} documents to ${model.collection.name}...`);
        } catch (e: any) {
          // ignore batch duplicate errors
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
      console.log(`[Mongo Seeder] Finished uploading ${totalInserted.toLocaleString()} documents to ${model.collection.name}.`);
      resolve();
    });

    readStream.on('error', (err) => reject(err));
  });
}

if (require.main === module) {
  runFullMongoSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Mongo Seeder Error]', err);
      process.exit(1);
    });
}
