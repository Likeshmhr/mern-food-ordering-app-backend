import { Request, Response } from "express"
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Order from "../models/order";

const getMyRestaurant = async (req: Request, res: Response)=> {
    try {
      const restaurant = await Restaurant.findOne({ user: req.userId });
      if (!restaurant) {
        res.status(404).json({ message: "restaurant not found" });
        return;
      }
      res.json(restaurant);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Error fetching restaurant" });
    }
  };

const createMyRestaurant = async (req: Request, res:Response):Promise<void> => {
    try{
        console.log("Request Body:", req.body);
        const existingRestaurant = await Restaurant.findOne({ user: req.userId });

        if(existingRestaurant) {
         res
         .status(409)
         .json({message:"User restaurant already exists"});
         return;
        }

        // const image = req.file as Express.Multer.File;
        // const base64Image = Buffer.from(image.buffer).toString("base64");
        // const dataURI= `data:${image.mimetype};base64,${base64Image}`;

        // const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

        const imageUrl = await uploadImage(req.file as Express.Multer.File)


        const restaurant = new Restaurant({
            ...req.body, // Spread existing request body
            imageUrl: imageUrl,
            user: new mongoose.Types.ObjectId(req.userId),
            lastUpdated: new Date(),
            estimationDeliveryTime: req.body.estimationDeliveryTime || 30, // Default to 30 mins if missing
        });
        
        restaurant.imageUrl = imageUrl;
        restaurant.user = new mongoose.Types.ObjectId(req.userId);
        restaurant.lastUpdated = new Date();

        console.log("Restaurant Data to Save:", restaurant);
        await restaurant.save();

        res.status(201).send(restaurant);
    }catch(error){
        console.log(error);
        res.status(500).json({message: "Something went wrong",
        });
    }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);

    if (restaurant?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "unable to update order status" });
  }
};

const updateMyRestaurant = async (req: Request, res: Response):Promise<void> => {
    try {
      const restaurant = await Restaurant.findOne({
        user: req.userId,
      });
  
      if (!restaurant) {
        res.status(404).json({ message: "restaurant not found" });
        return;
      }
  
      restaurant.restaurantName = req.body.restaurantName;
      restaurant.city = req.body.city;
      restaurant.country = req.body.country;
      restaurant.deliveryPrice = req.body.deliveryPrice;
      restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
      restaurant.cuisines = req.body.cuisines;
      restaurant.menuItems = req.body.menuItems;
      restaurant.lastUpdated = new Date();
  
      if (req.file) {
        const imageUrl = await uploadImage(req.file as Express.Multer.File);
        restaurant.imageUrl = imageUrl;
      }
  
      await restaurant.save();
      res.status(200).send(restaurant);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };

  const uploadImage = async (file: Express.Multer.File) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
  };



export default {
    getMyRestaurant,
    createMyRestaurant,
    updateMyRestaurant,
    updateOrderStatus,
    
    
};