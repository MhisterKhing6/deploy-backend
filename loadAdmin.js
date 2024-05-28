import { UserModel } from "./models/user.js";
import { connectDb } from "./utils/MongodbConector.js";
import sha1 from "sha1"
let user = {name:"kingsley", emailVerified:true, passwordHash:sha1("987521"), email:"autoccoder@gmail.com", "role":"admin"};
(async () => {
    console.log("starting")
try{
    await connectDb()
    await new UserModel(user).save()
    console.log("done")
} catch(err){
    console.log(err)
}
})()