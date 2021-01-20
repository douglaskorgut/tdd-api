import { SignUpController } from './signup'
import { HttpRequest, HttpResponse, EmailValidator, AccountModel, AddAccount, AddAccountModel } from './signup-protocols'
import { MissingParamError, InvalidParamError, ServerError } from '../../errors'

interface SutTypes {
  sut: SignUpController
  emailValidator: EmailValidator
  addAccount: AddAccount
}

const makeSutType = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const addAddAccountStub = makeAddAccount()
  const sut = new SignUpController(emailValidatorStub, addAddAccountStub)
  return {
    sut: sut,
    emailValidator: emailValidatorStub,
    addAccount: addAddAccountStub
  }
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  const emailValidatorStub = new EmailValidatorStub()
  return emailValidatorStub
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    add (account: AddAccountModel): AccountModel {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password'
      }
      return fakeAccount
    }
  }
  const addAccountStub = new AddAccountStub()
  return addAccountStub
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
        passwordConfirmation: 'password'
      }
    }
    const email = httpRequest.body.email
    const httpResponse: HttpResponse = sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new InvalidParamError(email))
  })

  test('should return 400 if password confirmation fails', () => {
    // sut = system under test
    const sut = makeSutType().sut
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
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
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
        passwordConfirmation: 'password'
      }
    }
    sutType.sut.handle(httpRequest)
    expect(isValidSpy).toBeCalledWith('email@gmail.com')
  })

  test('should return 500 if invalid email validator throws', () => {
    // sut = system under test
    const { sut, emailValidator } = makeSutType()
    jest.spyOn(emailValidator, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse: HttpResponse = sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(500)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should call AddAccount with correct values', () => {
    const { sut, addAccount } = makeSutType()
    const addSpy = jest.spyOn(addAccount, 'add')
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'email@gmail.com',
      password: 'any_password'
    })
  })

  test('should return 500 if AddAccount throws', () => {
    const { sut, addAccount } = makeSutType()
    jest.spyOn(addAccount, 'add').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const { statusCode, body } = sut.handle(httpRequest)
    expect(statusCode).toBe(500)
    expect(body).toEqual(new ServerError())
  })
})
