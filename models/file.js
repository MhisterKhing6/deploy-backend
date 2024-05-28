import {model, Schema } from "mongoose";
const FileSchema = new Schema({
    title:     {type: String, required:true, unique:true},
    description:   {type: String, required:true},
    downloads: {type: Number, default: 0},
    emailSent: {type:Number, default: 0},
    filePath:  {type:String, required:true},
    updatedAt: {type:Date, default:Date.now},
    uploadedBy:{type:String, required:true}//fk to users

})

//create a model
let FileModel = model("File", FileSchema)
export {FileModel}
