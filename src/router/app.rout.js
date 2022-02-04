import { AppController } from '../controller/app.controller.js'
import AppModule from '../module/app.module.js'
import { ReadStream } from '../module/staticFile.module.js'

/**
 *
 * @param {FastifyRouter} fastify
 * @returns {Response} returnning response to client
 */
export const routes = async fastify => {
  try {
    //module
    const appModule = new AppModule(fastify.db.client) 
    const appController = new AppController()

    /**
     * get all cards or only one cards!
     */
    fastify.get('/api/cards', appController.GetAllCards.bind(appModule))

    /**
     * get all categories
     */
    fastify.get('/api/categories', appController.GetCategories.bind(appModule))

    /**
     * get all authors
     */
    fastify.get('/api/authors', appController.GetAuthors.bind(appModule))

    /**
     * get recomendet crads for sap categroy id
     */
    fastify.get('/api/recomendet', appController.GetRecomendet.bind(appModule))

    /**
     * home :)
     */
    fastify.get('/', (req, res) => {
      return { Wel: 'come!' }
    })

    /**
     * create new crads
     */
    fastify.post('/api/upload', appController.PostCreateCards.bind(appModule))

    /**
     * check admin
     */
    fastify.post('/api/admin/login', appController.CheckAdmin.bind(appModule))

    /**
     * get cards by status (tasdiqlandi, bekor qilindi, kutilmoqda)
     */
    fastify.get(
      '/api/admin/confirmation',
      appController.GetCardByType.bind(appModule)
    )

    /**
     * update cards status
     */
    fastify.put(
      '/api/admin/update',
      appController.PutCardStatus.bind(appModule)
    )

    /**
     * get static file with stream
     */
    fastify.get('/public/*', ReadStream)
  } catch (xato) {
    console['log'](xato)
  }
}
