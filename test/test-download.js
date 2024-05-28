import {assert} from "chai";
import { UserModel } from "../models/user.js";
import request from "supertest"
import { connectDb } from "../utils/MongodbConector.js";
import { fileServer } from "../server.js";
import sha1 from "sha1"
import { generateToken } from "../utils/WebTokenController.js";
import { response } from "express";
import { FileModel } from "../models/file.js";
import { ObjectId } from "mongodb";



describe("test downloading file",  () => {
let verifiedCustomer = {"name": "text2", "password": "text3333", "email": "text323@gmail.com", "role": "admin", "emailVerified": true}
let passwordHash = sha1(verifiedCustomer.password)
let authToken = null
let user = null
let downloadToken = null
let fileId = null

let fileName = "fileName.txt"
let fileContent = "text file content"
let base64Content = Buffer.from(fileContent).toString("base64")
let fileEntry = {fileName, data:base64Content, title: "test for upload file 2", description: "test string content"}



before(async () => {
    await connectDb()
    //register user with admin previlages
    user = await new UserModel({...verifiedCustomer, passwordHash}).save()
    //get token for user login
    authToken = generateToken({...user})
    //delete all files in the database
    let response = await request(fileServer)
    .get("/user/file/download/token")
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    downloadToken = response.body.token
    let uploadFile = await request(fileServer)
    .post("/admin/upload-file")
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    .send(fileEntry)
    fileId = uploadFile.body.fileId
})

after(async () => {
    await UserModel.deleteOne({_id: user._id})
    await FileModel.deleteOne({_id: new ObjectId(fileId) })

})

it("should return message about pagination information  and 200 status code", async () => {
    let response = await request(fileServer)
    .get(`/download/${downloadToken}/${fileId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .type('json')
    assert.equal(200, response.status)
    })

    
})