import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common'

// import { PaginationQueryDTO } from '../../../shared/dto/pagination-query.dto'
// import { ListResponse } from '../../../shared/interfaces/list-response.interface'
import { GetJwtPayload } from '../../auth/decorators/get-jwt-payload.decorator'
import { JwtPayload } from '../../auth/services/interfaces/jwt-payload.interface'
import { UsersEntity } from '../entities/users.entity'
import { UsersService } from '../services/users.service'
import { IsPublic } from 'src/modules/auth/decorators/is-public.decorator'

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
  async getMyProfile(@GetJwtPayload() jwtPayload: JwtPayload): Promise<UsersEntity> {
    return this.usersService.getUserProfile(jwtPayload.userId)
  }

  @Get('my-team')
  async getMyTeam(@GetJwtPayload() jwtPayload: JwtPayload): Promise<UsersEntity[]> {
    return this.usersService.getUserTeam(jwtPayload.userId, jwtPayload.companyId)
  }

  @IsPublic()
  @Post('create')
  async create(@Body() body: any): Promise<UsersEntity> {
    return this.usersService.create(body)
  }

  // @Get('for-create-chat')
  // async getUsersForCreateChat(
  //   @GetJwtPayload() jwtPayload: JwtPayload,
  //   @Query() query: PaginationQueryDTO,
  // ): Promise<ListResponse<UsersEntity>> {
  //   return this.usersService.getUsersForCreateChat(
  //     jwtPayload.userId,
  //     jwtPayload.companyId,
  //     query,
  //   )
  // }

  @Patch('update/favorite-chats/:chatId')
  async updateFavoriteChats(
    @GetJwtPayload() jwtPayload: JwtPayload,
    @Param('chatId') chatId: string,
  ): Promise<void> {
    return this.usersService.addOrRemoveFavoriteChat(jwtPayload.userId, chatId)
  }
}
