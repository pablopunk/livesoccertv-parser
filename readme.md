# livesoccertv-parser [![npm](https://img.shields.io/npm/dt/livesoccertv-parser.svg)](https://www.npmjs.com/package/livesoccertv-parser)

>© All rights reserved to [Live soccer TV](http://www.livesoccertv.com/)

## Install

```bash
npm install livesoccertv-parser
```

## Usage

The parser works with promises:

```js
const matches = require('livesoccertv-parser')
console.log(await matches('spain', 'real-madrid')) //=> [{...}, {...}, ...]
```

Match object:

```js
Match {
  played: false,
  competition: 'Supercopa de España',
  date: 'August 13',
  time: '16:00',
  game: 'Barcelona vs Real Madrid',
  tvs:
    [
      'TeleCinco',
      'TV3',
      'Radio Barca'
    ]
}
```

### API

* Timezone

By default, the timezone is `Europe/Madrid`. You can set your own with:

```js
matches('spain', 'real-madrid', { timezone: 'America/New_York' })
matches('england', 'arsenal', { timezone: 'Europe/London' })
```

> For now, use one of this timezones for better results:

* `Europe/Madrid`
* `Europe/London`
* `America/New_York`


## Contribute

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

Feel free to open an _issue_ or a _PR_.


## License

__ISC license__

## Related

* [microsoccer](https://github.com/pablopunk/microsoccer): Microservice to fetch soccer games schedules and tv channels.


## Author

| ![me](https://www.gravatar.com/avatar/fa50aeff0ddd6e63273a068b04353d9d?s=100) |
| ----------------------------------------------------------------------------- |
| © 2017 [Pablo Varela](https://pablo.life)                                     |
