import express, { Request, Response } from 'express';
import {errorHandler} from "./utils/ErrorHandler"
import { router } from './routes/SignupRouter';
const app = express();
app.use(express.json());
app.use("/signup",router) 
app.get("/",(req:Request,res:Response)=>{
    res.json("hi from auth services")
})


export default app
