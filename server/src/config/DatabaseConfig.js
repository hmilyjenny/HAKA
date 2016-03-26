 const dbConfig = {
     mongoURL: process.env.MONGO_URL || 'mongodb://localhost:12345/haka',
     redisClientPort: 12345
 };
 export default dbConfig;