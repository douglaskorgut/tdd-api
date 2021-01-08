import { SignUpController } from './signup'

describe('SignUp Controller', () => {
  test('should return 400 if no nome is provided', () => {
    // sut = system under test
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new Error('Missing param: name'))
  })

  test('should return 400 if no email is provided', () => {
    // sut = system under test
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        name: 'any_name@gmail.com',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new Error('Missing param: email'))
  })
})
