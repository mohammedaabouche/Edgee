import { PrismaClient } from '@prisma/client'
import { title } from 'process'

const prisma = new PrismaClient()

export class Script {
public async  getMqttServer(serial:string):Promise<any> {
    try{
       
    const mqttServer = await prisma.device.findUnique({
        where: {
          serial: serial,
        },
        select: {
            mqttServer: true
          
        },
      })
      return mqttServer
    

    }
    catch (error: any) {
        throw new Error(`DB ERROR: ${error}`)
    }
}

  
}