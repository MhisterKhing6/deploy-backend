import { generateToken, decodeToken } from "../utils/WebTokenController.js";
import { assert } from "chai";

describe("user token generation and decoding", () => {
    let userDetials = {"name": "customer1", "email": "customer@gmail.com", "password": "custoemr22"}
    it("return a string with user token", () => {
        let token = generateToken(userDetials)
        assert.isString(token)
    })
    it("generate user details from token", () => {
    let token =  generateToken(userDetials)
    let userDetialsAfterDecoding = decodeToken(token)
    assert.equal(userDetials.name, userDetialsAfterDecoding.name)  
    assert.equal(userDetials.email, userDetialsAfterDecoding.email)
    })
})