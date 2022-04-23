# Admin server for Wall of Honorees

## Running the app locally

Production mode

```
npm run build
npm run start
```

Development mode

```
npm run tsc:watch
```

### URL

http://127.0.0.1:3000/

## Running integration testcases

Start the test server pointing to the test database and execute testcases

```
TEST_DB=barbers-hill-test npm start
npx playwright test --headed --project=chromium --workers=1 --debug
```

## Deploy to Heroku for testing

```~~~bash
heroku login
heroku git:remote -a barbers-hill-honor-server
npm run deploy
heroku config:set MONGO_HOSTNAME=cluster0.umj4z.mongodb.net
heroku config:set MONGO_USER=admin
heroku config:set MONGO_PASS=<normalpassword>
heroku config:set ENVIRONMENT=heroku

```

Open a browser to this URL for testing
https://barbers-hill-woc-server.herokuapp.com/

## Bring the remote database locally for actual production performance testing

Install mongodb database tools:
`https://docs.mongodb.com/database-tools/installation/installation-macos/`

Dump the remote db: https://docs.mongodb.com/database-tools/mongodump/

```
mongodump --uri=<url from the server console when starting pointing to remote db>
```

Delete the local db

Restore to local db: https://docs.mongodb.com/database-tools/mongorestore/

```
mongorestore

```

## TODOS

- Delete image if you edit a honoree and remove the image
- Is the editing of an image for WoC actually broken on the heroku server?
- can I combine my multer utilities and mongoUtils

## Design of mongo document

name: string;
inductionYear: number
specialRecognition: boolean
inMemoriam: boolean
startYear: number
endYear: number
sports: [{name: string; description: string}]
imageFiles: [{name: string; description: string}]

Images:
Each additional image will add a new form field with file input id different but name `imageName` and new imageDescription field for the form to parse BASED on the same index. i.e.
the first element of the `imageName` array corresponds to the first element of the `imageDescription` array
Multer parse will put all the images into the database
Filename and descriptions will be stored in array of objects inside the main document, parsed individually, assume descriptionss come in in the same order as the file array
