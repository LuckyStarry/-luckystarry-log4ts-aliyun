import { Level, Logger } from 'luckystarry-log4ts'
import { LoggerAliyunConfig } from './logger-aliyun-config'
import { SLSClient } from './sls-client'

export class LoggerAliyun implements Logger {
  private static client: SLSClient = null
  private type: string
  public constructor(type: string) {
    this.type = type
  }

  public Debug(message: string, extra?: { [key: string]: any }): void {
    this.output('DEBUG', message, extra)
  }

  public Info(message: string, extra?: { [key: string]: any }): void {
    this.output('INFO', message, extra)
  }

  public Warning(message: string, extra?: { [key: string]: any }): void {
    this.output('WARNING', message, extra)
  }

  public Error(message: string, extra?: { [key: string]: any }): void {
    this.output('ERROR', message, extra)
  }

  private output(
    level: Level,
    message: string,
    extra?: { [key: string]: any }
  ): void {
    let data = { logs: [], tags: [] }
    let content = {}
    for (let property in extra) {
      let value = extra[property]
      if (value !== undefined) {
        if (typeof value === 'string') {
          content[property] = value
        } else if (typeof value === 'number') {
          content[property] = value.toString()
        } else if (typeof value === 'boolean') {
          content[property] = value.toString()
        } else {
          content[property] = JSON.stringify(value)
        }
      }
    }
    content['level'] = level
    content['message'] = message
    content['module'] = this.type

    data.logs.push({
      content,
      timestamp: Math.floor(new Date().getTime() / 1000)
    })
    /* istanbul ignore next */
    if (LoggerAliyun.Client) {
      LoggerAliyun.Client.postLogStoreLogs(data)
        .then(x => x)
        .catch(e => e)
    }
  }
  /* istanbul ignore next */
  public static init(config?: LoggerAliyunConfig) {
    config = Object.assign(
      {
        Region: process.env.ALIYUN_SLS_REGION,
        Net: process.env.ALIYUN_SLS_NET,
        AccessKeyID: process.env.ALIYUN_SLS_ACCESS_KEY_ID,
        AccessKeySecret: process.env.ALIYUN_SLS_ACCESS_KEY_SECRET,
        SecurityToken: process.env.ALIYUN_SLS_SECURITY_TOKEN,
        Topic: process.env.ALIYUN_SLS_TOPIC
      },
      config
    )
    LoggerAliyun.Client = new SLSClient(config)
  }

  public static set Client(value: SLSClient) {
    LoggerAliyun.client = value
  }

  public static get Client(): SLSClient {
    return LoggerAliyun.client
  }
}
