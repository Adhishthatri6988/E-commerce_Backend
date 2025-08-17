import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Stripe from 'stripe';
import razorpay from 'razorpay';

//global variables
const currency =  'inr';
const deliveryCharges = 10;


//gateway initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});






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
        unit_amount: item.price * 100 // Convert to cents
      },
      quantity: item.quantity
    }))

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharges // Example shipping cost
      },
      quantity: 1
    })

    const session = await stripe.checkout.sessions.create({
      
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment',
  
    })
    
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


// verify controller for stripe payment
const verifyStripe = async(req, res) => {
   const { orderId , success, userId } = req.body;

   try {
    if(success === 'true'){ 
        await orderModel.findByIdAndUpdate(orderId, {payment: true});
        await userModel.findByIdAndUpdate(userId, {cartData: {}});
        res.json({success: true});
    }else{
      await orderModel.findByIdAndDelete(orderId);
      res.json({success: false});
    }
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
  try {
    const { userId , amount , items , address} = req.body;

    const orderData = {
      userId,
      amount,
      items,
      address,
      paymentMethod:"Razorpay",
      payment:false,
      date: Date.now(),
    }

     const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100, // amount in the smallest currency
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    }

    await razorpayInstance.orders.create(options , (error, order) => {
      if(error){
        console.log(error)
        return res.json({success:false , message:error})
      }
      res.json({
        success: true,order,
      });
    })

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
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

export {verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus};