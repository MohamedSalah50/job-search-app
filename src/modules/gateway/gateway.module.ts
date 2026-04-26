import { Module } from "@nestjs/common";
import { RealTimeGateway } from "./gateway";
import { WebSocketGateway } from "@nestjs/websockets";
import { ChatModule } from "../chat/chat.module";


@WebSocketGateway( { cors: { origin: '*' } })
@Module({
    imports: [ChatModule],
    providers: [RealTimeGateway],
})
export class RealTimeModule{

}