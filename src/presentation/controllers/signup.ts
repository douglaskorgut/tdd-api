import { MissingParamError } from '../errors/MissingParamError'
import { badRequest } from '../helpers/http-helper'

export class SignUpController {
  handle (httpRequest: any): any {
    if (!httpRequest.body.name) {
      return badRequest(new MissingParamError('name'))
    } if (!httpRequest.body.email) {
      return badRequest(new MissingParamError('email'))
    }
  }
}
