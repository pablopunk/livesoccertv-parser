# livesoccertv-parser

>© All rights reserved to [Live soccer TV](http://www.livesoccertv.com/)

<p align="center">
  <a href="https://travis-ci.org/pablopunk/livesoccertv-parser"><img src="https://img.shields.io/travis/pablopunk/livesoccertv-parser.svg" /> </a>
  <a href="https://codecov.io/gh/pablopunk/livesoccertv-parser"><img src="https://img.shields.io/codecov/c/github/pablopunk/livesoccertv-parser.svg" /> </a>
  <a href="https://standardjs.com/"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" /> </a>
  <a href="https://github.com/pablopunk/miny"><img src="https://img.shields.io/badge/made_with-miny-1eced8.svg" /> </a>
  <a href="https://www.npmjs.com/package/livesoccertv-parser"><img src="https://img.shields.io/npm/dt/livesoccertv-parser.svg" /></a>
</p>

<p align="center">
  <i>Parse games info from livesoccertv</i>
</p>


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
  live: false
  played: true,
  competition: 'Supercopa de España',
  date: 'August 13',
  time: '4:00 PM',
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

By default, the timezone is `America/New_York`. You can set your own with:

```js
matches('spain', 'real-madrid', { timezone: 'Europe/Madrid' })
matches('england', 'arsenal', { timezone: 'Europe/London' })
```

## Contribute

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

Feel free to open an _issue_ or a _PR_.


## License

MIT


## Related

More at [pablo.pink](https://pablo.pink)

* [microsoccer](https://github.com/pablopunk/microsoccer): Microservice to fetch soccer games schedules and tv channels.


## Author

| ![me](https://gravatar.com/avatar/fa50aeff0ddd6e63273a068b04353d9d?size=100)           |
| --------------------------------- |
| © 2018 [Pablo Varela](https://pablo.pink)   |

