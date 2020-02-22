/* tslint:disable */
import { expect } from 'chai'
import { Level } from 'luckystarry-log4ts'
import { LoggerAliyun } from '../src/logger-aliyun'
import { SLSClient } from '../src/sls-client'

describe('./logger-aliyun.ts', function() {
  it('存在 LoggerAliyun', function() {
    expect(LoggerAliyun).not.null
    expect(LoggerAliyun).not.undefined
    expect(typeof LoggerAliyun).to.be.equal('function')
  })
  it('LoggerAliyun.Debug', function() {
    let logger = new LoggerAliyun('test')
    logger['output'] = function(level: Level, message: string): void {
      expect(level).is.equal('DEBUG')
      expect(message).is.equal('test-message-debug')
    }

    logger.Debug('test-message-debug')
  })

  it('LoggerAliyun.Info', function() {
    let logger = new LoggerAliyun('test')
    logger['output'] = function(level: Level, message: string): void {
      expect(level).is.equal('INFO')
      expect(message).is.equal('test-message-info')
    }

    logger.Info('test-message-info')
  })

  it('LoggerAliyun.Warning', function() {
    let logger = new LoggerAliyun('test')
    logger['output'] = function(level: Level, message: string): void {
      expect(level).is.equal('WARNING')
      expect(message).is.equal('test-message-warn')
    }

    logger.Warning('test-message-warn')
  })

  it('LoggerAliyun.Error', function() {
    let logger = new LoggerAliyun('test')
    logger['output'] = function(level: Level, message: string): void {
      expect(level).is.equal('ERROR')
      expect(message).is.equal('test-message-error')
    }

    logger.Error('test-message-error')
  })

  it('LoggerAliyun.output', function() {
    let logger = new LoggerAliyun('test-logger')
    let client: any = {}
    client.postLogStoreLogs = async function(
      data: { logs: any[]; tags: any[] },
      options?: any
    ): Promise<string> {
      expect(data).is.not.null
      expect(data).is.not.undefined
      expect(options).is.undefined
      expect(data.logs).is.not.null
      expect(data.logs).is.not.undefined
      expect(data.logs.length).is.equal(1)
      expect(data.logs[0].content.level).is.equal('Info')
      expect(data.logs[0].content.message).is.equal('test-message')
      expect(data.logs[0].content.type).is.equal('test-logger')
      expect(data.logs[0].content.testString).is.equal('value')
      expect(data.logs[0].content['test-number']).is.equal('12345')
      expect(data.logs[0].content.result).is.equal('true')
      expect(data.logs[0].content.obj).is.equal('{"test": 1 }')
      expect(data.logs[0].content.undefined).is.undefined
      return ''
    }
    LoggerAliyun.Client = client as SLSClient

    logger.Info('test-message', {
      testString: 'value',
      'test-number': 12345,
      result: true,
      undefined: undefined,
      obj: { test: 1 }
    })

    LoggerAliyun.Client = null

    expect(() => logger.Info('not-record')).not.throw
  })
})
