import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { LoginDto } from './login.dto';

function errorsFor(body: object) {
  const errors = validateSync(plainToInstance(LoginDto, body));
  return errors.map((error) => error.property);
}

describe('LoginDto', () => {
  it('accepts a valid user name and password', () => {
    expect(errorsFor({ name: 'artem_99', password: 'secret123' })).toEqual([]);
  });

  it('accepts boundary lengths: 2-char name and 12-char password', () => {
    expect(errorsFor({ name: 'ab', password: 'abcdef123456' })).toEqual([]);
  });

  it('trims and lowercases the user name', () => {
    const dto = plainToInstance(LoginDto, {
      name: '  Artem ',
      password: 'secret123',
    });
    expect(dto.name).toBe('artem');
  });

  it.each([
    ['too short', 'a'],
    ['too long', 'a'.repeat(33)],
    ['invalid characters', 'artem!'],
    ['spaces inside', 'ar tem'],
  ])('rejects a user name that is %s', (_label, name) => {
    expect(errorsFor({ name, password: 'secret123' })).toEqual(['name']);
  });

  it.each([
    ['too short', 'abc123'],
    ['longer than 12 chars', 'abcdef1234567'],
    ['without digits', 'onlyletters'],
    ['without letters', '12345678'],
  ])('rejects a password that is %s', (_label, password) => {
    expect(errorsFor({ name: 'artem', password })).toEqual(['password']);
  });
});
