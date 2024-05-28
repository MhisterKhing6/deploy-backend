import { existsSync, rm, readFile } from "fs";
import {assert} from "chai"
import path from "node:path";
import { promisify } from "util";
import { saveUpolaodFileDisk } from "../utils/FileHandler.js";
let rmAsync = promisify(rm)
let readFileAsync = promisify(readFile)

describe("creating file path", () => {
    let adminId = "adminId"
    let fileName = "fileName.txt"
    let fileContent = "text file content"
    let base64Content = Buffer.from(fileContent).toString("base64")
    after(async () => {
       await rmAsync(path.join(path.resolve("."),"Files"), {recursive:true})
    })
    it("should return object with status equals 1 and filePath", async () => {
        let response = await saveUpolaodFileDisk(adminId, fileName, base64Content)
        assert.isString(response )
        assert.isTrue(existsSync(response))
        let content = await readFileAsync(response)
        assert.equal(content.toString(), fileContent)


    })  
})