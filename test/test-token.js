import { generateToken, decodeToken, getAuthorizationtoken } from "../utils/WebTokenController.js";
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

    it("sould return token", () => {
        let token = "9*##@@#@@@#@3232"
        let mockedRequest = {header: (objc) => `Bearer ${token}`}
        let resultToken = getAuthorizationtoken(mockedRequest)
        assert.equal(token, resultToken)
        assert.isString(resultToken)
    })
})