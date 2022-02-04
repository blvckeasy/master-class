import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { join, parse } from 'path'

/**
 * get static file with stream
 * @returns { Response<file | Error> } returning reponse to client
 */
export const ReadStream = async (req, res) => {
  try {
    let filePath = join(process.cwd(), 'src', req.url)
    /**
     * file info
     */
    let st = await stat(filePath)

    /**
     * Content-Types
     */
    const mimeType = {
      '.json': 'application/json',
      '.jpg': 'image/jpg',
      '.png': 'image/png',
      '.jpeg': 'image/jpeg',
    }

    res
      .header('Content-Type', mimeType[parse(filePath).ext.toLowerCase()])
      .header('Content-Length', st.size)

    let readStream = createReadStream(filePath)
    res.send(readStream)
  } catch (xato) {
    return { ERROR: xato }
  }
}
