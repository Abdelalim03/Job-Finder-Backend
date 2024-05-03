const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prismaClient.js");
const { setTaskImageUrl } = require("../utils/managePictures.js");


// i should add the images here 
const createTask = async (req, res, next)=> {
    uploadedImages = []
    const files = req.files

    if (files?.length > 0) {
        for (const file of files){
            if (file.mimetype.startsWith("image/")) {
                const url = setTaskImageUrl(file.filename)
                uploadedImages.push(url); 
            } else {
                return res
                  .status(StatusCodes.BAD_REQUEST)
                  .json({ error: "Invalid file type. Only images are allowed." });
              }
        }
    }

   

    try {
        const { description, price, categoryId } = req.body;
        const user_id  = req.user.userId
        const newTask = await prisma.task.create({
        data: {
            description: description,
            price: parseFloat(price),
            categoryId: parseInt(categoryId),
            taskerId: user_id,
            reviewsCount: 0,
            ratingAverage: 0,
            taskImages: { // Associate uploaded images with the task
                create: uploadedImages.map(image => ({
                    url: image
                }))
            }
        },
        });
        res.status(StatusCodes.OK).json({
            data: newTask,
          });
        
    } catch (error) {
        next(error)
    } 
}


module.exports = { 
    createTask,
}
