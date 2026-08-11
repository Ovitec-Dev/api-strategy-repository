import { Module } from '@nestjs/common';
import { MessageBrokerService } from './messaging.service';

@Module({
  providers: [MessageBrokerService],
  exports: [MessageBrokerService],
})
export class MessagingModule { }
