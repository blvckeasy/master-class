export const cardsQury = privateQury => {
  return `
  select 
    c.id,
    concat(u.name, ' ', u.surname) as fullname,
    c.card_image,
    c.title,
    to_char(c.date,'DD-MM-YYYY HH24:MI')  date,
    sp.name as category_name,
    sp.id as category_id,
    case status 
      when true then 'Online'
      when false then 'Offline'
    end as status,
    ${privateQury}

    from cards c
      left join sap_categories sp on c.sap_category_id = sp.id
      left join users u on u.id = c.user_id

  `
}
