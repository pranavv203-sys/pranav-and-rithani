/**
 * Google Apps Script backend for the RSVP form.
 *
 * SETUP (about five minutes, all in your browser)
 *
 *  1. Create a new Google Sheet. Name it something like "Wedding RSVPs".
 *  2. In that sheet: Extensions -> Apps Script. Delete the placeholder code
 *     and paste this file in. The script must be created from inside the sheet
 *     so that getActiveSpreadsheet() below refers to it.
 *  3. Deploy -> New deployment -> gear icon -> Web app.
 *       Description:      rsvp
 *       Execute as:       Me
 *       Who has access:   Anyone            <- must be "Anyone", not
 *                                              "Anyone with a Google account",
 *                                              or guests will hit a login wall
 *  4. Authorise it when prompted. Google will warn that the app is unverified
 *     because you wrote it yourself: Advanced -> Go to (project) -> Allow.
 *  5. Copy the Web app URL. It looks like:
 *       https://script.google.com/macros/s/AKfycb.../exec
 *  6. In GitHub: repo -> Settings -> Secrets and variables -> Actions ->
 *     Variables tab -> New repository variable
 *       Name:  RSVP_ENDPOINT
 *       Value: the URL from step 5
 *     A variable, not a secret: the URL is embedded in the public JavaScript
 *     either way, so marking it secret would hide it from you and no one else.
 *  7. Re-run the deploy workflow (Actions -> Deploy to GitHub Pages -> Run
 *     workflow). The form goes live automatically once the variable is set.
 *
 * IF YOU EDIT THIS FILE LATER: Deploy -> Manage deployments -> edit -> Version
 * -> New version. Without a new version the live URL keeps running the old
 * code, which is the usual reason an Apps Script "change" appears to do
 * nothing.
 *
 * PERMISSIONS — pin the scope. Left to itself, Apps Script infers scopes from
 * the code and grants the WIDE "see, edit, create and delete all your Google
 * Sheets spreadsheets". Nothing here needs that: everything operates on the
 * one bound spreadsheet, and LockService and ContentService need no scope at
 * all. In Project Settings, tick "Show appsscript.json" and add:
 *
 *   "oauthScopes": [
 *     "https://www.googleapis.com/auth/spreadsheets.currentonly"
 *   ],
 *
 * then revoke the old grant at myaccount.google.com/permissions, deploy a new
 * version and re-authorise. This matters less for what the script does today
 * than for what it could do tomorrow — with the wide scope, any code added
 * later silently inherits access to every spreadsheet in the account.
 *
 * Sharing: the sheet is an ordinary Google Sheet. Share it with your fiancé
 * from the Share button as you would any other.
 */

const SHEET_NAME = 'RSVPs'
const HEADERS = ['Received', 'Name', 'Email', 'Phone', 'Attending', 'Guests', 'Message']

function doPost(e) {
  // appendRow is not atomic across concurrent executions. Two guests replying
  // in the same moment could otherwise write over one another.
  const lock = LockService.getScriptLock()
  try {
    lock.waitLock(10000)
  } catch (err) {
    return json({ ok: false, error: 'Busy, please try again.' })
  }

  try {
    const data = JSON.parse(e.postData.contents)

    // Honeypot: a field hidden from people but filled in by naive bots. Return
    // success so the bot does not learn it was caught and retry differently.
    if (data.website) return json({ ok: true })

    const name = String(data.name || '').trim()
    if (!name) return json({ ok: false, error: 'Please enter your name.' })

    const sheet = getSheet()
    const attending = data.attending !== 'no'
    const guests = Math.min(Math.max(parseInt(data.guests, 10) || 1, 1), 10)

    sheet.appendRow([
      new Date(),
      name,
      String(data.email || '').trim(),
      String(data.phone || '').trim(),
      attending ? 'Yes' : 'No',
      attending ? guests : 0,
      String(data.message || '').trim(),
    ])

    return json({ ok: true })
  } catch (err) {
    return json({ ok: false, error: 'Could not save your reply.' })
  } finally {
    lock.releaseLock()
  }
}

