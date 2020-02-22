import Client from '@alicloud/log'
import os from 'os'
import path from 'path'
import protobuf from 'protobufjs'
import { LoggerAliyunConfig } from './logger-aliyun-config'

const builder = protobuf.loadSync(path.resolve(__dirname, './sls.proto'))
const LogProto: any = builder.lookup('sls.Log')
const LogContentProto: any = builder.lookup('sls.Log.Content')
const LogTagProto: any = builder.lookupType('sls.LogTag')
const LogGroupProto: any = builder.lookupType('sls.LogGroup')

/* istanbul ignore next */
export class SLSClient {
  private client: Client
  private topic: string
  private source: string
  private project: string
  private logstoreName: string
  public constructor(config: LoggerAliyunConfig) {
    this.client = new Client({
      region: config.Region,
      net: config.Net,
      accessKeyId: config.AccessKeyID,
      accessKeySecret: config.AccessKeySecret,
      securityToken: config.SecurityToken
    })
    this.topic = config.Topic || ''
    this.project = config.Project || ''
    this.logstoreName = config.LogStore || ''
    this.source = os.hostname() || ''
  }

  public postLogStoreLogs(
    data: { logs: any[]; tags: any[] },
    options?: any
  ): Promise<string> {
    const path = `/logstores/${this.logstoreName}/shards/lb`
    if (!Array.isArray(data.logs)) {
      throw new Error('data.logs must be array!')
    }
    let payload: any = {}
    payload.Logs = data.logs.map(log => {
      const logPayload = {
        Time: log.timestamp,
        Contents: Object.entries(log.content).map(([Key, Value]) => {
          const logContentPayload = { Key, Value }
          const err = LogContentProto.verify(logContentPayload)
          if (err) throw err
          return logContentPayload
        })
      }
      const err = LogProto.verify(logPayload)
      if (err) throw err
      return logPayload
    })
    if (Array.isArray(data.tags)) {
      payload.LogTags = data.tags.reduce((tags, tag) => {
        Object.entries(tag).forEach(([Key, Value]) => {
          const tagPayload = { Key, Value }
          const err = LogTagProto.verify(tagPayload)
          if (err) throw err
          tags.push(tagPayload)
        })
        return tags
      }, [])
    }
    // HOTFIX START
    payload.Topic = this.topic
    payload.Source = this.source
    // HOTFIX END
    const err = LogGroupProto.verify(payload)
    if (err) throw new Error(err)
    let body = LogGroupProto.create(payload)
    body = LogGroupProto.encode(body).finish()
    const rawLength = body.byteLength
    const headers = {
      'x-log-bodyrawsize': rawLength,
      'content-type': 'application/x-protobuf'
    }
    return this.client._request(
      'POST',
      this.project,
      path,
      {},
      body,
      headers,
      options
    )

    return Promise.resolve('')
  }
}
