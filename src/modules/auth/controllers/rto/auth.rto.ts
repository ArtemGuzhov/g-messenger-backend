import { ApiProperty } from '@nestjs/swagger'

import { CommonResponseRTO } from '../../../../shared/rto/common-response.rto'

export class AuthRTO {
  @ApiProperty()
  accessToken: string

  @ApiProperty()
  refreshToken: string
}

export class OneAuthRTO extends CommonResponseRTO<AuthRTO> {
  @ApiProperty({ type: AuthRTO })
  data: AuthRTO | null
}
