const matchs = require('./index')

matchs.matches('spain', 'real-madrid', { timezone: 'Europe/Madrid' })
    .then((res) => { console.log(res) })


matchs.logo('spain', 'real-madrid', { timezone: 'Europe/Madrid' }, '')
    .then((res) => { console.log(res) })

matchs.classification('spain', 'primera-division', { timezone: 'Europe/Madrid' }, '')
    .then((res) => { console.log(res) })

