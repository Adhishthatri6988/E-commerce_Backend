import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  const {token} = req.headers;

  if (!token) {
    return res.status(401).json({message: 'No token provided, authorization denied'});
  }

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error)
    return res.json({success:false,message: 'Token is not valid'});
  }
}

export default authUser;