// models/Glass.ts
export interface Glass {
    id: number
    type?: GlassType | null
    typeId?: number | null
    status: GlassStatus
    quantity: number
    createdAt: Date
    updatedAt: Date
    location?: GlassLocation | null
    locationId?: number | null
    width: number
    height: number
    vendor?: GlassVendor | null
    vendorId?: number | null
    GlassMovement: GlassMovement[]
    Comment?: string | null
}

/* eslint-disable */
export enum GlassStatus {
    TRANSIT = 'TRANSIT',
    STORED = 'STORED',
    CONSUMED = 'CONSUMED',
}
/* eslint-enable */

export interface GlassMovement {
    id: number
    glass: Glass
    glassId: number
    column: string
    oldValue?: string
    newValue: string
    updatedAt: Date
    userId: number
    user: User
}

export interface GlassType {
    id: number
    name: string
    description: string
    createdAt: Date
    updatedAt: Date
    Glass: Glass[]
}

export interface GlassLocation {
    id: number
    position: string
    warehouse: string
    createdAt: Date
    updatedAt: Date
    Glass: Glass[]
}

export interface GlassVendor {
    id: number
    name: string
    createdAt: Date
    updatedAt: Date
    Glass: Glass[]
}

export interface Account {
    id: number
    userId: number
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    user: User
}

export interface Session {
    id: number
    sessionToken: string
    userId: number
    expires: Date
    user: User
}
/* eslint-disable */
export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}
/* eslint-enable */

export interface User {
    id: number
    name?: string | null
    email?: string | null
    emailVerified?: Date | null
    image?: string | null
    role: Role
    accounts: Account[]
    sessions: Session[]
    GlassMovement: GlassMovement[]
}

export interface VerificationToken {
    identifier: string
    token: string
    expires: Date
}
