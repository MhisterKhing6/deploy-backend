import {assert} from "chai";
import { UserModel } from "../models/user.js";
import request from "supertest"
import { connectDb } from "../utils/MongodbConector.js";
import { fileServer } from "../server.js";
import sha1 from "sha1"
import { VerifTokenModel } from "../models/verifyToken.js";
import { generateSecretNumber } from "../utils/VerificationFunctions.js";
import { ObjectId } from "mongodb";

describe("check user verification number",  () => {
let unverifiedCustomer = {"name": "text2", "password": "text3333", "email": "unveritext32@gmail.com", "type": "customer"}
let passwordHash = sha1(unverifiedCustomer.password)
let verificationCode = generateSecretNumber()
let  verificationEntry = null
let url =  '/auth/user/check/verification'
let user = null
before(async () => {
    await connectDb()
    user = await new UserModel({...unverifiedCustomer, passwordHash}).save()
    verificationEntry = await new VerifTokenModel({verificationCode, userId:user._id.toString(), type:"email"}).save()
})

after(async () => {
    await UserModel.deleteMany()
    
})

it("should return fields missing with 400 status code", async () => {
    let response = await request(fileServer).post(url).type('json').send({"verification":""})
    assert.equal(response.status, 400)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "fields missing")
})

it("should return verificationId, message and 200 status code", async () => {
    let response = await request(fileServer).post(url).type("json").send({verificationId:verificationEntry.id, verificationCode})
    assert.equal(response.status, 200)
    assert.isString(response.body.verificationId)
    let verificationDb = await VerifTokenModel.findOne({_id:verificationEntry._id})
    assert.isNotNull(verificationDb)
    assert.isTrue(verificationDb.verified)
    })

it("should return no verification entry and 401 status code", async () => {
        let response = await request(fileServer).post(url).type("json").send({verificationId:new ObjectId().toString(), verificationCode})
        assert.equal(response.status, 401)
        assert.isString(response.body.message)
        assert.equal(response.body.message, "no verification entry found")
    })

it("should return message and 400 status code", async () => {
        let response = await request(fileServer).post(url).type("json").send({verificationId:verificationEntry._id, verificationCode: "wrong number"})
        assert.equal(response.status, 401)
        assert.isString(response.body.message)
        assert.equal(response.body.message, "numbers dont match")
    })

})