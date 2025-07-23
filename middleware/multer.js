// import multer from 'multer'

// const storage = multer.diskStorage({
//   filename:function(req , file, callback){
//     callback(null , file.originalname)
//   }
// })


// const upload = multer({storage})

// export default upload

import multer from 'multer'
import path from 'path'; // It's good practice to import 'path' for robust path handling

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Specify the directory where uploaded files will be stored.
    // IMPORTANT: This 'uploads/' directory MUST exist in your server's root directory.
    // Create it if it doesn't exist.
    cb(null, 'uploads/');
  },
  filename: function(req, file, callback){
    // It's generally better to use a unique filename to prevent overwrites
    // e.g., `${Date.now()}-${file.originalname}`
    // Or, if you specifically want original names and handle potential collisions:
    callback(null , file.originalname)
  }
})

const upload = multer({storage})

export default upload