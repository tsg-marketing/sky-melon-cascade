/**
 * Обработчик заявок с форм обратной связи Техно-Сиб.
 * Принимает POST-запрос с данными формы и передаёт их в Битрикс24.
 *
 * Ожидаемые поля в теле запроса (JSON):
 *   name        {string}   — имя клиента
 *   phone       {string}   — телефон клиента
 *   email       {string}   — email клиента (если есть)
 *   comment     {string}   — комментарий (если есть)
 *   product     {string}   — товар/продукт, по которому интерес
 *   quizAnswers {object}   — ответы на вопросы квиза (ключ: вопрос, значение: ответ)
 *   formType    {string}   — тип формы (quiz | compare | contacts | modal | inquiry)
 *   pageUrl     {string}   — URL страницы, с которой отправлена заявка
 *   utmSource   {string}   — UTM source из куки
 *   utmMedium   {string}   — UTM medium из куки
 *   utmCampaign {string}   — UTM campaign из куки
 *   utmContent  {string}   — UTM content из куки
 *   utmTerm     {string}   — UTM term из куки
 */

// Реализацию Битрикс24-интеграции разместить здесь.
// Пример: отправка через webhook Битрикс24 REST API.
// const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    phone,
    email,
    comment,
    product,
    quizAnswers,
    formType,
    pageUrl,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
  } = req.body;

  // Здесь разместить логику отправки в Битрикс24
  // Например:
  // await fetch(`${BITRIX_WEBHOOK_URL}/crm.lead.add.json`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     fields: {
  //       TITLE: `Заявка с сайта: ${name}`,
  //       NAME: name,
  //       PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
  //       EMAIL: email ? [{ VALUE: email, VALUE_TYPE: 'WORK' }] : undefined,
  //       COMMENTS: buildComments({ comment, product, quizAnswers, formType, pageUrl, utmSource, utmMedium, utmCampaign, utmContent, utmTerm }),
  //       UTM_SOURCE: utmSource,
  //       UTM_MEDIUM: utmMedium,
  //       UTM_CAMPAIGN: utmCampaign,
  //       UTM_CONTENT: utmContent,
  //       UTM_TERM: utmTerm,
  //     }
  //   })
  // });

  return res.status(200).json({ success: true });
};
