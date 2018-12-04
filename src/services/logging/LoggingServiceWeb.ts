import LoggingServiceAbstract from './LoggingServiceAbstract'
import Log from "../../entities/trellis-config/Log";

class LoggingServiceWeb extends LoggingServiceAbstract {

  async log (_request) {
    // TODO: Implement the web version
    const log = this.createLog(_request)
    if (this.shouldWriteLog(log)) {
      this.consoleLog(log)
    }
  }

  async getLogPage (page: number, limit: number): Promise<Log[]> {
    throw new Error('LoggingServiceWeb.getLogPage is unimplemented')
  }

  async getLogCount (): Promise<number> {
    throw new Error('LoggingServiceWeb.getLogCount is unimplemented')
  }

  async getUploadedCount (): Promise<number> {
    throw new Error('LoggingServiceWeb.getUploadedCount is unimplemented')
  }

}

export default LoggingServiceWeb
