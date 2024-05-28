/** use to handle file operations */
import { ObjectId } from "mongodb"
import {FileModel} from "../models/file.js"
import path from "path"
import { emailAttachment } from "../utils/EmailHandler.js"
import { generateDownloadToken } from "../utils/WebTokenController.js"
class FileController {
    static getFileDownloadtoken = async (req, res) => {
        /**
         * generate token for file download
         * @param {object} req: http request object
         * @param {object} res : http response object
         */
        let downloadToken = generateDownloadToken({id: req.user._id.toString()})
        return res.status(200).json({token: downloadToken})
    }
    static downloadFile = async (req, res) => {
        /**
         * downloads a given file given a file Id
         * @param {object} req: http request object
         * @param {object} res : http response object
         */
        //get file id
        let fileId = req.params.fileId
        let fileEntry = await FileModel.findOne({_id: new ObjectId(fileId)})
        //check if if file exist
        if(!fileEntry)
            return res.status(400).json({"id": "wrong file Id"})
        //increment downloads
        fileEntry.downloads = fileEntry.downloads + 1
        //save changes
        await fileEntry.save()
        //send download file
        let fileName = path.basename(fileEntry.filePath)
        return res.download(fileEntry.filePath)
    }

    static searchFiles = async (req, res) => {
        /**
         * getFiles returns files with pagination
         * @param {object} req: request object
         * @param {object} res : response object
         */
        //get pagination information
        let page = req.query.page
        let limit = req.query.limit 
        //calculate ofset
        if(!(page && limit))
            return res.status(400).json({"message": "pagination information, page and limit not given in query string"})
        //calculate offset
        let offset = (page - 1) * limit
        //check for search patter
        let searchPattern = req.query.title
        //convert + to space
        let results = null
        if(searchPattern) {
            //convert + to space
            let pattern = searchPattern.replace(/\+/g, " ") // spaces are not allowed in url
            //search database with pattern
            results = await FileModel.find({title: new RegExp(pattern, 'i')}).skip(offset).limit(limit).select("title description") //check if title contain serch patter

        }
        else 
            results = await FileModel.find().skip(offset).limit(limit).select("title description")
        //convert id to String 
        let response = results.map(file => {
                return {title: file.title, description:file.description, id:file._id.toString()}
        })
        return res.status(200).json({"totalResults" : response.length, response})
    }

    static sendFileEmail = async (req, res) => {
        /**
         * sendFileEmaill: sends file with email as attachment
         * @param {object} req: http request object
         * @param {object} res: http response object
         */
        let details = req.body
        //check if all details are given 
        if(!(details.email && details.fileId))
            return res.status(400).json({"message": "fields missing"})
        //retrieve file details from database
        let fileEntry = await FileModel.findOne({"_id": new ObjectId(details.fileId)})
        //form attachment object file
        if(!fileEntry)
            return res.status(400).json({message: "wrong file id"})
        let attachments = [{fileName:path.basename(fileEntry.filePath), path:fileEntry.filePath}]
        //send email
        let response = await emailAttachment(req.user, details.email,attachments, fileEntry.description)
        if(!response.messageId)
            return res.status(400).json({"message": "couldn't send message"})
        //update number of email sent
        fileEntry.emailSent = fileEntry.emailSent + 1
        await fileEntry.save()
        return res.status(200).json({"message":"Email sent"})
    }
}
export {FileController}