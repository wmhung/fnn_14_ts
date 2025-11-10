// app/_lib/errors.js
import { CredentialsSignin } from 'next-auth';

export class CouldNotParseError extends CredentialsSignin {
  code = 'could_not_parse';
}

export class UserNotFoundError extends CredentialsSignin {
  code = 'user_not_found';
}

export class InvalidPasswordError extends CredentialsSignin {
  code = 'invalid_password';
}
