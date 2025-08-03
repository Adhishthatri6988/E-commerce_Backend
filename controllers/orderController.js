import orderModel from '../models/orderModel.js';

//PLACING ORDER using COD Method

const placeOrder = async(req , res) => {
  try {
    
    const { userId , amount , items , address} = req.body;
    const orderData = {
      userId,
      amount,
      items,
      address,
      paymentMethod:"cod",
      payment:false,
      date: Date.now(),
    }

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await orderModel.findByIdAndUpdate(userId, {cartData:{}});

    res.json({
      success: true,
      message: "Order Placed Successfully",
    })


  } catch (error) {
    console.log( error);
    res.json({
      success: false,
      message: error.message,
    });
  }
}


//PLACING ORDER using STRIPE Method

const placeOrderStripe = async(req , res) => {
  
}  


//PLACING ORDER using RazorPay Method

const placeOrderRazorpay = async(req , res) => {
  
}

//All Orders for a admin panel
const allOrders = async(req, res) => {

}


//User order data for frontend
const userOrders = async(req, res) => {
  try {
    const {userId} = req.body;
    const orders = await orderModel.find({userId});
    res.json({
      success: true,
      orders,
    });


  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
}


//update order status for admin panel
const updateStatus = async(req , res) => {

}

export {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus};