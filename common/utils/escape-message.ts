/**
 * Функция для экранирования специальных символов в сообщении.
 * Эта функция добавляет обратный слэш перед символами, которые имеют специальное значение
 * (например, * для жирного текста, . для точек, - для дефисов и — для длинных тире).
 *
 * @param {string} message - Исходное сообщение, в котором нужно экранировать специальные символы.
 * @returns {string} - Сообщение с экранированными специальными символами.
 */
function escapeMessage(message: string): string {
  // Символы, которые нужно экранировать
  const specialCharacters = ['.', '-', '!', '+', '[', ']', '(', ')', '='];

  // Пройдем по всем символам и добавим обратный слэш перед специальными символами
  let escapedMessage = message;
  specialCharacters.forEach((char) => {
    const regex = new RegExp(`\\${char}`, 'g');
    escapedMessage = escapedMessage.replace(regex, `\\${char}`);
  });

  return escapedMessage;
}
export default escapeMessage;
