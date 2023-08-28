import { Currency } from '../Currency'
import Bill100 from './images/100Lempira.jpg'
import Bill20 from './images/20Lempira.jpg'
import Bill10 from './images/10Lempira.jpg'
import Bill5 from './images/5Lempira.jpg'
import Bill2 from './images/2Lempira.jpg'
import Bill1 from './images/1Lempira.jpg'

export const HNLCurrency: Currency = {
  name: 'Honduran Lempira',
  shortName: 'HNL',
  symbol: 'L',
  translationKey: 'currency_hnl',
  denominations: [{
    imageSrc: Bill100,
    value: 100,
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
    imageSrc: Bill2,
    value: 2,
    type: 'bill',
  }, {
    imageSrc: Bill1,
    value: 1,
    type: 'bill',
  }],
}
