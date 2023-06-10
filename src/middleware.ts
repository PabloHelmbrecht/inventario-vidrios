/* eslint-disable @typescript-eslint/no-empty-function */
import { withAuth } from 'next-auth/middleware'
import { env } from '~/env.mjs'

export default env.NODE_ENV !== 'development'
    ? withAuth({
          pages: {
              signIn: '/auth/signin',
          },
          // eslint-disable-next-line @typescript-eslint/no-empty-function
      })
    : () => {}
