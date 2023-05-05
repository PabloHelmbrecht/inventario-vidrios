import { type AppType } from 'next/app'
import { type Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'

import '~/styles/globals.css'

import Nav from '../components/nav'

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
    return (
        <SessionProvider session={session}>
            <Nav />
            <Component {...pageProps} />
        </SessionProvider>
    )
}

export default MyApp
