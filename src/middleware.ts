import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // 'secret' should be the same 'process.env.SECRET' use in NextAuth function
  const session = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET }); console.log('session in middleware: ', session)

  
  return NextResponse.next()
}
