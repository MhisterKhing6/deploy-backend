import {model, Schema } from "mongoose";
const UserSchema = new Schema({
    name:{type: String, required:true},
    passwordHash: {type:String, required:true},
    email: {type:String, required: true, unique:true},
    emailVerified: {type:Boolean, required: true, default:false},
    role: {type:String, require:true, enum:['customer', 'admin'], default:"customer"}
})

//create a model
let UserModel = model("User", UserSchema)
export {UserModel}
