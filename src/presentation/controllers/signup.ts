import { MissingParamError } from '../errors/MissingParamError'
import { badRequest } from '../helpers/http-helper'

export class SignUpController {
  handle (httpRequest: any): any {
    const requiredFields = ['name', 'email']
    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }
  }
}
