import userModel from "../models/userModel";


// ADD PRODUCTS TO USER CARTS
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;
    
    const userData = await userModel.findById(userId);

    let cartData = await userData.cartData;

    if(cartData[itemId]){
      if(cartData[itemId][size]){
        cartData[itemId][size] += 1; // Increment quantity if item already exists
      }else{
        cartData[itemId][size] = 1; // Add new size with quantity 1
      }
    }else{
      cartData[itemId] = {};
      cartData[itemId][size]= 1 // Add new item with size and quantity 1
    }


    await userModel.findByIdAndUpdate(userId, { cartData }, { new: true });
    res.json({ success: true, message: 'Item added to cart successfully', cartData });


  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'Error adding item to cart', error: error.message });
  }
}


//update products in user carts
const updateCart = async (req, res) => {
  
}

//get user carts
const getUserCart = async (req, res) => {
  
}


export { addToCart, updateCart, getUserCart };