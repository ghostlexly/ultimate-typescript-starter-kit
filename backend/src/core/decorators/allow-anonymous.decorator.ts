import { SetMetadata } from '@nestjs/common';

export const ALLOW_ANONYMOUS_KEY = 'allowAnonymous';

/**
 * @description Decorator to mark a route to allow anonymous access
 * AllowAnonymous transporte qu’un booléen constant.
 * Avec SetMetadata, on peut écrire @AllowAnonymous() sans passer d’argument.
 * Si on utilisait Reflector.createDecorator<boolean>() , cela exigerait typiquement @AllowAnonymous(true).
 */
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_KEY, true);
