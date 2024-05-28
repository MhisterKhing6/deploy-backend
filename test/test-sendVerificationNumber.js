import {assert} from "chai";
import { UserModel } from "../models/user.js";
import request from "supertest"
import { connectDb } from "../utils/MongodbConector.js";
import { fileServer } from "../server.js";
import sha1 from "sha1"
import { VerifTokenModel } from "../models/verifyToken.js";

describe("sending user verification code",  () => {
let unverifiedCustomer = {"name": "text2", "password": "text3333", "email": "unveritext32@gmail.com", "type": "customer"}
let passwordHash = sha1(unverifiedCustomer.password)
let user = null
before(async () => {
    await connectDb()
    user = await new UserModel({...unverifiedCustomer, passwordHash}).save()
})

after(async () => {
    await UserModel.deleteMany()
})

it("should return user hanst registerd with 400 status code", async () => {
    let url = `/auth//user/verification-number/email/${unverifiedCustomer.name}`
    let response = await request(fileServer).get(url).type('json')
    assert.equal(response.status, 401)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "user hasnt registered")
})

it("should return userId, verificationId and 200 status code", async () => {
    let url = `/auth//user/verification-number/email/${unverifiedCustomer.email}`
    let response = await request(fileServer).get(url)
    assert.equal(response.status, 200)
    assert.isDefined(response.body.userId)
    assert.isString(response.body.verificationId)
    let verificationDb = await VerifTokenModel.findOne({userId: user._id.toString()})
    assert.isNotNull(verificationDb)
})

})