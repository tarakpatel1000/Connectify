import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const connectDatabase = await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDb connected successfully");
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

export default connectDb;