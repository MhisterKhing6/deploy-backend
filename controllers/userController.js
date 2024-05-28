/* 
controls user endpoins operations
*/
/*handles user controller functions */
import { UserModel } from "../models/user.js"
import { VerifTokenModel } from "../models/verifyToken.js"
import { sendEmailVerification, sendResetPassword } from "../utils/EmailHandler.js"
import { ObjectId } from "mongodb"
import sha1 from "sha1"
import { generateToken } from "../utils/WebTokenController.js"
import { TwoHourPass, generateSecretNumber } from "../utils/VerificationFunctions.js"

class UserController  {

    static register = async (req, res) => {
        /**
         * register: register user to the system
         * @param {object} req: request object
         * @param {object} res: response
         * @returns {object} : json response of user detials
         */
        let userDetails = req.body
        //check if all required user details are given
        if(!(userDetails.email && userDetails.password && userDetails.name && userDetails.type))
            return res.status(400).json({"message": "fields missing"})
        //check if the user is already register
        let alreadyUser = await UserModel.findOne({email: userDetails.email})
        if(alreadyUser)
            return res.status(400).json({"message": "user with the same email already registered"})
        
        //check if the type rigth user role is given
        if(!(userDetails.type === "customer" ))
            return res.status(401).json({"message": "wrong user role"})
        //save the user to the database
        try {
            let passwordHash = sha1(userDetails.password)
            let userDb = UserModel({...userDetails, passwordHash})
            //send verificaion message
            let verificationCode = generateSecretNumber()
            //save information in the Verify token database
            await userDb.save()
            //verify object
            let verifyObject = {"userId":userDb._id.toString(), verificationCode, type:"email"}
            let verifyToken = await new VerifTokenModel(verifyObject).save()
            //asynchroneously send verificatio message
            sendEmailVerification(userDb, verificationCode)
            res.status(201).json({"id": userDb._id, verificationId: verifyToken._id.toString()})
        } catch(err) {
            console.log(err)
            return res.status(501).json({"message": "internal error"})
        }
    }

    static login = async (req, res) => {
        /**
         * register: register user to the system
         * @param {object} req: request object
         * @param {object} res: response
         * @return {object} : json response of user token
         */
        let loginDetails  = req.body
        //check if email and password is given
        try {
            if(!(loginDetails.email && loginDetails.password))
            return res.status(400).json({"message": "fields missing"})
        //check if user has registered
        let user = await UserModel.findOne({email:loginDetails.email})
        if(!user)
            return res.status(401).json({"message": "user hasnt registered"})
        if(!user.emailVerified) {
            //delete user entry
            await UserModel.deleteOne({_id:user._id})
            return res.status(401).json({"message": "user hasnt registered"})
        }
        //check if user hash passwrod match login hash passsword
        if(user.passwordHash !== sha1(loginDetails.password))
            return res.status(401).json({"message": "wrong passwrod"})
        //generate token for the user
        let token = generateToken({...user})
        //send token to user
        return res.status(200).json({token, "message": "login successful"})

        }catch(err) {
            console.log(err)
            return res.status(501).json({"message": "internal error"})
        }
        
    }

    static verifyCutomerEmail = async (req, res) => {
        /**
         * verifyCustomer : verifies customer by checking cutomer customer give secrete text with the ones sent via email
         * @param {object} req: request object
         * @param {object} res: response
         */
        let verficationDetails = req.body  
        //check if all details fiels ar given
        if(!(verficationDetails.verificationId && verficationDetails.verificationCode))
             return res.status(400).json({"message": "fields missing"})
        try {
            //check for verification entry
            let verificationEntry = await VerifTokenModel.findOne({_id: new ObjectId(verficationDetails.verificationId)})
            if (!verificationEntry)
                return res.status(401).json({"message": "no verification entry found"})
            //check if token has expired
            if(TwoHourPass(verificationEntry.createdDate)) {
                //delete token entry
                await VerifTokenModel.deleteOne({_id: verificationEntry._id})
                return res.status(401).json({"message": "token expired"})
            }
            //check if user secrete number matches the one sent via email
            if(verficationDetails.verificationCode !== verificationEntry.verificationCode)
                return res.status(400).json({"message": "numbers dont match"})
            //get and verify user
            let user = await UserModel.findOne({_id: new ObjectId(verificationEntry.userId)})
            if(!user)
                return await  res.status(401).json({"message": "user not registered"})
            //update user verified email
            user.emailVerified = true
            await user.save()
            //delete token entry
            await VerifTokenModel.deleteOne({_id:verificationEntry._id})
            //return response to user
            return res.status(200).json({id: user._id.toString() , "message": "user verifeid"})
            
        }catch(err) {
            console.log(err)
            res.status(501).json({"message": "internal server error"})
        }

    }

