const mongoose = require("mongoose");

const redactMongoUri = (uri) =>
  uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+):[^@]+@/i, "$1:***@");

const connectDb = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }

  console.log("Connecting to MongoDB:", redactMongoUri(uri));
  await mongoose.connect(uri);
};

module.exports = { connectDb };
