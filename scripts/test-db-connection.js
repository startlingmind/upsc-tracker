/**
 * MongoDB Connection Test Script
 * Run this to test your MongoDB connection independently
 * 
 * Usage: node scripts/test-db-connection.js
 */

const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config({ path: '.env.local' });

// 🔧 FORCE RELIABLE DNS SERVERS (Google & Cloudflare)
// This bypasses ISP DNS issues that cause ECONNREFUSED errors
dns.setServers([
  '8.8.8.8',       // Google DNS Primary
  '8.8.4.4',       // Google DNS Secondary
  '1.1.1.1',       // Cloudflare DNS Primary
  '1.0.0.1',       // Cloudflare DNS Secondary
]);

// Set DNS to IPv4 first
dns.setDefaultResultOrder('ipv4first');

const MONGO_URI = process.env.MONGO_URI;

console.log('🧪 MongoDB Connection Test');
console.log('='.repeat(50));

if (!MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI not found in .env.local');
  process.exit(1);
}

console.log('📍 Connection String:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
console.log('\n🔄 Attempting connection...\n');

const opts = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4
};

mongoose.connect(MONGO_URI, opts)
  .then(() => {
    console.log('✅ SUCCESS! MongoDB Connected');
    console.log('📊 Database Name:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔢 Port:', mongoose.connection.port);
    console.log('\n✨ Connection test passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ FAILED! Connection Error');
    console.error('📝 Error Message:', error.message);
    console.error('🔍 Error Code:', error.code);
    console.error('🔍 System Call:', error.syscall);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible Solutions:');
      console.log('   1. Check if your MongoDB cluster is paused (resume it in MongoDB Atlas)');
      console.log('   2. Verify IP whitelist includes 0.0.0.0/0 or your current IP');
      console.log('   3. Check your connection string format');
      console.log('   4. Try flushing DNS cache: ipconfig /flushdns (Windows)');
      console.log('   5. Restart your router/network connection');
    }
    
    process.exit(1);
  });
