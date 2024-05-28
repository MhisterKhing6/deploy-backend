
import { connectDb } from "../utils/MongodbConector.js"
import { UserModel } from "../models/user.js"
import {assert} from "chai"
describe("database CRUD operations and connection", () => {
    let testObject = {name: "testName", email: "tesstt@rrtest.com", emailVerified:true, passwordHash: "xxxxxxxxx"}
    let testObjectDb = null

    before(async () => {
        await connectDb()
        testObjectDb = new UserModel(testObject)
        await testObjectDb.save()
    })
    after(async() => {
       await UserModel.deleteOne({ _id: testObjectDb._id });
    })
    it("should save user instance in the database", async ()=>{
         let user = await UserModel.findOne({email:testObjectDb.email})
         assert.equal(user.name, testObject.name)
    })
})