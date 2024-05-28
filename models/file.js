import {Model, Schema } from "mongoose";
const FileSchema = new Schema({
    title:     {type: String, required:true, unique},
    downloads: {type:String, required:true},
    emailSent: {type:String, required: true},
    filePath:  {type:String, required:true},
    fileName:  {type:String, required:true},
    extension: {type:String, required:true},
    updatedAt: {type:Date, default:Date.now},
    uploaded_by:{type:String, required:true}//fk to users

})

//create a model
let FileModel = Model("File", FileSchema)
export {FileModel}