    static sendVerificationNumber = async (req, res, type) => {
         /**
         * sendVerification : sends verification detials to user email
         * @param {object} req: request object
         * @param {object} res: response
         */
        let userEmail = req.params.email
        try{
            //check if the user is registered
            let customer = await UserModel.findOne({email:userEmail})
            if(!customer)
                return res.status(401).json({"message": "user hasnt registered"})
            //delete old verification entry
            await VerifTokenModel.deleteOne({"userId": customer._id.toString()})
            //generate verifcation entry and save
            let verficaitonDetails = {userId:customer._id.toString(), type, verificationCode:generateSecretNumber()}
            let verificatonEntry = await new VerifTokenModel(verficaitonDetails).save()
            //check the type to determine the type of message to send
            if(type === "password")
                sendResetPassword({email:customer.email, name:customer.name}, verficaitonDetails.verificationCode)
            else {
                sendEmailVerification({email:customer.email, name:customer.name}, verficaitonDetails.verificationCode)
            }
            //send verification id to user_id to user
            res.status(200).json({"verificationId":verificatonEntry._id.toString(), "userId":customer._id.toString()})

        }catch(err){
            console.log(err)
            res.status(501).json({"message": "internal server error"})
        }
    }
    static verify = async (req, res) => {
       /**
         * resetPassword : reset user passwords
         * @param {object} req: request object
         * @param {object} res: response
         */ 

       let verficationDetails = req.body    
        //check if all details fiels ar given
        if(!(verficationDetails.verificationId && verficationDetails.verificationCode))
             return res.status(400).json({"message": "fields missing"})
        try {
            //check for verification entry
            let verificationEntry = await VerifTokenModel.findOne({_id: new ObjectId(verficationDetails.verificationId)})
            if (!verificationEntry)
                return res.status(401).json({"message": "no verification entry found"})
            //check if token has expired
            if(TwoHourPass(verificationEntry.createdDate)) {
                //delete token entry
                await VerifTokenModel.deleteOne({_id: verificationEntry._id})
                return res.status(401).json({"message": "token expired"})
            }
            //check if user secrete number matches the one sent via email
            if(verficationDetails.verificationCode !== verificationEntry.verificationCode)
                return res.status(401).json({"message": "numbers dont match"})
            //update verification entry
            verificationEntry.verified = true
            await verificationEntry.save()
           
            return res.status(200).json({verificationId: verificationEntry._id.toString(), message:"success"})
            
        }catch(err) {
            console.log(err)
            res.status(501).json({"message": "internal server error"})
        }
    }
    static updatePassword = async (req, res) => {
        /**
         * updatePassword : update user passwords
         * @param {object} req: request object
         * @param {object} res: response
         */ 
        //update history
        let updateDetials = req.body
        //check if all user detials are given
        if(!(updateDetials.password && updateDetials.verificationId))
            return res.status(400).json({"message": "fields missing"})
        //check for verifcation database entry
        try {
            //check for verification entry
            let verificationEntry = await VerifTokenModel.findOne({_id:new ObjectId(updateDetials.verificationId)})
            if(!verificationEntry)
                return res.status(401).json({"message": "no verification entry found"})
            //check if user has verify and the type of verification is reset password
            if(!(verificationEntry.verified && verificationEntry.type === "password"))
                return res.status(401).json({"message": "user not verfied"})
            //get and verify user
            let user = await UserModel.findOne({_id: new ObjectId(verificationEntry.userId)})
            if(!user)
                return await  res.status(401).json({"message": "user not registered"})
            //update user's password
            user.passwordHash = sha1(updateDetials.password)
            await user.save()
            //delete token entry
            await VerifTokenModel.deleteOne({_id:verificationEntry._id})
            //return response to user
            return res.status(200).json({id: user._id.toString() , "message": "password changed"})
        }catch(err) {
            console.log(err)
            res.status(501).json({"message": "internal server error"})
        }

    }

    static resendVerifcationCode = async (req, res) => {
        /**
         * resendVerificatin : resends verification to user email
         * * @param {object} req: request object
         *   @param {object} res: response
         */

        let verificationId = req.params.vId
        if(!verificationId)
            return res.status(400).json("message: fields missing")
        //retrive verification entry
        let verifcationEntry = await VerifTokenModel.findOne({_id: new ObjectId(verificationId)})
        if(!verifcationEntry)
            return res.status(401).json({"message": "no entry found"})
        //generat new verfication code
        verifcationEntry.verificationCode = generateSecretNumber()
        //reset date
        verifcationEntry.createdDate = new Date()
        await verifcationEntry.save()
        //retrieve user info
        let user = await UserModel.findOne({_id: new ObjectId(verifcationEntry.userId)})
        //check type to send appropriate verification  template
        if(verifcationEntry.type === "password")
            sendResetPassword({email:user.email, name:user.name}, verifcationEntry.verificationCode)
        else 
            sendEmailVerification({email:user.email, name:user.name}, verifcationEntry.verificationCode)
        //send response to user
        res.status(200).json({"message": "new message sent"})
    }
}


export {UserController}