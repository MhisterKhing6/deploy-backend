import {assert } from "chai"
import { sendEmailVerification } from "../utils/EmailHandler.js"

describe("sending email from node js using node mailer", ()=> {
    let user = {name: "kinglsey", email: "autoccoder@gmail.com"}
    let wrongEmail = {name: "king", email: "wrongem@wring@ema"}
    it("should send and email with succesfully, email id defined", async () => {
        let response = await sendEmailVerification(user, "amaa")
        assert.isDefined(response.messageId)
        assert.equal(0, response.rejected.length)
    })
    it("should return null", async () => {
        let response = await sendEmailVerification(wrongEmail, "test")
        assert.isNull(response)
    })
})