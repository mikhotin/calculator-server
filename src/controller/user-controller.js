const userService = require("../service/user-service");
const ApiError = require("../exeptions/api-error");
const { validationResult } = require("express-validator");

class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(
          ApiError.BadRequest("Ошибка при валидации", errors.array())
        );
      }

      const { email, password } = req.body;
      const userData = await userService.registration(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none', // тест
        secure: true, // тест
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none', // тест
        secure: true, // тест
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logOut(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logOut(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);

      return res.redirect(process.env.CLIENT_URL); //редиректим на адрес фронта
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies; //  забирает с куки рефреш токен, нужно проверить их

      console.log(refreshToken, 'req.cookies refreshToken')

      const userData = await userService.refresh(refreshToken);
      console.log('refresh func')
      console.log(userData, 'userData in refresh func')
      res.cookie("refreshToken", userData.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none', // тест
        secure: true, // тест
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
