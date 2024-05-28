import { Router } from "express";
import { UserController } from "../controllers/userController.js";
//routes that doesnt involves user verfications

const nonAuthRoute = Router()

/* 
register user
method: post
domain: public
*/
nonAuthRoute.post("/register/customer", UserController.register)


/**
 * login user
 * method: post
 * domain public
 */
nonAuthRoute.post("/login/user", UserController.login)
export {nonAuthRoute}


/**
 * verify user email
 * method:post
 * domain public
 * 
 */
nonAuthRoute.post("/verify/customer", UserController.verifyCutomerEmail)

/**
 * sends user verification number for email verication
 * method:get
 * domain public
 * 
 */
nonAuthRoute.get("/user/verification-number/email/:email", async (req, res) => {
    return await UserController.sendVerificationNumber(req, res, "email")
})


/**
 * re send verification code to user email
 * method:get
 * domain public
 */
nonAuthRoute.get("/user/resend/verification-code/:vId", UserController.resendVerifcationCode)

/**
 * sends user verification number for password verication
 * method:get
 * domain public
 * 
 */
nonAuthRoute.get("/user/verification-number/reset-password/:email", async (req, res) => {
    return await UserController.sendVerificationNumber(req, res, "password")
})

/**
 * verifies user by checking if number sent via email matches the one received by user
 * method: post
 * domain: public
 */
nonAuthRoute.post("/user/check/verification", UserController.verify)


/**
 * updates user passwords
 * method: post
 * domain:public
 */
nonAuthRoute.post("/user/update-password", UserController.updatePassword)