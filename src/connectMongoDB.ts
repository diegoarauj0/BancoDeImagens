import { connect } from "mongoose"

export default async function connectMongoDB(): Promise<void> {
  const database = await connect(process.env.MONGODB)
  console.log(`mongoDB connected mongodb+srv://${database.connection.host}:${database.connection.port}`)
}