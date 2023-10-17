import { Currency } from '../Currency'
import Bill100 from './images/100Dollar.jpg'
import Bill50 from './images/50Dollar.jpg'
import Bill20 from './images/20Dollar.jpg'
import Bill10 from './images/10Dollar.jpg'
import Bill5 from './images/5Dollar.jpg'
import Bill1 from './images/1Dollar.jpg'
import Quarter from './images/Quarter.jpg'
import Dime from './images/Dime.png'
import Nickel from './images/Nickel.jpg'
import Penny from './images/Penny.png'

export const USDCurrency: Currency = {
  name: 'US Dollar',
  shortName: 'USD',
  symbol: '$',
  translationKey: 'currency_usd',
  denominations: [{
    imageSrc: Bill100,
    value: 100,
    type: 'bill',
  }, {
    imageSrc: Bill50,
    value: 50,
    type: 'bill',
  }, {
    imageSrc: Bill20,
    value: 20,
    type: 'bill',
  }, {
    imageSrc: Bill10,
    value: 10,
    type: 'bill',
  }, {
    imageSrc: Bill5,
    value: 5,
    type: 'bill',
  }, {
    imageSrc: Bill1,
    value: 1,
    type: 'bill',
  }, {
    imageSrc: Quarter,
    value: 0.25,
    type: 'coin',
  }, {
    imageSrc: Dime,
    value: 0.1,
    type: 'coin',
  }, {
    imageSrc: Nickel,
    value: 0.05,
    type: 'coin',
  }, {
    imageSrc: Penny,
    value: 0.01,
    type: 'coin',
  }],
}
