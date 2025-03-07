import { createClient, RedisClientType } from "redis"

export default function connectRedis(): Promise<RedisClientType> {
  return new Promise<RedisClientType>((resolve, reject) => {
    const redisClient: RedisClientType = createClient({
      url: process.env.REDIS
    })

    redisClient.on('error', err => {
      console.log('=> Redis Client Error')
      reject(err)
    })
  
    redisClient.on('connect', () => {
      console.log(`=> Redis connected redis://${redisClient.options?.url || "localhost:6379"}\n`)
      resolve(redisClient)
    })
  
    console.log("Connecting Redis... "+ process.env.REDIS)
    redisClient.connect()
  })
}