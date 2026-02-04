/**
 * MongoDB Connection Test Script
 * Run this to verify your database connection works
 * 
 * Usage: npx ts-node scripts/test-db-connection.ts
 */

import mongoose from 'mongoose';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGO_URI = process.env.MONGO_URI;

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  if (!MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI not found in .env.local');
    console.log('📝 Make sure your .env.local file exists and contains MONGO_URI');
    process.exit(1);
  }

  console.log('📋 Connection Details:');
  // Hide password in output
  const safeUri = MONGO_URI.replace(/:([^:@]{8})[^:@]+@/, ':****$1****@');
  console.log('   URI:', safeUri);
  console.log('');

  try {
    console.log('⏳ Connecting to MongoDB...');
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ SUCCESS! Connected to MongoDB');
    console.log('');
    console.log('📊 Connection Info:');
    console.log('   Database:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    console.log('   State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    console.log('');

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Collections in database:');
    if (collections.length === 0) {
      console.log('   (No collections yet - they will be created automatically)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    console.log('');

    // Test creating a collection if needed
    console.log('🧪 Testing write access...');
    const testDoc = await mongoose.connection.db.collection('_connection_test').insertOne({
      test: true,
      timestamp: new Date(),
    });
    console.log('✅ Write access confirmed');
    
    // Clean up test document
    await mongoose.connection.db.collection('_connection_test').deleteOne({ _id: testDoc.insertedId });
    
    console.log('');
    console.log('🎉 All tests passed! Your database is ready to use.');

  } catch (error: any) {
    console.error('❌ CONNECTION FAILED');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('💡 Common fixes:');
      console.log('   1. Check if your MongoDB Atlas cluster is paused');
      console.log('      → Go to https://cloud.mongodb.com and resume it');
      console.log('');
      console.log('   2. Whitelist your IP address in MongoDB Atlas');
      console.log('      → Network Access → Add IP Address → Add Current IP');
      console.log('');
      console.log('   3. Verify your connection string is correct');
      console.log('      → Database → Connect → Choose "Connect your application"');
      console.log('');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Fix:');
      console.log('   Your username or password is incorrect');
      console.log('   → Check your MONGO_URI in .env.local');
      console.log('');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('');
    console.log('👋 Disconnected from MongoDB');
  }
}

testConnection();
