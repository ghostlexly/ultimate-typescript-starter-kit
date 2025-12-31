import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const passwordUtils = {
  /**
   * Hash a plain text password
   */
  hash: (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Compare a plain text password with a hashed password
   */
  compare: (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};
