/*Handles file operation for admin*/
import { promisify } from "util"
import { readFile, writeFile, existsSync, mkdir, mkdirSync } from "fs"
import path from "path"
const readFileAsync = promisify(readFile)
const writeFileAsyc = promisify(writeFile)
const mkdirAsync = promisify(mkdir)

const createFilePath = async (adminId,fileName) => {
    /**
     * createDirectory: create a directory for a file
     * @param {string}:use to uniquly manage files folder structure
     * @returns {int}: positive or negatvie depending on successfull folder creation
     */
    //get absolute path of current directory calling the function
    let abs = path.resolve(".")
    //join paths to get parent directory of files
    let parentDirectory = path.join(abs, "Files", adminId)
    //create folder on a disk
    try {
        let response = await mkdirAsync(parentDirectory, {recursive:true})
        //join created folder with fileName to create folder parent path
        let filePath = path.join(parentDirectory, fileName)
        return filePath
    } catch(err) {
        console.log(err)
        return null
    }
}

const decodeBase64 = async (bas64String)  => {
    /**
     * decodeBase64: decode base64 string to a buffer
     * base64String: a base 64 string to decode into a buffer
     */
    let buffer = Buffer.from(bas64String, "base64")
    return buffer
}

const getFileNameFromTitle = (title, fileName) => {
    let extension = fileName.split(".").pop()
    //get extension from user filename given
    let extName = path.extname(fileName)
    if(!extName)
        return null
    //replace space in title with dash
    let dashedtitle = title.replace(/\s+/g , "-");
    return dashedtitle + extName
}


const saveUpolaodFileDisk = async (adminId,fileName, base64Data) => {
    /**
     * writeFile : saves buffer data to file
     * @param {string} fileName: file name of the file
     * @param {string} adminId: the id of the admiin uplaading the file, use for folder structure
     * @param {string} base64Data: base64 data to save
     * @returns {{status: 'int" , filePath:"str"}} status 0 if file exist, 1 if success with file path and -1 if error occured
     */
    //create file path
    try {
    let filePath  = await createFilePath(adminId, fileName)
    if(!filePath)
        return null
    //check if file with the same file name exist
    let buffer = await decodeBase64(base64Data)
    //write file to disk
    await writeFileAsyc(filePath, buffer)
    return filePath
        
    }catch(err) {
        console.log(err)
        return null
    }
}

export{createFilePath, saveUpolaodFileDisk, getFileNameFromTitle}