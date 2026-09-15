const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const UPLOADS = path.join(PUBLIC, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

const db = new Database(path.join(ROOT, 'bakonguinho.db'));
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,category_id INTEGER,name TEXT NOT NULL,description TEXT,price REAL NOT NULL DEFAULT 0,image TEXT,featured INTEGER DEFAULT 0,active INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS gallery(id INTEGER PRIMARY KEY AUTOINCREMENT,caption TEXT NOT NULL,image TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,comment TEXT NOT NULL,rating INTEGER NOT NULL DEFAULT 5,active INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY,hero_title TEXT,hero_text TEXT,about_text TEXT,address TEXT,phone TEXT,hours TEXT,maps_url TEXT,review_count INTEGER DEFAULT 6);
`);

function seed(){
  const admin = db.prepare('SELECT id FROM admins LIMIT 1').get();
  if(!admin){
    const hash = bcrypt.hashSync('123456', 10);
    db.prepare('INSERT INTO admins(name,email,password) VALUES(?,?,?)').run('Administrador','admin@bakonguinho.ao',hash);
  }
  const cats=['Hambúrgueres','Churrasco','Acompanhamentos','Bebidas','Especiais'];
  const ins=db.prepare('INSERT OR IGNORE INTO categories(name) VALUES(?)');
  cats.forEach(c=>ins.run(c));
  if(!db.prepare('SELECT id FROM settings WHERE id=1').get()){
    db.prepare(`INSERT INTO settings VALUES(1,?,?,?,?,?,?,?,?)`).run(
      'O sabor que dá vontade de voltar',
      'Hambúrgueres preparados com sabor, qualidade e aquele toque especial da BAKONGUINHO.',
      'A BAKONGUINHO é uma hamburgueria pensada para quem aprecia boa comida, hambúrgueres saborosos e momentos especiais.',
      'Seleque - Maye Maye, quadra E, Sequele, Icolo Bengo, Angola','923 850 875','Aberto até às 22:00','https://maps.google.com',6);
  }
  if(db.prepare('SELECT COUNT(*) c FROM products').get().c===0){
    const c={}; db.prepare('SELECT * FROM categories').all().forEach(x=>c[x.name]=x.id);
    const p=db.prepare('INSERT INTO products(category_id,name,description,price,image,featured,active) VALUES(?,?,?,?,?,?,?)');
    p.run(c['Hambúrgueres'],'Double Cheeseburger','Hambúrguer duplo artesanal.',2500,'assets/images/produto_20260911_153446_04612a9283.jpg',1,1);
    p.run(c['Hambúrgueres'],'Crispy Chicken','Frango crocante num pão brioche.',2200,'assets/images/produto_20260911_153558_482ad29e45.jpg',1,1);
    p.run(c['Hambúrgueres'],'Bacon Gourmet','Hambúrguer gourmet com queijo e bacon.',2800,'assets/images/produto_20260911_155619_7b9b217736.jpg',1,1);
    p.run(c['Churrasco'],'No nosso churrasco','Especialidade preparada na brasa.',3500,'assets/images/produto_20260911_161351_5d26f0bdb1.jpg',1,1);
    p.run(c['Especiais'],'Smash Sliders','Mini hamburgueres smash.',2000,'assets/images/bakonguinho.jfif',0,1);
    p.run(c['Especiais'],'Cheeseburger Clássica','Receita clássica americana.',2000,'assets/images/bakonguinho2.jfif',0,1);
  }
  if(db.prepare('SELECT COUNT(*) c FROM reviews').get().c===0)
    db.prepare('INSERT INTO reviews(name,comment,rating,active) VALUES(?,?,?,1)').run('Cliente BAKONGUINHO','A sua opinião é importante para nós.',5);
}
seed();

app.use(express.json({limit:'2mb'}));
app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SESSION_SECRET||'bakonguinho-local-secret-change-me',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',maxAge:1000*60*60*8}}));
app.use(express.static(PUBLIC));

const storage=multer.diskStorage({
 destination:(req,file,cb)=>cb(null,UPLOADS),
 filename:(req,file,cb)=>cb(null,'produto_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)+path.extname(file.originalname).toLowerCase())
});
const upload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>{
  cb(null,/^image\/(jpeg|png|webp)$/.test(file.mimetype));
}});
function auth(req,res,next){ if(!req.session.adminId) return res.status(401).json({error:'Não autenticado'}); next(); }
function clean(v){return String(v??'').trim();}
function removeUpload(image){
  if(!image || !image.startsWith('uploads/')) return;
  const f=path.join(PUBLIC,image);
  if(fs.existsSync(f)) fs.unlinkSync(f);
}

app.post('/api/login',(req,res)=>{
  const a=db.prepare('SELECT * FROM admins WHERE email=?').get(clean(req.body.email));
  if(!a || !bcrypt.compareSync(req.body.password||'',a.password)) return res.status(401).json({error:'E-mail ou palavra-passe inválidos.'});
  req.session.adminId=a.id; req.session.adminName=a.name; res.json({name:a.name});
});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/me',(req,res)=>res.json(req.session.adminId?{authenticated:true,name:req.session.adminName}:{authenticated:false}));

app.get('/api/site',(req,res)=>{
 const settings=db.prepare('SELECT * FROM settings WHERE id=1').get();
 const cats=db.prepare('SELECT * FROM categories ORDER BY name').all();
 const products=db.prepare(`SELECT p.*,c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.active=1 ORDER BY p.featured DESC,p.id DESC`).all();
 const gallery=db.prepare('SELECT * FROM gallery ORDER BY id DESC LIMIT 8').all();
 const reviews=db.prepare('SELECT * FROM reviews WHERE active=1 ORDER BY id DESC LIMIT 6').all();
 res.json({settings,categories:cats,products,gallery,reviews});
});
app.get('/api/admin/stats',auth,(req,res)=>res.json({
 products:db.prepare('SELECT COUNT(*) c FROM products').get().c,
 categories:db.prepare('SELECT COUNT(*) c FROM categories').get().c,
 reviews:db.prepare('SELECT COUNT(*) c FROM reviews').get().c,
 gallery:db.prepare('SELECT COUNT(*) c FROM gallery').get().c
}));

app.get('/api/admin/products',auth,(req,res)=>res.json(db.prepare(`SELECT p.*,c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id ORDER BY p.id DESC`).all()));
app.post('/api/admin/products',auth,upload.single('image'),(req,res)=>{
 const id=Number(req.body.id||0), name=clean(req.body.name), desc=clean(req.body.description), price=Number(req.body.price||0), category=Number(req.body.category_id||0);
 if(!name || price<0 || !category) return res.status(400).json({error:'Preencha nome, preço e categoria.'});
 if(id){
   const old=db.prepare('SELECT image FROM products WHERE id=?').get(id); if(!old) return res.status(404).json({error:'Produto não encontrado'});
   let image=old.image; if(req.file){image='uploads/'+req.file.filename; removeUpload(old.image);}
   db.prepare('UPDATE products SET category_id=?,name=?,description=?,price=?,image=?,featured=?,active=? WHERE id=?')
     .run(category,name,desc,price,image,req.body.featured==='1'?1:0,req.body.active==='1'?1:0,id);
 } else {
   const image=req.file?'uploads/'+req.file.filename:'';
   db.prepare('INSERT INTO products(category_id,name,description,price,image,featured,active) VALUES(?,?,?,?,?,?,?)')
     .run(category,name,desc,price,image,req.body.featured==='1'?1:0,req.body.active==='1'?1:0);
 }
 res.json({ok:true});
});
app.delete('/api/admin/products/:id',auth,(req,res)=>{
 const p=db.prepare('SELECT image FROM products WHERE id=?').get(req.params.id);
 if(p) {db.prepare('DELETE FROM products WHERE id=?').run(req.params.id); removeUpload(p.image);}
 res.json({ok:true});
});

app.get('/api/admin/categories',auth,(req,res)=>res.json(db.prepare('SELECT * FROM categories ORDER BY name').all()));
app.post('/api/admin/categories',auth,(req,res)=>{
 const id=Number(req.body.id||0), name=clean(req.body.name);
 if(!name) return res.status(400).json({error:'Informe o nome.'});
 try { id?db.prepare('UPDATE categories SET name=? WHERE id=?').run(name,id):db.prepare('INSERT INTO categories(name) VALUES(?)').run(name); res.json({ok:true});}
 catch(e){res.status(400).json({error:'Esta categoria já existe.'});}
});
app.delete('/api/admin/categories/:id',auth,(req,res)=>{db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);res.json({ok:true});});

app.get('/api/admin/reviews',auth,(req,res)=>res.json(db.prepare('SELECT * FROM reviews ORDER BY id DESC').all()));
app.post('/api/admin/reviews',auth,(req,res)=>{
 const id=Number(req.body.id||0), name=clean(req.body.name), comment=clean(req.body.comment), rating=Math.max(1,Math.min(5,Number(req.body.rating||5))), active=req.body.active==='0'?0:1;
 if(!name||!comment)return res.status(400).json({error:'Preencha nome e comentário.'});
 if(id) db.prepare('UPDATE reviews SET name=?,comment=?,rating=?,active=? WHERE id=?').run(name,comment,rating,active,id);
 else db.prepare('INSERT INTO reviews(name,comment,rating,active) VALUES(?,?,?,?)').run(name,comment,rating,active);
 res.json({ok:true});
});
app.delete('/api/admin/reviews/:id',auth,(req,res)=>{db.prepare('DELETE FROM reviews WHERE id=?').run(req.params.id);res.json({ok:true});});
app.patch('/api/admin/reviews/:id/toggle',auth,(req,res)=>{db.prepare('UPDATE reviews SET active=1-active WHERE id=?').run(req.params.id);res.json({ok:true});});

const gStorage=multer.diskStorage({destination:(req,file,cb)=>cb(null,UPLOADS),filename:(req,file,cb)=>cb(null,'gallery_'+Date.now()+'_'+Math.random().toString(36).slice(2,8)+path.extname(file.originalname).toLowerCase())});
const gUpload=multer({storage:gStorage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,/^image\/(jpeg|png|webp)$/.test(file.mimetype))});
app.get('/api/admin/gallery',auth,(req,res)=>res.json(db.prepare('SELECT * FROM gallery ORDER BY id DESC').all()));
app.post('/api/admin/gallery',auth,gUpload.single('image'),(req,res)=>{
 const id=Number(req.body.id||0), caption=clean(req.body.caption);
 if(!caption)return res.status(400).json({error:'Informe a legenda.'});
 if(id){
  const old=db.prepare('SELECT * FROM gallery WHERE id=?').get(id); if(!old)return res.status(404).json({error:'Imagem não encontrada'});
  let image=old.image; if(req.file){image='uploads/'+req.file.filename;removeUpload(old.image);}
  db.prepare('UPDATE gallery SET caption=?,image=? WHERE id=?').run(caption,image,id);
 } else {
  if(!req.file)return res.status(400).json({error:'Selecione uma imagem.'});
  db.prepare('INSERT INTO gallery(caption,image) VALUES(?,?)').run(caption,'uploads/'+req.file.filename);
 }
 res.json({ok:true});
});
app.delete('/api/admin/gallery/:id',auth,(req,res)=>{
 const g=db.prepare('SELECT image FROM gallery WHERE id=?').get(req.params.id); if(g){db.prepare('DELETE FROM gallery WHERE id=?').run(req.params.id);removeUpload(g.image);} res.json({ok:true});
});

app.get('/api/admin/settings',auth,(req,res)=>res.json(db.prepare('SELECT * FROM settings WHERE id=1').get()));
app.put('/api/admin/settings',auth,(req,res)=>{
 const fields=['hero_title','hero_text','about_text','address','phone','hours','maps_url','review_count'];
 const vals=fields.map(f=>clean(req.body[f]));
 db.prepare(`UPDATE settings SET ${fields.map(f=>f+'=?').join(',')} WHERE id=1`).run(...vals);
 res.json({ok:true});
});

app.get('/admin',(req,res)=>res.sendFile(path.join(PUBLIC,'admin.html')));
app.use((req,res)=>{
  if(req.path.startsWith('/api/')) return res.status(404).json({error:'Rota não encontrada'});
  res.sendFile(path.join(PUBLIC,'index.html'));
});
app.listen(PORT,()=>console.log(`BAKONGUINHO: http://localhost:${PORT}`));
