// MongoDB initialization script for sou-hyou database
print('Starting MongoDB initialization for sou-hyou database...');

// Switch to the sou-hyou database
db = db.getSiblingDB('sou-hyou');

// Create collections with initial structure
db.createCollection('users');
db.createCollection('racesheets');
db.createCollection('folders');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ uid: 1 }, { unique: true });

db.racesheets.createIndex({ userId: 1 });
db.racesheets.createIndex({ createdAt: -1 });
db.racesheets.createIndex({ 'raceInfo.date': -1 });

db.folders.createIndex({ userId: 1 });
db.folders.createIndex({ name: 1 });

print('MongoDB initialization completed successfully!');
print('Created collections: users, racesheets, folders');
print('Created indexes for performance optimization');