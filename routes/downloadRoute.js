import { Router } from "express";
import { decodeDownloadToken, decodeToken } from "../utils/WebTokenController.js";
import { UserModel } from "../models/user.js";
import { AdminController } from "../controllers/adminController.js";
import { getAuthorizationtoken } from "../utils/WebTokenController.js";
import { FileController } from "../controllers/FileController.js";
//routes handles all admin operations

const downloadRoute = Router({mergeParams:true})

//middle to verify admin

downloadRoute.use(async (req, res, next) => {
/**
 * verify download token
 */

//get for download token
    let downloadToken = req.params.token
    if(!downloadToken)
        return res.status(400).send("bad request ss")
    if(!downloadToken)
        return res.status(401).send("no token given")
    //verfiy dwonload token
    let authenticated = decodeDownloadToken(downloadToken)
    if(!authenticated)
        return res.status(400).send("aun authorized")
    next()

})

/**
 * upload file to the file server
 * method: post
 * domain: restricted to admin users
 */
downloadRoute.get("/:fileId", FileController.downloadFile)

/**
 * give files uploaded stats
 * method: get
 * domain: restricted to admin users
 */

export {downloadRoute}
