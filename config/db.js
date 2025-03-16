import mongoose from "mongoose";

export const connectDB = async ()=>{
    await mongoose.connect(`mongodb+srv://bmalkes:Darkside28@cluster0.yj4wf.mongodb.net/food-del`).then(()=>{
        console.log('db connected')
    })
}