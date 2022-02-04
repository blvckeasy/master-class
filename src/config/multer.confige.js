import multer from 'fastify-multer'
import { extname } from 'path'

export const upload = multer({
  //multer settings

  /**
   * check file type
   */
  fileFilter: function (req, file, callback) {
    let ext = extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  },

  /**
   * file max size
   */
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single('file') //field name
