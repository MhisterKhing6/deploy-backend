import {assert} from "chai";
import { UserModel } from "../models/user.js";
import request from "supertest"
import { connectDb } from "../utils/MongodbConector.js";
import { fileServer } from "../server.js";

describe("user controller route testing",  () => {
let testCustomer = {"name": "text2", "password": "text3333", "email": "text32@gmail.com", "type": "customer"}
before(async () => {
    await connectDb()
})

after(async () => {
    await UserModel.deleteMany()
})

it("should return, id and 201 status code", async () => {
    let response = await request(fileServer).post("/auth/register/customer").type('json').send(testCustomer)
    assert.equal(response.status, 201)
    assert.isDefined(response.body.id)
})

it("should return filds missing with 400 status code", async () => {
    let response = await request(fileServer).post("/auth/register/customer").type('json').send({"name": "customertest", "email": "custoerTest"})
    assert.equal(response.status, 400)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "fields missing")
})

it("should return user with the same email exist with 400 status code", async () => {
    let savedCustomer = {"name": "text2", "passwordHash": "text3333", "email": "test123@gmail.com"}
    await new UserModel(savedCustomer).save()
    let response = await request(fileServer).post("/auth/register/customer").type('json').send({"email":savedCustomer.email, password:"testPass", type:"customer", "name": "savedCustomer"})
    assert.equal(response.status, 400)
    assert.isDefined(response.body.message)
    assert.equal(response.body.message, "user with the same email already registered")
})
})