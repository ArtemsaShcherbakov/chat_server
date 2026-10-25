import type { Translations } from './en';

export const ru: Translations = {
  auth: {
    fields: {
      userName: 'Имя пользователя',
      email: 'Эл. почта',
      password: 'Пароль',
      confirmPassword: 'Повторите пароль',
      show: 'Показать',
      hide: 'Скрыть',
      showPassword: 'Показать пароль',
      hidePassword: 'Скрыть пароль',
    },
    login: {
      title: 'Вход',
      subtitle: 'Введите имя пользователя и пароль',
      submit: 'Войти',
      noAccount: 'Нет аккаунта?',
      toRegister: 'Зарегистрироваться',
    },
    register: {
      title: 'Регистрация',
      subtitle: 'Придумайте имя пользователя и пароль',
      submit: 'Зарегистрироваться',
      haveAccount: 'Уже есть аккаунт?',
      toLogin: 'Войти',
    },
    validation: {
      nameRequired: 'Введите имя пользователя',
      nameLength: 'Имя пользователя должно содержать от {min} до {max} символов',
      nameChars: 'Используйте только латинские буквы, цифры, «.», «_» и «-»',
      emailRequired: 'Введите адрес эл. почты',
      emailInvalid: 'Введите корректный адрес эл. почты',
      passwordRequired: 'Введите пароль',
      passwordLength: 'Пароль должен содержать от {min} до {max} символов',
      passwordComplexity: 'Пароль должен содержать хотя бы одну букву и одну цифру',
      passwordsMismatch: 'Пароли не совпадают',
    },
    errors: {
      invalidCredentials: 'Неверное имя пользователя или пароль',
      locked: 'Слишком много неудачных попыток входа. Попробуйте через 15 минут',
      taken: 'Это имя пользователя или эл. почта уже заняты',
      network: 'Нет соединения с сервером. Проверьте подключение и попробуйте снова.',
      unknown: 'Что-то пошло не так. Попробуйте ещё раз.',
    },
  },
  dashboard: {
    greeting: 'Привет, {name}',
    signedIn: 'Вы вошли в систему.',
    signOut: 'Выйти',
  },
  language: {
    label: 'Язык',
  },
};