/** Visiting the URL in a browser should say something human, not throw. */
function doGet() {
  return json({ ok: true, message: 'RSVP endpoint is live.' })
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.setFrozenRows(1)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
  }
  return sheet
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

/**
 * Builds a "Summary" tab of live statistics over the RSVPs sheet.
 *
 * Run it once by hand: open the Apps Script editor, choose buildSummary from
 * the function dropdown, press Run. It needs no deployment — deployments only
 * affect the web app URL — and it is safe to re-run, which rebuilds the tab.
 *
 * Everything written here is a FORMULA, not a value, so the numbers keep
 * themselves up to date as replies arrive. Deliberately kept out of doPost: a
 * bug in a statistic should never be able to stop a guest's reply being saved.
 */
function buildSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const name = 'Summary'
  let s = ss.getSheetByName(name)
  if (s) s.clear()
  else s = ss.insertSheet(name, 0)

  const R = SHEET_NAME // the RSVPs tab

  s.getRange('A1').setValue('RSVP summary').setFontSize(16).setFontWeight('bold')
  s.getRange('A2')
    .setValue('Live figures — they update themselves as replies come in.')
    .setFontColor('#666666')

  const stats = [
    ['Replies received', `=COUNTA(${R}!B2:B)`],
    ['Attending', `=COUNTIF(${R}!E2:E,"Yes")`],
    ['Not attending', `=COUNTIF(${R}!E2:E,"No")`],
    ['Total guests coming', `=SUM(${R}!F2:F)`],
    ['Average party size', `=IFERROR(ROUND(AVERAGEIF(${R}!E2:E,"Yes",${R}!F2:F),1),0)`],
    ['Largest party', `=IFERROR(MAX(${R}!F2:F),0)`],
    ['', ''],
    ['Last reply', `=IFERROR(TEXT(MAX(${R}!A2:A),"ddd d mmm, h:mm am/pm"),"—")`],
    ['Replies in the last 7 days', `=COUNTIFS(${R}!A2:A,">="&(NOW()-7))`],
    ['Days until the wedding', '=DATE(2026,9,17)-TODAY()'],
    ['', ''],
    // Nothing dedupes on the way in, so surface it rather than prevent it.
    ['Repeated names (check these)', `=COUNTA(${R}!B2:B)-COUNTUNIQUE(${R}!B2:B)`],
    ['Emails collected', `=COUNTA(${R}!C2:C)`],
    ['Phone numbers collected', `=COUNTA(${R}!D2:D)`],
  ]

  stats.forEach(function (row, i) {
    const r = 4 + i
    if (!row[0]) return
    s.getRange(r, 1).setValue(row[0]).setFontWeight('bold')
    s.getRange(r, 2).setFormula(row[1])
  })

  // Replies per day, most recent first. INT() drops the time so the datetimes
  // group by date; "> 0" filters the blank rows, which INT turns into zeros.
  s.getRange('D3').setValue('Replies by day').setFontWeight('bold')
  s.getRange('D4').setFormula(
    `=IFERROR(QUERY(ARRAYFORMULA({INT(${R}!A2:A), ${R}!E2:E, ${R}!F2:F}),` +
      `"select Col1, count(Col2), sum(Col3) where Col1 > 0 group by Col1 order by Col1 desc ` +
      `label Col1 'Date', count(Col2) 'Replies', sum(Col3) 'Guests'",0),"No replies yet")`,
  )
  s.getRange('D5:D200').setNumberFormat('ddd d mmm')

  s.getRange('A20').setValue('Notes from guests').setFontWeight('bold')
  s.getRange('A21').setFormula(
    `=IFERROR(QUERY(${R}!B2:G,"select Col1, Col6 where Col6 <> ''",0),"No notes yet")`,
  )

  s.setColumnWidth(1, 220)
  s.setColumnWidth(2, 110)
  s.setColumnWidth(4, 130)
  s.setColumnWidth(5, 80)
  s.setColumnWidth(6, 80)
  ss.setActiveSheet(s)
}
