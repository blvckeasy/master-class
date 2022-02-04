import Fastify from 'fastify'
import multer from 'fastify-multer'
import fastifyCors from 'fastify-cors'
import jsonParser from 'fastify-xml-body-parser'

const fastify = Fastify({})
import dbConnect from './src/config/db.config.js'
import { routes } from './src/router/app.rout.js'
const PORT = process.env.PORT || 3000

fastify.register(fastifyCors, {
  origin: '*',
})
fastify.register(jsonParser)
fastify.register(multer.contentParser)
fastify.register(routes)

const start = async () => {
  try {
    await dbConnect(fastify)
    await fastify.listen(PORT, '0.0.0.0')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
