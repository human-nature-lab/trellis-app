import { NearbyCommunications } from '.'

export class NBCSocket {
  constructor (public endpointId: string, private nbc: NearbyCommunications) {
    this.endpointId = endpointId
  }

  public async connect () {
    if (this.nbc.s)
    await this.nbc.acceptConnection(this.endpointId)
  }
}
