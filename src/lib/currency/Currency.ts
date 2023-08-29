export type Denomination = {
  imageSrc: string
  value: number
  type: 'coin' | 'bill'
}

export type Currency = {
  name: string
  shortName: string
  symbol: string
  translationKey: string
  denominations: Denomination[]
}

export type Change = {
  denomination: Denomination
  count: number
}[]

export function computeChange (value: number, currency: Currency): Change {
  const change: Change = []
  let remaining = value
  for (const denomination of currency.denominations) {
    const count = Math.floor(remaining / denomination.value)
    if (count > 0) {
      change.push({
        denomination,
        count,
      })
      remaining -= count * denomination.value
    }
  }
  return change
}
