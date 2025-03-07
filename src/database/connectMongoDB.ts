import { connect } from "mongoose"

export default async function connectMongoDB(): Promise<void> {
  console.log("Connecting MongoDB... "+ process.env.MONGODB)
  const database = await connect(process.env.MONGODB)
  console.log(`=> MongoDB connected mongodb+srv://${database.connection.host}:${database.connection.port}\n`)
}