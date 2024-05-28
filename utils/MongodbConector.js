import mongoose from "mongoose";
import configuration from "config"


const connectDb = async () => {
    /**
     * connectDb : Connect database to mongodb instance
     * @param{string} connctionString: authentication string for database
     * returns: exit program execution if failed to connect else nothing otherwise
     */
    try {
        await mongoose.connect(configuration.db.connectionString, {autoIndex:true})
        console.log("connected to database")
    } catch(err){
        console.log(err)
        process.exit(1)
    }
    
}
export {connectDb}
