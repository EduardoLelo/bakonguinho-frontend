const $=s=>document.querySelector(s);
const money=v=>new Intl.NumberFormat('pt-AO',{style:'currency',currency:'AOA',maximumFractionDigits:0}).format(Number(v)||0).replace('AOA','Kz');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const img=p=>p||'assets/images/logo.jpeg';
const fallback={
 settings:{hero_title:'O sabor que dá vontade de voltar',hero_text:'Hambúrgueres preparados com sabor, qualidade e aquele toque especial da BAKONGUINHO.',about_text:'A BAKONGUINHO é uma hamburgueria pensada para quem aprecia boa comida, hambúrgueres saborosos e momentos especiais.',address:'Seleque - Maye Maye, quadra E, Sequele, Icolo Bengo, Angola',phone:'923 850 875',hours:'Aberto até às 22:00',maps_url:'https://maps.google.com',review_count:6},
 categories:[{id:1,name:'Hambúrgueres'},{id:2,name:'Churrasco'},{id:3,name:'Acompanhamentos'},{id:4,name:'Bebidas'},{id:5,name:'Especiais'}],
 products:[
  {category_id:1,name:'Double Cheeseburger',description:'Hambúrguer duplo artesanal.',price:2500,image:'assets/images/produto_20260911_153446_04612a9283.jpg',featured:1,active:1},
  {category_id:1,name:'Crispy Chicken',description:'Frango crocante num pão brioche.',price:2200,image:'assets/images/produto_20260911_153558_482ad29e45.jpg',featured:1,active:1},
  {category_id:1,name:'Bacon Gourmet',description:'Hambúrguer gourmet com queijo e bacon.',price:2800,image:'assets/images/produto_20260911_155619_7b9b217736.jpg',featured:1,active:1},
  {category_id:2,name:'No nosso churrasco',description:'Especialidade preparada na brasa.',price:3500,image:'assets/images/produto_20260911_161351_5d26f0bdb1.jpg',featured:1,active:1},
  {category_id:5,name:'Smash Sliders',description:'Mini hambúrgueres smash.',price:2000,image:'assets/images/products/bakonguinho.jfif',active:1},
  {category_id:5,name:'Cheeseburger Clássica',description:'Receita clássica americana.',price:2000,image:'assets/images/products/bakonguinho2.jfif',active:1}
 ],
 gallery:[],reviews:[{name:'Cliente BAKONGUINHO',comment:'A sua opinião é importante para nós.',rating:5,active:1}]
};
async function getSite(){
 try{const r=await fetch('/api/site',{cache:'no-store'});if(!r.ok)throw Error();return await r.json();}
 catch{return fallback;}
}
async function loadSite(){
 const d=await getSite(),s=d.settings||fallback.settings;
 $('#heroTitle').textContent=s.hero_title||fallback.settings.hero_title;$('#heroText').textContent=s.hero_text||'';
 $('#aboutText').textContent=s.about_text||'';$('#address').textContent=s.address||'';$('#phone').textContent=s.phone||'';$('#hours').textContent=s.hours||'';$('#maps').href=s.maps_url||'#';$('#reviewCount').textContent=(s.review_count||6)+' avaliações';
 const cats=d.categories||[];$('#filters').innerHTML='<button class="filter active" data-cat="all">Todos</button>'+cats.map(c=>`<button class="filter" data-cat="${c.id}">${esc(c.name)}</button>`).join('');
 renderProducts(d.products||[]);renderGallery(d.gallery||[]);renderReviews(d.reviews||[]);
 document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.product').forEach(p=>p.style.display=b.dataset.cat==='all'||p.dataset.cat===p.dataset.category?'':'none');});
}
function renderProducts(ps){$('#products').innerHTML=ps.length?ps.map(p=>`<article class="product" data-category="${p.category_id||''}"><div class="product-img">${p.image?`<img src="${esc(img(p.image))}" alt="${esc(p.name)}" loading="lazy" onerror="this.style.display='none'">`:'<div class="empty">Sem imagem</div>'}</div><div class="product-body"><h3>${esc(p.name)}</h3><p>${esc(p.description||'')}</p><span class="price">A partir de ${money(p.price)}</span></div></article>`).join(''):'<div class="empty">Nenhum produto disponível.</div>';}
function renderGallery(gs){$('#gallery').innerHTML=gs.length?gs.map(g=>`<figure><img src="${esc(g.image)}" alt="${esc(g.caption)}" loading="lazy"></figure>`).join(''):'<div class="empty">Galeria disponível em breve.</div>';}
function renderReviews(rs){$('#reviews').innerHTML=rs.length?rs.map(r=>`<article class="review"><div class="stars">${'★'.repeat(Number(r.rating)||5)}${'☆'.repeat(5-(Number(r.rating)||5))}</div><h3>${esc(r.name)}</h3><p>“${esc(r.comment)}”</p></article>`).join(''):'<div class="empty">Ainda não há avaliações.</div>';}
document.addEventListener('DOMContentLoaded',()=>{loadSite();$('#year').textContent=new Date().getFullYear();const t=$('.menu-toggle'),n=$('.main-nav');if(t&&n)t.onclick=()=>{n.classList.toggle('open');t.setAttribute('aria-expanded',n.classList.contains('open'));t.textContent=n.classList.contains('open')?'✕':'☰';};document.querySelectorAll('.main-nav a').forEach(a=>a.addEventListener('click',()=>n?.classList.remove('open')));});
