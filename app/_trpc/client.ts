'use client'

import { createTRPCReact } from '@trpc/react-query'

import type { AppRouter } from '@/app/server/routers'

export const trpc = createTRPCReact<AppRouter>({})
