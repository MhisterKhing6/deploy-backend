import {assert} from "chai";
import { UserModel } from "../models/user.js";
import request from "supertest"
import { connectDb } from "../utils/MongodbConector.js";
import { fileServer } from "../server.js";
import sha1 from "sha1"
import { generateToken } from "../utils/WebTokenController.js";



describe("gettin token for file download",  () => {
let verifiedCustomer = {"name": "text2", "password": "text3333", "email": "text323@gmail.com", "role": "admin", "emailVerified": true}
let passwordHash = sha1(verifiedCustomer.password)
let authToken = null
let user = null


before(async () => {
    await connectDb()
    //register user with admin previlages
    user = await new UserModel({...verifiedCustomer, passwordHash}).save()
    //get token for user login
    authToken = generateToken({...user})
    //delete all files in the database
})

after(async () => {
    await UserModel.deleteOne({_id: user._id})

})

it("should return message about pagination information  and 200 status code", async () => {
    let response = await request(fileServer)
    .get("/user/file/download/token")
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    assert.equal(response.status, 200)
    assert.isString(response.body.token)
    })
})