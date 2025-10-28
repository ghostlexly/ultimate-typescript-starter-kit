import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @description Decorator to mark a route as public
 * Public ne transporte qu’un booléen constant.
 * Avec SetMetadata, on peut écrire @Public() sans passer d’argument.
 * Si on utilisait Reflector.createDecorator<boolean>() , cela exigerait typiquement @Public(true).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
