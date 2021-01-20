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
    async add (account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password'
      }
      return new Promise((resolve) => resolve(fakeAccount))
    }
  }
  const addAccountStub = new AddAccountStub()
  return addAccountStub
}

describe('SignUp Controller', () => {
  test('should return 400 if no nome is provided', async () => {
    // sut = system under test
    const sutType = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = await sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('should return 400 if no email is provided', async () => {
    // sut = system under test
    const sutType = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        password: 'password',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = await sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if no password is provided', async () => {
    // sut = system under test
    const sutType = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        passwordConfirmation: 'passwordConfirmation'
      }
    }
    const httpResponse: HttpResponse = await sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 400 if no password confirmation is provided', async () => {
    // sut = system under test
    const sutType = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password'
      }
    }
    const httpResponse: HttpResponse = await sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  test('should return 400 if invalid email provided', async () => {
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
    const httpResponse: HttpResponse = await sutType.sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new InvalidParamError(email))
  })

  test('should return 400 if password confirmation fails', async () => {
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
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(400)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  test('Should call EmailValidator with correct email', async () => {
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
    await sutType.sut.handle(httpRequest)
    expect(isValidSpy).toBeCalledWith('email@gmail.com')
  })

  test('should return 500 if invalid email validator throws', async () => {
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
    const httpResponse: HttpResponse = await sut.handle(httpRequest)
    // toBe expect to identical objects
    expect(httpResponse.statusCode).toBe(500)
    // toEqual expect identical values
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should call AddAccount with correct values', async () => {
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
    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'email@gmail.com',
      password: 'any_password'
    })
  })

  test('should return 500 if AddAccount throws', async () => {
    const { sut, addAccount } = makeSutType()
    jest.spyOn(addAccount, 'add').mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new Error()))
    })
    const httpRequest: HttpRequest = {
      body: {
        name: 'any_name',
        email: 'email@gmail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const { statusCode, body } = await sut.handle(httpRequest)
    expect(statusCode).toBe(500)
    expect(body).toEqual(new ServerError())
  })

  test('should return 200 if valid data is provided', async () => {
    const { sut } = makeSutType()
    const httpRequest: HttpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }
    const { statusCode, body } = await sut.handle(httpRequest)
    expect(statusCode).toBe(200)
    expect(body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    })
  })
})
