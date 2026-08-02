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
