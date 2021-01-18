import { MissingParamError, InvalidParamError } from '../errors'
import { badRequest, serverError } from '../helpers/http-helper'
import { Controller, EmailValidator } from '../protocols'

export class SignUpController implements Controller {
  private readonly emailValidator: EmailValidator
  constructor (emailValidator: EmailValidator) {
    this.emailValidator = emailValidator
  }

  handle (httpRequest: any): any {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }
      const email = httpRequest.body.email
      if (!this.emailValidator.isValid(email)) {
        return badRequest(new InvalidParamError(email))
      }
      return {
        statusCode: 200,
        body: 'it works'
      }
    } catch (error) {
      return serverError()
    }
  }
}
