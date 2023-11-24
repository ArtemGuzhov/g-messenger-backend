import { IsNotEmpty, IsUUID } from 'class-validator'

export class DeleteDialogDTO {
  @IsUUID()
  @IsNotEmpty()
  id: string
}
