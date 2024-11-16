# Tiktok_BackEnd
## To run the code, you must:
*Node: I help you can run code BE when you use Google Cloud*
### step 1:
- You must create a repository
- Get all information as is projectId, file json

### step 2:
Look at the code below
   const projectId = process.env.PROJECT_ID;**the position is projectId**
   const keyFilename = path.resolve(__dirname, '../**name of file json**');

### step 3:
at file postController<br>
`const bucket = storages.bucket(`**the name of BUCKET**);
<br>
step 4:<br>
- With database<br>
+ Import file sql for xampp<br>
+ At file connectDB:
  * replace name file in Sequelize with name your file
  * Ex: `const sequelize = new Sequelize(`**name file**`, 'root', null,{...`



