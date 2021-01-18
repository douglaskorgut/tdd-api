import { SignUpController } from './signup'
import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingParamError, InvalidParamError, ServerError } from '../errors'
import { EmailValidator } from '../protocols/email-validator'

interface SutTypes {
  sut: SignUpController
  emailValidator: EmailValidator
}

const makeSutType = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)
  return {
    sut: sut,
    emailValidator: emailValidatorStub
  }
}

describe('SignUp Controller', () => {
  test('should return 400 if no nome is provided', () => {
    // sut = system under test
    const sutType = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('should return 400 if no email is provided', () => {
    // sut = system under test
    const sutType = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided', () => {
    // sut = system under test
    const sutType = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 400 if no password confirmation is provided', () => {
    // sut = system under test
    const sutType = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password'
      }
    }
    const httpResponse: HttpResponse = sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  test('should return 400 if invalid email provided', () => {
    // sut = system under test
    const sutType = makeSutType()
    const emailValidatorStub = sutType.emailValidator
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValue(false)
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const email = httpRequest.body.email
    const httpResponse: HttpResponse = sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new InvalidParamError(email))
  })

  test('Should call EmailValidator with correct email', () => {
    // sut = system under test
    const sutType = makeSutType()
    const emailValidatorStub = sutType.emailValidator
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    sutType.sut.handle(httpRequest)
    expect(isValidSpy).toBeCalledWith('email@gmail.com')
  })

  test('should return 500 if invalid email validator throws', () => {
    // sut = system under test
    class EmailValidatorStub implements EmailValidator {
      isValid (email: string): boolean {
        throw new Error()
      }
    }
    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(500)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
