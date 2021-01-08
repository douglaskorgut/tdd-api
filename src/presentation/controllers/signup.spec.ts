import { SignUpController } from './signup'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError } from '../errors/MissingParamError';

describe('SignUp Controller', () => {
  test('should return 400 if no nome is provided', () => {
    // sut = system under test
    const sut = new SignUpController()
    const httpRequest: HttpRequest = {
      body: {
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('should return 400 if no email is provided', () => {
    // sut = system under test
    const sut = new SignUpController()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided', () => {
    // sut = system under test
    const sut = new SignUpController()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 400 if no password confirmation is provided', () => {
    // sut = system under test
    const sut = new SignUpController()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password'
      }
    }
    const httpResponse: HttpResponse = sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })
})
