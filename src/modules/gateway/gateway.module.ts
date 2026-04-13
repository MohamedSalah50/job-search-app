import { Module } from "@nestjs/common";
import { RealTimeGateway } from "./gateway";
import { WebSocketGateway } from "@nestjs/websockets";


@WebSocketGateway( { cors: { origin: '*' } })
@Module({
    providers: [RealTimeGateway],
})
export class RealTimeModule{

}