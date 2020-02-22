/* tslint:disable */
import { expect } from 'chai'
import { LoggerAliyun } from '../src/index'

describe('Index', function() {
  it('存在 LoggerAliyun', function() {
    expect(LoggerAliyun).not.null
    expect(LoggerAliyun).not.undefined
    expect(typeof LoggerAliyun).to.be.equal('function')
  })
})
