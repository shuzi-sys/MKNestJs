import { Jwtsecret } from './jwtsecret';

describe('Jwtsecret', () => {
  it('should be defined', () => {
    expect(new Jwtsecret()).toBeDefined();
  });
});
