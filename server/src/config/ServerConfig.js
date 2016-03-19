const config = {
  db: process.env.MONGO_URL || 'mongodb://localhost/HaKa',
  port: process.env.PORT || 3000,
};
export default config;
