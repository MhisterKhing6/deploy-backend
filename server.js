import Express from "express";
import Cors from "cors"
import configuration from "config"
import { nonAuthRoute } from "./routes/noAuthRoute.js";
import { connectDb } from "./utils/MongodbConector.js";
import { adminRoute } from "./routes/adminRoute.js";
import { authRoute } from "./routes/AuthRoute.js";
import { downloadRoute } from "./routes/downloadRoute.js";

//server initializing
const fileServer = Express()

//connect to database
connectDb()

//middlewares
fileServer.use(Cors()) //cross origin communication
fileServer.use(Express.json({limit: configuration.files.maxSize})) // json body parsing
fileServer.use(Express.urlencoded({ extended: false }))

//routes
fileServer.use("/auth", nonAuthRoute)
fileServer.use("/admin",adminRoute)
fileServer.use("/user" , authRoute)
fileServer.use("/download/:token", downloadRoute)

fileServer.get("/", (req, res) => {
    return res.send("ok i am working")
})

fileServer.listen(configuration.host.port,configuration.host.ip, () => {
    console.log(`app is listening at http://${configuration.host.ip}:${configuration.host.port}`)
})

export {fileServer}