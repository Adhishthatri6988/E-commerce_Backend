import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Stripe from 'stripe';

//global variables
const currency =  'USD';
const deliveryCharges = 10;


//gateway initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);






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
  try {
    const { userId , amount , items , address} = req.body;
    const {origin} = req.headers;
    const orderData = {
      userId,
      amount,
      items,
      address,
      paymentMethod:"Stripe",
      payment:false,
      date: Date.now(),
    }

     const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name
        },
        unit_amount: item.price * 100, // Convert to cents
      },
      quantity: item.quantity,
    }))

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharges, // Example shipping cost
      },
      quantity: 1,
    })

    const session = await stripe.checkout.sessions.create({
      
      success_url: `${origin}/verify?succes=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?succes=false&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment',
  
    });
    
    res.json({
      success: true,
      session_url: session.url,
    })

  } catch (error) {
     console.log( error);
    res.json({
      success: false,
      message: error.message,
    });
  }
}  


//PLACING ORDER using RazorPay Method

const placeOrderRazorpay = async(req , res) => {
  
}

//All Orders for a admin panel
const allOrders = async(req, res) => {
 try {
  const orders = await orderModel.find({});
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
  try {
    const {orderId, status} = req.body;
    await orderModel.findByIdAndUpdate(orderId, {status});
    res.json({
      success: true,
      message: "Order Status Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
}

export {placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus};