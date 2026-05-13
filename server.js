console.log(__dirname)

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tasks.db');


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        completed INTEGER DEFAULT 0)
      `)
    });

//------------------------------------------------------------------------------------------------------------------------------

//corsというツールを読み込み　　ブラウザからサーバーにアクセスできるようにする
const cors = require('cors');

//expressというwebサーバーを作るツールを読み込み
const express = require('express');

//expressを使ってappという名前のサーバーを作る
const app = express();

//ブラウザから送られてくるデータをjsonという形式で受け取れるようにする
app.use(express.json());

//ブラウザ(HTMLファイル)からこのサーバーへのアクセスを許可する
app.use(cors());

app.use(express.static('.'));

//----------------------------------------------------------------------------------------------------------------------------

//DELETEルート
//DELETEという方法で/tasks/数字にアクセスされた時の処理を書く
app.delete('/tasks/:index', (req,res) => {

//その番号のタスクをリストから1つ削除
    db.run(
        'DELETE FROM tasks WHERE id = ?',
        [req.params.index],
        function(err){
            if(err){
             return res.status(500).json({ error:
    err.message });
             }
             res.json({ message: 'deleted' });
             }
            );
});

//-----------------------------------------------------------------------------------------------------------------------------

//GETルート追加
app.get('/tasks',(req,res) => {
    db.all('SELECT * FROM tasks',[],(err,
    rows) => {
        if (err) {
        return res.status(500).json({ error:
err.message });
    }
    res.json(rows);
  });
});
       
//-----------------------------------------------------------------------------------------------------------------------------

//POSTルート
app.post('/tasks',(req,res) => {
    db.run('INSERT INTO tasks (title) VALUES(?)',
        [req.body.title],
        function(err) {
            if (err) {
                return res.status(500).json({ error:
    err.message });
        }
        res.json({ id: this.lastID,title:
    req.body.title });
        }
    );
});

//-----------------------------------------------------------------------------------------------------------------------------

//PATCHルート追加
//PATCHという方法で/tasks/数字にアクセスされた時の処理

app.patch('/tasks/:id', (req, res) => {
    const { title, completed } = req.body;

    db.run(
        `UPDATE tasks SET 
          title = COALESCE(?,title),
          completed = COALESCE(?,completed)
          WHERE id = ?`,
        [title, completed , req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({ error:
    err.message });
        }
        res.json({ message: 'updated' });
    }
);
});


app.listen(3000,() => console.log('server running'));
