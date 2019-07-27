const crypto = require('crypto')

/** Должен генерить массив токенов прозапас, пока камень не загружен */
const ACCUMULATED_TOKENS = []
const MAX_NUMBER_OF_TOKENS_TO_ACCAMULATE_IN_ADVANCE = 7
/** scrutinize: Как тестить? */
/** scrutinize: Как проверить и мониторить надежность crypto? */

function generateSecureToken(cb) {
    crypto.randomBytes(48, (err, buffer) => {
      if (err) return cb(new Error('While invoking crypto.randomBytes', err))
      token = buffer.toString('hex')
      cb(null, token)
    })
}

module.exports = {
    generateSecureToken
}