import {assert} from "chai";
import { UserModel } from "../models/user.js";
import request from "supertest"
import { connectDb } from "../utils/MongodbConector.js";
import { fileServer } from "../server.js";
import sha1 from "sha1"
import { generateSecretNumber } from "../utils/VerificationFunctions.js";
import { VerifTokenModel } from "../models/verifyToken.js";
import { ObjectId } from "mongodb";

describe("Verify user through email",  () => {
let unverifiedCustomer = {"name": "text2", "password": "text3333", "email": "unveritext32@gmail.com", "type": "customer"}
let passwordHash = sha1(unverifiedCustomer.password)
let verificationCode = generateSecretNumber()
let verificationEntry = null
before(async () => {
    await connectDb()
    let user = await new UserModel({...unverifiedCustomer, passwordHash}).save()
    //verification entry
    verificationEntry = await new VerifTokenModel({verificationCode, userId:user._id.toString(), type:"email"}).save()
})

after(async () => {
    await UserModel.deleteMany()
    await VerifTokenModel.deleteMany()
})

it("should return numbers dont match with 400 status code", async () => {
    let response = await request(fileServer).post("/auth/verify/customer").type('json').send({verificationId:verificationEntry._id.toString(), verificationCode: "wrong number"})
    assert.equal(response.status, 400)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "numbers dont match")
})

it("should return id, message and 200 status code", async () => {
    let verificationPayload = {"verificationId":verificationEntry._id.toString(), verificationCode}
    let response = await request(fileServer).post("/auth/verify/customer").type('json').send(verificationPayload)
    let verifiedUser= await UserModel.findOne({email: unverifiedCustomer.email})
    assert.equal(response.status, 200)
    assert.isDefined(response.body.id)
    assert.isString(response.body.message)
    assert.isTrue(verifiedUser.emailVerified)
})

it("should return filds missing with 400 status code", async () => {
    let response = await request(fileServer).post("/auth/verify/customer").type('json').send({"email": ""})
    assert.equal(response.status, 400)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "fields missing")
})



it("should return no verification entry found, with 401 status code ", async () => {
    let wrongId = new  ObjectId().toString()
    let wrongVerificationDetails  = {verificationId: wrongId, verificationCode}
    let response = await request(fileServer).post("/auth/verify/customer").type('json').send(wrongVerificationDetails)
    assert.equal(response.status, 401)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "no verification entry found")
})


})