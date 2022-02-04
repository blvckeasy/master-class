import jwt from 'jsonwebtoken'
import { generateDatabaseDateTime } from '../service/date.service.js'
import { cardsQury } from '../Sql/app.sql.js'

class AppModule {
  #db
  constructor(db) {
    this.#db = db
  }

  /**
   *
   * @param {Number} l limit
   * @param {Number} p page
   * @param {String} s search
   * @param {String} a authors
   * @param {Number} c category id
   * @param {Date} d date
   * @param {Boolean} o online/offline
   * @returns {Promise<Cards[]>}
   */
  async getAllCards(l = 6, p = 1, s, a, c, d, o) {
    try {
      const { rows } = await this.#db.query(
        `
            ${cardsQury('c.user_id')}

            where
                c.card_deleted_at is null and
                c.confirmation_number = 2 and  
                case
                    when length($3) > 0 or $3 is null then sp.name ILIKE concat('%',$3,'%')
                    else false
                end and
                case
                    when length($4) > 0 or $4 is null then concat(u.name, ' ', u.surname) ILIKE concat('%',$4,'%')
                    else false
                end and
                case
                    when sp.id = $5 or $5 is null then true
                    else false
                end and
                case
                    when c.date::text ilike concat($6::text, '%') or $6 is null then true
                    else false
                end and
                case
                    when c.status = $7 or $7 is null then true
                    else false
                end
            order by c.date::timestamp desc
            offset $1
            limit $2
            `,
        [(p - 1) * l, l, s, a, c, d, o]
      )

      this.#db.relo
      return rows
    } catch (error) {
      return { ERROR: error.message }
    }
  }

  /**
   *
   * @returns {Promise<Categories[]>} 'all categories'
   */
  async getCategories() {
    try {
      const { rows } = await this.#db.query(`
            select 
              c.*,
              json_agg(sc.*) sap_categories
            from categories c
              left join sap_categories sc on c.id = sc.category_id
            group by c.id
            order by c.id;
            `)
      return rows
    } catch (error) {
      return { ERROR: error.message }
    }
  }

  /**
   *
   * @param {Number} id
   * @returns  {Promise<Categories>} 'single card'
   */
  async getCard(id) {
    try {
      const { rows } = await this.#db.query(
        `
            ${cardsQury(
              `
            c.views,
            c.long_info,
            c.short_info
            `
            )}

            where c.id = $1;
            `,
        [id]
      )

      return rows
    } catch (error) {
      return { ERROR: error.message }
    }
  }

  /**
   *
   * @param {Number} id
   * @returns {Promise<Cards>} cards by category id
   */

  async getRecomendet(id) {
    try {
      const { rows } = await this.#db.query(
        `
            ${cardsQury('c.user_id')}

            where c.sap_category_id = $1 
            order by c.id;
            `,
        [id]
      )
      return rows
    } catch (error) {
      return { ERROR: error.message }
    }
  }

  /**
   *
   * @returns { Promise<Authors[]> } all authors
   */
  async getAuthors() {
    try {
      const { rows } = await this.#db.query(`
            select 
                u.id,
                concat(u.name, ' ', u.surname) fullnamne
            from users u;
            `)
      return rows
    } catch (error) {
      return { ERROR: error.message }
    }
  }

  /**
   *
   * @param { Object } param0 full data for new cards
   * @param { string } file_path file link
   * @returns {Promise<newCard>} returning created card
   */
  async postCards(
    {
      fullname,
      phone,
      date,
      time,
      status,
      category_id,
      sap_category_id,
      location,
      title,
      short_info,
      long_info,
    },
    file_path
  ) {
    try {
      const statusBool = status.toLowerCase().trim() == 'online' ? true : false

      let {
        rows: [userArray],
      } = await this.#db.query(
        `
        select id 
        from users 
        where $1 ilike concat(name, ' ', surname)
        `,
        [fullname]
      )

      /**
       * if user not found create this user
       */
      if (!userArray) {
        const name = fullname.split(' ')[0]
        const surname = fullname.split(' ')[1]

        const {
          rows: [userId],
        } = await this.#db.query(
          `
            insert into users (name, surname, phone, category) 
            values ($1, $2, $3, $4) 
            returning id
            `,
          [name, surname, phone, category_id]
        )

        userArray = userId
      }

      const { rows } = await this.#db.query(
        `
        insert into cards (user_id, title, sap_category_id, date, short_info, long_info, status, location, card_image, card_created_at) 
        values ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        returning *
        `,
        [
          userArray.id,
          title,
          sap_category_id,
          date + ' ' + time,
          short_info,
          long_info,
          statusBool,
          location,
          file_path,
          generateDatabaseDateTime(),
        ]
      )
      return rows
    } catch (error) {
      console.log(error)
      return { ERROR: error.message }
    }
  }

  /**
   *
   * @param {Object} param0 admin data
   * @param {Object} headers request headers
   * @returns {Promise<Object>} returning Object { token }
   */
  async checkAdmin({ username, password }, headers) {
    try {
      const {
        rows: [foundAdmin],
      } = await this.#db.query(
        `
					select * 
          from admin 
          where username = $1 and password = $2
        `,
        [username, password]
      )

      if (!foundAdmin) throw new Error('login or password invalid')

      foundAdmin['user-agent'] = headers['user-agent']

      const token = jwt.sign(foundAdmin, process.env.jwt_password, {
        expiresIn: '12h',
      })

      return {
        token,
      }
    } catch (error) {
      return {
        ERROR: error.message,
      }
    }
  }

  /**
   *
   * @param {String} token
   * @param {String} param1
   * @param {String} _agent
   * @returns {Promise<Cards[]>} returning cards by Status (kutilmoqda, tasdiqlandi, bekor qilindi)
   */
  async getConfirmation(token, { conf = 2 }, _agent) {
    try {
      const admin = jwt.verify(token, process.env.jwt_password)

      if (!admin['user-agent'] == _agent) throw new Error('another browser!')

      const {
        rows: [foundAdmin],
      } = await this.#db.query(
        `
					select * 
          from admin 
          where id = $1 and username = $2 and password = $3
				`,
        [admin.id, admin.username, admin.password]
      )

      if (!foundAdmin) throw new Error('login or password invalid!')

      const { rows: cards } = await this.#db.query(
        `
				select * 
        from cards c 
        where c.date::timestamptz >= NOW()
          and  
          c.confirmation_number = $1
        order by c.date::timestamp desc;
				`,
        [conf]
      )

      return cards
    } catch (error) {
      return {
        ERROR: error.message,
      }
    }
  }

  /**
   *
   * @param {Object} param0
   * @returns {Promise<UpdatedCard>} update card status
   */
  async updateAnnouncement({ id, confirmation, view = false }) {
    try {
      if (![0, 1, 2].includes(confirmation))
        throw new Error('Invalid confirmation!')

      if (isNaN(+view)) throw new Error('view must be type number!')

      const {
        rows: [card],
      } = await this.#db.query(
        `
				update cards c
          set 
            confirmation_number = 
              case
                when $1 in (0, 1, 2) then $1
                else c.confirmation_number
              end,
            views = 
              case
                when $2 then c.views + 1
                else c.views
              end
        where id = $3 
        returning *
			`,
        [confirmation, view, id]
      )

      if (!card) throw new Error('Card not Found!')

      return card
    } catch (error) {
      return {
        ERROR: error.message,
      }
    }
  }
}

export default AppModule
