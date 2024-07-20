const token = "your_token";
const ssID = "your_ssID";

function start() {
  let webAppUrl = 'your_webAppUrl';
  let url = `https://api.telegram.org/bot${token}/setWebhook?url=${webAppUrl}`;
  let resp = UrlFetchApp.fetch(url);
  console.log(resp.getContentText());
}

function sendText(chat_id, text, keyBoard) {
  let data = {
    method: 'post',
    payload: {
      method: 'sendMessage',
      chat_id: String(chat_id),
      text: String(text),
      parse_mode: 'HTML',
      reply_markup: JSON.stringify(keyBoard),
      disable_web_page_preview: true
    },
    muteHttpExceptions: true
  };
  return JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data));
}