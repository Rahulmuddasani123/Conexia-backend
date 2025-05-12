const mongoose=require('mongoose')

// Async Function to connect with the database using connection string

const connectDB = async ()=>{
    await mongoose.connect(
      "mongodb+srv://Rahul:MongoDBRahul@maincluster.clgoadc.mongodb.net/devTinder"
    );
}

module.exports= connectDB
