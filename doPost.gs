function doPost(e) {
  let contents = JSON.parse(e.postData.contents);

  try {

    // SpreadsheetApp.openById(ssID).getSheetByName("Debug").getRange(1, 1).setValue(JSON.stringify(contents, null, 5))
    let chat_id = contents.message.from.id;

    if (contents.message && contents.message.text) {

      let text = contents.message.text;

      if (text === "/balance" || text === "Баланс" || text === "баланс") {
        let firstRow = SpreadsheetApp.openById(ssID).getSheetByName("Транзакции").getRange("A1:F1").getDisplayValues().flat();

        let message = `${firstRow[0]} ${firstRow[1]}
${firstRow[2]} ${firstRow[3]}

${firstRow[4]} ${firstRow[5]}`

        sendText(chat_id, message);
      }

      else if (text === "/delete" || text === "Удалить" || text === "удалить") {
        let sheet = SpreadsheetApp.openById(ssID).getSheetByName("Транзакции");
        let lastRow = sheet.getLastRow()
        if (lastRow <= 3) {
          sendText(chat_id, `У вас нет ни одной транзакции.`);
          return
        }
        let row = sheet.getRange(lastRow, 1, 1, 8).getDisplayValues()[0]
        sheet.deleteRow(lastRow)
        let message = `Удалена транзакция с типом ${row[2]} ${row[6]} на сумму ${row[5]}`;
        sendText(chat_id, message);
      }

      else if (text === "/last10" || text === "Ласт10" || text === "ласт10") {
        let sheet = SpreadsheetApp.openById(ssID).getSheetByName("Транзакции");
        let lastRow = sheet.getLastRow();
        if (lastRow <= 3) {
          sendText(chat_id, `У вас нет ни одной транзакции.`);
          return
        }

        let firstRow = lastRow - 9;
        if (firstRow < 4) {
          firstRow = 4
        }

        let numRows = lastRow - firstRow + 1;

        let rows = sheet.getRange(firstRow, 1, numRows, 8).getDisplayValues()
        let message = `Последние ${numRows} транзакций:\n\n<b>Тип * Сумма * Примечание</b>\n`;
        for (let i = 0; i < rows.length; i++) {
          message += `${rows[i][2]} * ${rows[i][5]} * ${rows[i][6]}\n`
        }
        sendText(chat_id, message);
      }

      else if (text === "таблица" || text === "Таблица"){
        let type;
        type = "your_table"
        let message = `${type}`
        sendText(chat_id, message);
      }

      else {
        let splitData = text.split(" ")
        let textIsPlus = text[0];
        let sum = +splitData[0].replace(",", ".");
        if (isNaN(sum)) {
          sendText(chat_id, `Вы ввели нечисловое значение в начале. Введите по шаблону: "100 примечание".`);
          return
        }

        let sheet = SpreadsheetApp.openById(ssID).getSheetByName("Счета");
        let data = sheet.getDataRange().getDisplayValues();
        let objAccount = {}
        for (let i = 1; i < data.length; i++) {
          objAccount[data[i][3]] = data[i][4].split(",")
        }

        let account = data[1][3];
        for (let i = 1; i < splitData.length; i++) {
          for (let schet in objAccount) {
            if (objAccount[schet].includes(splitData[i])) {
              account = schet;
              break
            }
          }
        }

        sheet = SpreadsheetApp.openById(ssID).getSheetByName("Категории");
        data = sheet.getDataRange().getDisplayValues();
        let objCategory = {}
        for (let i = 1; i < data.length; i++) {
          objCategory[data[i][4]] = data[i][5].split(",")
        }

        let category = data[1][4];
        for (let i = 1; i < splitData.length; i++) {
          console.log(splitData[i])
          for (let cat in objCategory) {
            if (objCategory[cat].includes(splitData[i])) {
              category = cat;
              break
            }
          }
        }

        let arr2 = splitData.splice(1)
        let comment = arr2.join(" ")

        let type;
        if (textIsPlus === "+") {
          type = "Доход"
        }
        else {
          type = "Расход"
          sum = Math.abs(sum);
        }

        let arr = [null, new Date(), type, account, category, sum, comment, contents.message.from.username]

        SpreadsheetApp.openById(ssID).getSheetByName("Транзакции").appendRow(arr)

        let message = `${type} ${sum} ${comment}`
        sendText(chat_id, message);
      }

      return
    }

    sendText(chat_id, `Вы отправили некорректные данные. Пожалуйста, отправьте расход/доход по типу: "15000 ЗП".`);

  } catch (err) {
    Logger = BetterLog.useSpreadsheet(ssID);
    err = (typeof err === 'string') ? new error(err) : err;
    Logger.log('%s: %s (line %s, file "%s"). Stack: "%s" . While processing %s.', err.name || '',
      err.message || '', err.lineNumber || '', err.fileName || '', err.stack || '', '');
  }
}