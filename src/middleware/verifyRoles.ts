import { Request, Response, NextFunction } from "express"

type RequestRoles = {
  roles: Array<string>
}

const verifyRoles = (...allowedRoles: Array<string>) => {
  return (req: Request & RequestRoles, res: Response, next: NextFunction) => {
    if (!req?.roles) {
      return res.sendStatus(401)
    }

    const rolesArray = [...allowedRoles]

    const result = req.roles
      .map((role) => rolesArray.includes(role))
      .find((val) => val === true)

    if (!result) {
      // We did not find a true result.
      return res.sendStatus(401) // unauthorized
    }

    // We have a result for this route. Go to next.
    next()
  }
}

export default verifyRoles
