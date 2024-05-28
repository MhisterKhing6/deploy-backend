import { Router } from "express";
import { decodeToken } from "../utils/WebTokenController.js";
import { UserModel } from "../models/user.js";
import { getAuthorizationtoken } from "../utils/WebTokenController.js";
import { FileController } from "../controllers/FileController.js";
import { UserController } from "../controllers/userController.js";
//handles operations that require authentication common to both admin and customers

const authRoute = Router()

//middle to verify user

authRoute.use(async (req, res, next) => {
/**
 * retrieves user information
 */
//get authorization token

let token = getAuthorizationtoken(req)
    if(!token)
        return res.status(401).json({"message": "no token given"})
//decode token to get user informaiton
let userDetials = decodeToken(token)
if(!userDetials)
    return res.status(400).json({"message": "token expired login"})
let user = await UserModel.findOne({"_id":userDetials._doc._id})
if(!user)
    return res.status(401).json({"message": "user doesnt have permission for service"})
//set user to req.user
req.user = user
next()
})

/**
 * get details of authenticated user
 * method: get
 * domain: autheticated users
 */
authRoute.get("/me", UserController.me)

/**
 * returns authentication token for file download
 * method: get
 * domain: restricted to authenticated users
 */
authRoute.get("/file/download/token", FileController.getFileDownloadtoken)

/**
 * retrieve file information to users
 * methode get
 * domain: restricted to authenticated users
 */
authRoute.get("/search/files", FileController.searchFiles)

/**
 * sends file throug and email
 * methode post
 * domain: restricted to authenticated users
 */
authRoute.post("/files/email", FileController.sendFileEmail)

export {authRoute}
