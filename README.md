# M.MissionFootball
**The Home of South Sudan Football**

A beginner-friendly, responsive MVP for the South Sudan Premier League and local football associations.

## Run in VS Code (Windows)
1. Install Node.js LTS from https://nodejs.org/
2. Extract this folder and open it in VS Code.
3. Open **Terminal → New Terminal**.
4. Run `npm install`
5. Run `npm start`
6. Open `http://localhost:3000`

## Included in this starter
- Responsive public football homepage.
- Installable progressive web app: on iPhone, open the site in Safari, tap **Share → Add to Home Screen**; on Android, open it in Chrome and choose **Install app** or **Add to Home screen** from the browser menu. This creates a home-screen app shortcut, not an App Store or Google Play listing.
- Native iOS and Android project scaffolding is provided through Capacitor in `mobile-projects.zip`. Extract that archive into the project folder so `android/` and `ios/` sit beside `package.json`. Then run `npm install` and `npm run mobile:sync`, followed by `npm run mobile:android` or `npm run mobile:ios` to open a native project. Android builds require Android Studio, Android SDK, and JDK 17 or newer. iOS builds and App Store uploads require macOS with Xcode.
- Original football and pitch illustration in the homepage hero banner.
- SSPL 2026–2027 season branding.
- 14 editable club slots.
- Local associations and Juba divisions.
- Fixtures, results, league table, player profiles, news, search.
- Demo administrator panel with forms for clubs, fixtures, scores, players, and news.
- League logo management: upload an image or provide an image URL from the Admin dashboard's **League logo** tab; the logo appears in both homepage league badges.
- Club management is accessible from **Add / remove clubs** beside the league club list or from Admin. Add a club by leaving the selector on **Add a new club**, entering its details, and saving. Select an existing club to update or remove it; removal also deletes linked matches and players. Club logos can be uploaded (up to 1 MB), entered as a URL, or cleared.
- League standings display each club's logo beside its name and rank; clubs without a logo show their initials.
- Live match calendar includes Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday selectors, shows each day's leagues, and groups selected-day fixtures by league. The Next 7 days filter has been removed. Add, update, or delete leagues in Admin → Leagues; new leagues become available in calendar filters, club associations, and fixture creation. Deleting a league reassigns its clubs and fixtures to another league after confirmation. Visitors can follow clubs and filter fixtures by followed clubs and league.
- Enter the current real-world table under Admin → **Previous standings**, selecting a league and club and adding P (Played), W (Won), D (Drawn), L (Lost), GF (Goals For), GA (Goals Against), and PTS (Points). GD (Goal Difference) is calculated as GF − GA. These starting totals appear in the public table, and future finished match results are added automatically. Do not enter the same past matches as results too, or they will be counted twice.
- Update match scores and statuses under Admin → **Fixtures & scores** by selecting an existing match, entering both scores, choosing **Finished**, and saving. League standings automatically recalculate from those results plus the starting totals; select a league above the table to view its clubs and stats. The **Add / update match results** button below the table opens the fixture editor directly.
- The league manager includes the South Sudan Premier League; Juba Local Football Association (Konyokonyo League) First, Second, and Third Divisions; one state league for each of South Sudan's ten states; and Yei Local Football Association. State league labels include their local center (Juba, Torit, Bor, Rumbek, Aweil, Bentiu, Malakal, Kuajok, Wau, and Yambio). Existing custom leagues are preserved when the catalogue is updated. Clubs can be assigned to a league from the league manager.
- Add an individual league logo from Admin → Leagues by selecting a league, choosing an image file (up to 1 MB) or entering an image URL, then saving. Logos appear beside league names in the manager and calendar. Removing a league also removes its logo.
- Browser localStorage persistence for demo data.
- Express server and health endpoint at `/api/health`.

## Demo administrator access
Open **Admin** and enter:
- Username: `admin`
- Password: `Mission2026!`

**Important:** This is a local prototype login, not production security. Do not deploy with demo credentials. Before public launch, implement server-side authentication, hashed passwords, role-based authorization, a real database, backups, secure image uploads, audit logs, and HTTPS.

## Logo assets
The uploaded poster is included as `public/assets/logos/sspl-clubs-poster.jpg` for visual reference. Individual logos should be supplied as separate authorized image files and mapped to the verified club records. Club names are editable because the poster alone should not be treated as a verified official club register.

## Add or change the league logo
1. Start the app and open **Admin Login**.
2. Sign in with the local demo credentials above, then choose **League logo**.
3. Choose an image file (up to 1 MB) or enter an image URL, then select **Save league logo**.
4. Select **Remove league logo** to return to the default SSPL badge.

The logo is stored in this browser's localStorage for the prototype; it is not shared with other visitors.

## Next production steps
1. Replace localStorage with PostgreSQL or Firebase.
2. Add secure authentication and Super Admin / League Admin / Club Admin / Editor / Fan permissions on the backend.
3. Add verified club data and individual logos.
4. Add real-time updates and push notifications.
5. Complete native store builds, signing, store disclosures, testing, and review.

## App Store and Google Play release
The Capacitor folders are starter projects, not submitted or store-approved apps. After completing the production steps above:

- **Google Play:** Open `android/` in Android Studio, configure the release signing key, build a signed Android App Bundle (`.aab`), then upload it in the Google Play Console and complete the store listing and testing requirements.
- **Apple App Store:** On a Mac, open `ios/App/App.xcworkspace` in Xcode, select your Apple Developer team, configure signing and the bundle identifier, archive the app, then upload it to App Store Connect and complete TestFlight review and the store listing.

Both stores require app privacy disclosures, a support contact, screenshots, and store review. The current demo login is hard-coded and app data is saved only in each device's browser storage; replace these with secure server-side authentication and shared backend storage before a public release. Never publish the demo password shown above.
