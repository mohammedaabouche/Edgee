import { Connection, Channel, connect,ConsumeMessage } from 'amqplib'
import { Script } from 'prisma/script'

import * as config from './env'
export class Recever {
    private connection: Connection
    private channel: Channel
    private exchange:string ="logs"
    private script= new Script
    private url:string ="amqp://localhost:5672/"
    
    public async sendData(
      date: number,
      devAddr: string,
      devEUI: string,
      appEUI: string,
      type: number,
      source: string,
      payload: Buffer,
      url:string
    ): Promise<boolean> {
      try {
        let connection: Connection=await connect(url)
        let channel: Channel=await connection.createChannel()
    
        channel.assertExchange("amq.topic","topic")
        return channel.publish(
          "amq.topic",
          "data" ,
          payload,
          {
            headers: {
              date: date,
              type: type,
              source: source,
              devAddr: devAddr,
              devEUI: devEUI,
              appEUI: appEUI
            },
            persistent: true
          },
        )
      } catch (error: any) {
        throw new Error(`AMQP ERROR: ${error}`)
      }
    }
    public async getData( url:string):Promise<any> {
      try {
        let connection: Connection=await connect( url)
        let channel: Channel=await connection.createChannel()
    
        channel.assertExchange("amq.topic","topic")
        
          let q=channel.assertQueue('', {exclusive: true},)
          channel.bindQueue((await q).queue,"amq.topic",'*')
          channel.consume((await q).queue,async (msg)=>{
            let deviceAddress =msg.properties.headers["devAddr"]
            let message=msg.content
            let mqttServer= this.script.getMqttServer(deviceAddress)
            channel.ack(msg)
            this.sendData(1,deviceAddress,msg.properties.headers["devEUI"],msg.properties.headers["appEUI"],1,"z",message,"amqp://"+await connect("amqp://"+(await mqttServer)["username"]+":"+(await mqttServer)["password"]+"@"+(await mqttServer)["host"]))
          })
           
          
            
      } catch (error: any) {
        throw new Error(`AMQP ERROR: ${error}`)
      }
  
    }
  }
  
