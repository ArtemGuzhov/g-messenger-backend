import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'

import { PaginationQueryDTO } from '../../../shared/dto/pagination-query.dto'
import { ListResponse } from '../../../shared/interfaces/list-response.interface'
import { GetJwtPayload } from '../../auth/decorators/get-jwt-payload.decorator'
import { IJwtPayload } from '../../auth/services/interfaces/jwt-payload.interface'
import { UsersEntity } from '../entities/users.entity'
import { UsersService } from '../services/users.service'

@Controller({
  path: 'users',
  version: '1',
})
export class UsersControllerV1 {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/:id')
  async getUserProfile(@Param('id', ParseUUIDPipe) id: string): Promise<UsersEntity> {
    return this.usersService.getUserProfile(id)
  }

  @Get('my-profile')
  async getMyProfile(@GetJwtPayload() jwtPayload: IJwtPayload): Promise<UsersEntity> {
    return this.usersService.getUserProfile(jwtPayload.userId)
  }

  @Get('my-team')
  async getMyTeam(@GetJwtPayload() jwtPayload: IJwtPayload): Promise<UsersEntity[]> {
    return this.usersService.getUserTeam(jwtPayload.userId, jwtPayload.companyId)
  }

  @Get('for-create-chat')
  async getUsersForCreateChat(
    @GetJwtPayload() jwtPayload: IJwtPayload,
    @Query() query: PaginationQueryDTO,
  ): Promise<ListResponse<UsersEntity>> {
    return this.usersService.getUsersForCreateChat(
      jwtPayload.userId,
      jwtPayload.companyId,
      query,
    )
  }
}
