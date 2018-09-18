import LoggingServiceAbstract from './LoggingServiceAbstract'

class LoggingServiceWeb extends LoggingServiceAbstract {

  async log (_request) {
    throw new Error('Unimplemented')
  }

}

export default LoggingServiceWeb
