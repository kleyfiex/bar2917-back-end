import { IsString } from 'class-validator';

export class FeedbackDto {

  @IsString()
  text: string;

}
