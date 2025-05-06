import mongoose from 'mongoose';

const connectDB = async() => {
    // Enable automatic index creation (build schema-level indexes after cleanup)
    mongoose.set('autoIndex', true);
    
    mongoose.connection.on('connected', () => {
        console.log("DB connected!")
    });
    
    // Connect (autoIndex enabled)
    await mongoose.connect(
      `${process.env.MONGO_URI}/TeamDiamond`
    );
}

export default connectDB;