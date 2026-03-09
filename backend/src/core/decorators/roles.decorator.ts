import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/generated/prisma/client';

export const ROLES_KEY = 'Roles';

/**
 * @description Decorator to mark a route as requiring a specific role
 * @param roles - The roles required to access the route
 */
export const Roles = (roles: Role[]) => SetMetadata(ROLES_KEY, roles);
