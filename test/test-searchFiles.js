import {assert} from "chai";
import { UserModel } from "../models/user.js";
import request from "supertest"
import { connectDb } from "../utils/MongodbConector.js";
import { fileServer } from "../server.js";
import sha1 from "sha1"
import { generateToken } from "../utils/WebTokenController.js";
import { FileModel } from "../models/file.js";
import { promisify } from "util";
import path from "path";
import { rm} from "fs";

let rmAsync = promisify(rm)

describe("testing searching files",  () => {
let verifiedCustomer = {"name": "text2", "password": "text3333", "email": "text323@gmail.com", "role": "admin", "emailVerified": true}
let passwordHash = sha1(verifiedCustomer.password)
let authToken = null

let fileName = "fileName.txt"
let fileContent = "text file content"
let base64Content = Buffer.from(fileContent).toString("base64")
let fileEntry1 = {fileName, data:base64Content, title: "test for upload file 1", description: "test string content"}
let fileEntry2 = {fileName, data:base64Content, title: "test for upload file 2", description: "test string content"}
let fileEntry3 = {fileName, data:base64Content, title: "test for upload file 3", description: "test string content"}

before(async () => {
    await connectDb()
    //register user with admin previlages
    let user = await new UserModel({...verifiedCustomer, passwordHash}).save()
    //get token for user login
    authToken = generateToken({...user})
    //delete all files in the database
    await FileModel.deleteMany()
    await Promise.all([
        await request(fileServer)
    .post("/admin/upload-file")
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    .send(fileEntry1),
    await request(fileServer)
    .post("/admin/upload-file")
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    .send(fileEntry2)
    ])
})

after(async () => {
    await UserModel.deleteMany()
    await FileModel.deleteMany()
    await rmAsync(path.join(path.resolve("."), "Files"), {recursive:true})

})

it("should return message about pagination information  and 400 status code", async () => {
    let response = await request(fileServer)
    .get("/user/search/files")
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    assert.equal(response.status, 400)
    assert.isString(response.body.message)
})

it("should return total result and 200 status code", async () => {
    let response = await request(fileServer)
    .get("/user/search/files?page=5&limit=2")
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    assert.equal(response.status, 200)
    assert.equal(response.body.totalResults, 0)
})

it("no serach patern given : should return object with totalResutls and response not and 200 status code", async () => {
    let response = await request(fileServer)
    .get("/user/search/files?page=1&limit=2")
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    assert.equal(response.status, 200)
    assert.isDefined(response.body.totalResults)
    assert.equal(2 , response.body.totalResults)
    assert.isArray(response.body.response)
})

it("patern given : should returns response having title matching search pattern", async () => {
    let pattern = fileEntry1.title.replace(/\s+/g, "+")
    let response = await request(fileServer)
    .get(`/user/search/files?page=1&limit=2&title=${pattern}`)
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    assert.equal(response.status, 200)
    assert.isDefined(response.body.totalResults)
    assert.isArray(response.body.response)
    assert.equal(1, response.body.totalResults)
})

})