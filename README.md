# Tiktok_BackEnd
## To run the code, you must:
*Node: I help you can run code BE when you use Google Cloud*<br>
step 1:<br>
- You must create a repository
- Get all information as is projectId, file json
<br>
step 2:<br>
Look at the code below<br>
`~const projectId = process.env.PROJECT_ID; `**the position is projectId**`~`<br>
`const keyFilename = path.resolve(__dirname, '../`**name of file json**`');`
<br>
step 3:<br>
at file postController<br>
`const bucket = storages.bucket(`**the name of BUCKET**);
<br>
step 4:<br>
- With database<br>
+ Import file sql for xampp<br>
+ At file connectDB:
  * replace name file in Sequelize with name your file
  * Ex: `const sequelize = new Sequelize(`**name file**`, 'root', null,{...`



