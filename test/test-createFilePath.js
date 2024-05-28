import { createFilePath } from "../utils/FileHandler.js";
import { existsSync, rm } from "fs";
import {assert} from "chai"
import path from "node:path";
import { promisify } from "util";
let rmAsync = promisify(rm)

describe("creating file path", () => {
    let adminId = "adminId"
    let fileName = "fileName.txt"
    let parentDirectory = path.join(path.resolve("."),"Files", adminId)
    after(async () => {
       await rmAsync(path.join(path.resolve("."),"Files"), {recursive:true})
    })
    it("create base folder, and returns file path", async () => {
        let filePath = await createFilePath(adminId, fileName)
        assert.isString(filePath)
        assert.isTrue(existsSync(parentDirectory))
    })  
})