import envelopeBackSrc from '../../assets/distribution/envelope-back.svg'
import envelopeFrontSrc from '../../assets/distribution/envelope-front.svg'
import envelopeClosedSrc from '../../assets/distribution/envelope-closed.svg'
import walletOpenSrc from '../../assets/distribution/wallet.svg'
const walletClosedSrc = walletOpenSrc

export type Bin = {
  name: string
  labelTranslationId?: string
  displayImageSrc: string
  padding?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
  open: {
    backSrc: string
    frontSrc?: string
  }
  closed: {
    backSrc: string
    frontSrc?: string
  }
}

export const EnvelopeBin: Bin = {
  name: 'envelope',
  displayImageSrc: envelopeClosedSrc,
  open: {
    backSrc: envelopeBackSrc,
    frontSrc: envelopeFrontSrc,
  },
  closed: {
    backSrc: envelopeClosedSrc,
  },
}

export const WalletBin: Bin = {
  name: 'wallet',
  displayImageSrc: walletOpenSrc,
  open: {
    backSrc: walletOpenSrc,
    frontSrc: walletOpenSrc,
  },
  closed: {
    backSrc: walletClosedSrc,
  },
  padding: {
    left: 20,
  },
}

export const bins = {
  envelope: EnvelopeBin,
  wallet: WalletBin,
}
