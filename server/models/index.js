const { MongoClient, ObjectId } = require('mongodb');

let db;
let client;

async function connectDB(uri) {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  await createIndexes();
  return db;
}

function getDB() {
  if (!db) throw new Error('Database not initialized. Call connectDB first.');
  return db;
}

async function createIndexes() {
  const database = getDB();
  
  await database.collection('school_settings').createIndex({ key: 1 }, { unique: true });
  await database.collection('admin_users').createIndex({ email: 1 }, { unique: true });
  await database.collection('students').createIndex({ name: 'text', class: 1, academicYear: 1 });
  await database.collection('teachers').createIndex({ name: 'text', subject: 1 });
  await database.collection('admission_inquiries').createIndex({ status: 1, createdAt: -1 });
  await database.collection('hero_slides').createIndex({ displayOrder: 1, isActive: 1 });
  await database.collection('gallery').createIndex({ category: 1, displayOrder: 1 });
  await database.collection('achievements').createIndex({ category: 1, year: -1 });
  await database.collection('academics').createIndex({ displayOrder: 1, isActive: 1 });
  await database.collection('activities').createIndex({ displayOrder: 1, isActive: 1 });
  await database.collection('statistics').createIndex({ displayOrder: 1 });
}

const collections = {
  schoolSettings: () => getDB().collection('school_settings'),
  adminUsers: () => getDB().collection('admin_users'),
  students: () => getDB().collection('students'),
  teachers: () => getDB().collection('teachers'),
  heroSlides: () => getDB().collection('hero_slides'),
  gallery: () => getDB().collection('gallery'),
  academics: () => getDB().collection('academics'),
  achievements: () => getDB().collection('achievements'),
  activities: () => getDB().collection('activities'),
  admissionInquiries: () => getDB().collection('admission_inquiries'),
  statistics: () => getDB().collection('statistics'),
  admissionGrades: () => getDB().collection('admission_grades'),
};

async function closeDB() {
  if (client) await client.close();
}

module.exports = {
  connectDB,
  getDB,
  closeDB,
  collections,
  ObjectId,
};