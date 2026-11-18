// All vehicle records below are illustrative fixtures, not Starlink inventory or offers.
export const brands = [
 {id:'deepal',zh:'深蓝',en:'DEEPAL',ka:'DEEPAL',ru:'DEEPAL',mark:'DEEPAL',type:'core'},
 {id:'geely',zh:'吉利',en:'GEELY',ka:'GEELY',ru:'GEELY',mark:'GEELY',type:'core'},
 {id:'hongqi',zh:'红旗',en:'HONGQI',ka:'HONGQI',ru:'HONGQI',mark:'HONGQI',type:'order'},
 {id:'li-auto',zh:'理想',en:'Li Auto',ka:'Li Auto',ru:'Li Auto',mark:'LI AUTO',type:'order'},
 {id:'kaicene',zh:'长安凯程',en:'Changan Kaicene',ka:'Changan Kaicene',ru:'Changan Kaicene',mark:'KAICENE',type:'order'},
 {id:'maxus',zh:'上汽大通',en:'MAXUS',ka:'MAXUS',ru:'MAXUS',mark:'MAXUS',type:'order'},
 {id:'lonking',zh:'龙工',en:'LONKING',ka:'LONKING',ru:'LONKING',mark:'LONKING',type:'order'},
 {id:'up',zh:'UP',en:'UP',ka:'UP',ru:'UP',mark:'UP',type:'order'},
 {id:'neta',zh:'哪吒',en:'NETA',ka:'NETA',ru:'NETA',mark:'NETA',type:'order'},
 {id:'byd',zh:'比亚迪',en:'BYD',ka:'BYD',ru:'BYD',mark:'BYD',type:'core'},
 {id:'changan',zh:'长安启源',en:'Changan NEVO',ka:'Changan NEVO',ru:'Changan NEVO',mark:'CHANGAN',type:'core'},
 {id:'voyah',zh:'岚图',en:'VOYAH',ka:'VOYAH',ru:'VOYAH',mark:'VOYAH',type:'order'},
 {id:'zeekr',zh:'极氪',en:'ZEEKR',ka:'ZEEKR',ru:'ZEEKR',mark:'ZEEKR',type:'order'}
];
export const vehicles = [
 ['han','byd','汉','Han','2025-06',8600,'phev',24800,'sedan',true],
 ['sealion-05','byd','海狮05 DM-i','Sealion 05 DM-i','2024-11',12500,'phev',18900,'suv',true],
 ['song-l','byd','宋L DM-i','Song L DM-i','2025-04',6800,'phev',22500,'suv',true],
 ['qin-plus','byd','秦PLUS','Qin PLUS','2024-08',22000,'phev',14800,'sedan',false],
 ['nevo-q07','changan','启源Q07','NEVO Q07','2025-05',5200,'phev',23900,'suv',true],
 ['nevo-a06','changan','启源A06','NEVO A06','2025-09',3100,'ev',21800,'sedan',true],
 ['voyah-dream','voyah','梦想家','Dream','2025-03',9800,'phev',45800,'mpv',false],
 ['zeekr-9x','zeekr','9X','9X','2025-10',2600,'phev',68900,'suv',false]
].map(([id,brand,zh,en,date,mileage,energy,price,body,featured],i)=>({id,brand,zh,en,date,mileage,energy,price,body,featured,image:`/assets/car-${i+1}.webp`,images:[`/assets/car-${i+1}.webp`],code:`SL-DEMO-${String(i+1).padStart(3,'0')}`,demo:true,seats:body==='mpv'?7:5,transmission:'auto',color:i%2?'white':'black',status:'sample'}));
export const markets=[{id:'ge',zh:'格鲁吉亚',en:'Georgia',ka:'საქართველო',ru:'Грузия',flag:'🇬🇪',currency:'GEL'},{id:'am',zh:'亚美尼亚',en:'Armenia',ka:'სომხეთი',ru:'Армения',flag:'🇦🇲',currency:'USD'}];
// Fixed illustrative conversion for the prototype only, not live exchange rates.
export const rates={USD:1,GEL:2.7};
export const company={name:'Starlink 星联达集团',city:'Tbilisi',annualSales:'300+',showroom:400,workshop:1200,phone:'',email:'',whatsapp:'',telegram:''};
vehicles[0].images = Array.from({length:6},(_,i)=>`/assets/han-${i+1}.webp`);
