import { connect } from "mongoose"
import { createClient, RedisClientType } from "redis"

export async function connectMongoDB(): Promise<void> {
  console.log("Connecting MongoDB... "+ process.env.MONGODB)
  const database = await connect(process.env.MONGODB)
  console.log(`=> MongoDB connected mongodb+srv://${database.connection.host}:${database.connection.port}\n`)
}

export function connectRedis(): Promise<RedisClientType> {
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