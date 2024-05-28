import {assert} from "chai";
import { UserModel } from "../models/user.js";
import request from "supertest"
import { connectDb } from "../utils/MongodbConector.js";
import { fileServer } from "../server.js";
import sha1 from "sha1"

describe("user login",  () => {
let verifiedCustomer = {"name": "text2", "password": "text3333", "email": "text32@gmail.com", "type": "customer", "emailVerified": true}
let unverifiedCustomer = {"name": "text2", "password": "text3333", "email": "unveritext32@gmail.com", "type": "customer"}
let passwordHash = sha1(verifiedCustomer.password)
before(async () => {
    await connectDb()
    await new UserModel({...verifiedCustomer, passwordHash}).save()
})

after(async () => {
    await UserModel.deleteMany()
})

it("should return token, message and 200 status code", async () => {
    let response = await request(fileServer).post("/auth/login/user").type('json').send({email:verifiedCustomer.email, "password": verifiedCustomer.password})
    assert.equal(response.status, 200)
    assert.isDefined(response.body.token)
    assert.isString(response.body.message)
})

it("should return filds missing with 400 status code", async () => {
    let response = await request(fileServer).post("/auth/login/user").type('json').send({"email": ""})
    assert.equal(response.status, 400)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "fields missing")
})



it("should return user hasnt registered with status code 401", async () => {
    let unregisterded = {"password": "text3333", "email": "unknown@gmail.com"}
    let response = await request(fileServer).post("/auth/login/user").type('json').send(unregisterded)
    assert.equal(response.status, 401)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "user hasnt registered")
})

it("should return wrong user password code 401", async () => {
    let wrongPassword = {"password": "wrongPassword", "email": verifiedCustomer.email}
    let response = await request(fileServer).post("/auth/login/user").type('json').send(wrongPassword)
    assert.equal(response.status, 401)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "wrong passwrod")
})
it("should return user hasnt't registered with 401 status code", async () => {
    let wrongPassword = {"password": unverifiedCustomer.password, "email": unverifiedCustomer.email}
    await new UserModel({...unverifiedCustomer, passwordHash}).save()
    let response = await request(fileServer).post("/auth/login/user").type('json').send(wrongPassword)
    assert.equal(response.status, 401)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "user hasnt registered")
})
})