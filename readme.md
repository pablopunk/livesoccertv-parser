# livesoccertv-parser

>© All rights reserved to [Live soccer TV](http://www.livesoccertv.com/)

## Install

```bash
npm install --save livesoccertv-parser
```

## Usage

The parser works with promises:

```js
const matches = require('livesoccertv-parser')
console.log(matches('spain', 'real madrid')) //=> [{...}, {...}, ...]
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
      'Radio Barca (International)',
      'LAOLA1.TV (Austria, Georgia, Germany…)',
    ]
}
```

## Contribute

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

Feel free to open an _issue_ or a _PR_.


## License

__ISC license__

## Author

| ![me](https://www.gravatar.com/avatar/fa50aeff0ddd6e63273a068b04353d9d?s=100) |
| ----------------------------------------------------------------------------- |
| © 2017 [Pablo Varela](https://pablo.life)                                     |
