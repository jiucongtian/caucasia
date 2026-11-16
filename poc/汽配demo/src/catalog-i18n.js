import { getLanguage } from './i18n.js';

const names = {
  '机油滤芯':['Oil filter element','ზეთის ფილტრის ელემენტი','Фильтрующий элемент масла'],
  '机油滤清器':['Oil filter','ზეთის ფილტრი','Масляный фильтр'],
  '空气滤芯':['Engine air filter','ძრავის ჰაერის ფილტრი','Воздушный фильтр двигателя'],
  '钛系列空滤':['Titanium series air filter','Titanium სერიის ჰაერის ფილტრი','Воздушный фильтр серии Titanium'],
  '空调滤芯':['Cabin air filter','სალონის ჰაერის ფილტრი','Салонный фильтр'],
  '空调滤芯B组（小型车）':['Cabin filter · group B','სალონის ფილტრი · ჯგუფი B','Салонный фильтр · группа B'],
  '普通DM-i混动滤芯':['DM-i hybrid filter','DM-i ჰიბრიდის ფილტრი','Фильтр гибрида DM-i'],
  '减速器滤芯':['Reduction gear filter','რედუქტორის ფილტრი','Фильтр редуктора'],
  '齿轮油':['Gear oil','გადაცემათა ზეთი','Трансмиссионное масло'],
  '前刹车片':['Front brake pads','წინა სამუხრუჭე ხუნდები','Передние тормозные колодки'],
  '后刹车片':['Rear brake pads','უკანა სამუხრუჭე ხუნდები','Задние тормозные колодки'],
  '前刹车盘':['Front brake disc','წინა სამუხრუჭე დისკი','Передний тормозной диск'],
  '后刹车盘':['Rear brake disc','უკანა სამუხრუჭე დისკი','Задний тормозной диск'],
  '机油格':['Oil filter','ზეთის ფილტრი','Масляный фильтр'],
  '空气格':['Engine air filter','ძრავის ჰაერის ფილტრი','Воздушный фильтр двигателя'],
  '空调格':['Cabin air filter','სალონის ჰაერის ფილტრი','Салонный фильтр'],
  '机油4L':['Engine oil · 4 L','ძრავის ზეთი · 4 ლ','Моторное масло · 4 л'],
  '变速箱油':['Transmission fluid','გადაცემათა კოლოფის ზეთი','Масло коробки передач'],
  '分动箱油':['Transfer case oil','გამანაწილებელი კოლოფის ზეთი','Масло раздаточной коробки'],
  '前摆臂':['Front control arm','წინა საკიდრის ბერკეტი','Передний рычаг подвески'],
  '后摆臂':['Rear control arm','უკანა საკიდრის ბერკეტი','Задний рычаг подвески'],
  '前减震器':['Front shock absorber','წინა ამორტიზატორი','Передний амортизатор'],
  '后减震器':['Rear shock absorber','უკანა ამორტიზატორი','Задний амортизатор'],
  '前轮轴承':['Front wheel bearing','წინა ბორბლის საკისარი','Передний ступичный подшипник'],
  '后轮轴承':['Rear wheel bearing','უკანა ბორბლის საკისარი','Задний ступичный подшипник'],
  '小吊杆':['Stabilizer link','სტაბილიზატორის დამაკავშირებელი','Стойка стабилизатора'],
  '前保险杠':['Front bumper','წინა ბამპერი','Передний бампер'],
  '前大灯总成':['Front headlamp assembly','წინა ფარის კომპლექტი','Передняя фара в сборе'],
  '前格栅':['Front grille','წინა ცხაური','Передняя решётка'],
  '前翼子板':['Front fender','წინა ფრთა','Переднее крыло'],
  '方向机外球头':['Outer tie rod end','გარე საჭის ღეროს თავი','Наружный рулевой наконечник'],
  '方向机内球头':['Inner tie rod end','შიდა საჭის ღეროს თავი','Внутренняя рулевая тяга']
};
const categories = {
  '滤清系统':['Filters','ფილტრები','Фильтры'],
  '传动系统':['Drivetrain','ტრანსმისია','Трансмиссия'],
  '油液养护':['Fluids','ზეთები და სითხეები','Масла и жидкости'],
  '制动系统':['Brakes','სამუხრუჭე სისტემა','Тормозная система'],
  '悬挂系统':['Suspension','დაკიდების სისტემა','Подвеска'],
  '行走系统':['Wheel assemblies','ბორბლის ნაწილები','Колёсные узлы'],
  '车身外饰':['Body exterior','ძარის გარე ნაწილები','Кузовные детали'],
  '照明系统':['Lighting','განათება','Освещение'],
  '转向系统':['Steering','საჭის სისტემა','Рулевое управление']
};
const brands = {
  '比亚迪':['BYD','BYD','BYD'], '方程豹':['Fangchengbao','Fangchengbao','Fangchengbao'],
  '长安启源':['Changan Qiyuan','Changan Qiyuan','Changan Qiyuan'],
  '深蓝汽车':['Deepal','Deepal','Deepal'], '通用':['Universal','უნივერსალური','Универсальный']
};
const models = {
  '秦PLUS':'Qin PLUS','秦':'Qin','宋PLUS':'Song PLUS','宋L':'Song L','宋':'Song',
  '汉':'Han','唐':'Tang','驱逐舰05':'Destroyer 05','护卫舰07':'Frigate 07',
  '海豹06':'Seal 06','海豹07':'Seal 07','海豹':'Seal','海狮05':'Sealion 05',
  '海狮07':'Sealion 07','海狮':'Sealion','海豚':'Dolphin','海鸥':'Seagull',
  '元PLUS':'Yuan PLUS','钛7':'Titanium 7','钛9':'Titanium 9',
  '启源Q05':'Qiyuan Q05','启源Q07':'Qiyuan Q07',
  '深蓝S05':'S05','深蓝S07':'S07','王朝/海洋车系':'Dynasty / Ocean series','通用':'Universal'
};
const descriptions = {
  '滤清系统':['Filters particles in the oil or air stream. Confirm size and vehicle version before fitting.','ფილტრავს მინარევებს ზეთის ან ჰაერის ნაკადში. მონტაჟამდე შეამოწმეთ ზომა და ვერსია.','Удаляет загрязнения из масла или воздуха. Перед установкой проверьте размер и версию автомобиля.'],
  '传动系统':['Filters or lubricates drivetrain components. Confirm platform and specification before fitting.','ფილტრავს ან პოხავს ტრანსმისიის ნაწილებს. შეამოწმეთ პლატფორმა და სპეციფიკაცია.','Фильтрует или смазывает узлы трансмиссии. Проверьте платформу и спецификацию.'],
  '油液养护':['Lubricant for vehicle service. Confirm the required fluid specification before use.','სატრანსპორტო საშუალების საპოხი სითხე. გამოყენებამდე შეამოწმეთ მოთხოვნილი სპეციფიკაცია.','Смазочная жидкость для обслуживания автомобиля. Проверьте требуемую спецификацию.'],
  '制动系统':['Brake friction component. Confirm axle, dimensions and caliper version before fitting.','სამუხრუჭე კომპონენტი. შეამოწმეთ ღერძი, ზომები და სუპორტის ვერსია.','Компонент тормозной системы. Проверьте ось, размеры и версию суппорта.'],
  '悬挂系统':['Suspension component. Confirm axle, side and mounting dimensions before fitting.','დაკიდების ნაწილი. შეამოწმეთ ღერძი, მხარე და სამაგრის ზომები.','Деталь подвески. Проверьте ось, сторону и установочные размеры.'],
  '行走系统':['Wheel support component. Confirm axle and hub dimensions before fitting.','ბორბლის საყრდენი ნაწილი. შეამოწმეთ ღერძი და მორგების ზომები.','Деталь колесного узла. Проверьте ось и размеры ступицы.'],
  '车身外饰':['Exterior body component. Confirm model year, side and mounting points before fitting.','ძარის გარე ნაწილი. შეამოწმეთ გამოშვების წელი, მხარე და სამაგრები.','Кузовная деталь. Проверьте год выпуска, сторону и крепления.'],
  '照明系统':['Lighting assembly. Confirm side, light source and model year before fitting.','განათების ბლოკი. შეამოწმეთ მხარე, ნათურა და გამოშვების წელი.','Блок освещения. Проверьте сторону, источник света и год выпуска.'],
  '转向系统':['Steering linkage component. Confirm inner or outer position and thread size.','საჭის მექანიზმის ნაწილი. შეამოწმეთ შიდა ან გარე პოზიცია და ხრახნის ზომა.','Деталь рулевой тяги. Проверьте внутреннее или наружное положение и резьбу.']
};
const index = () => ({en:0,ka:1,ru:2})[getLanguage()];
export const localizePartName = name => index() === undefined ? name : (names[name]?.[index()] || name);
export const localizeCategory = category => index() === undefined ? category : (categories[category]?.[index()] || category);
export const localizeBrand = brand => index() === undefined ? brand : (brands[brand]?.[index()] || brand);
export const localizeModel = model => index() === undefined ? model : (models[model] || model);
export const localizeDescription = (category, original) => index() === undefined ? original : (descriptions[category]?.[index()] || original);
const units = {
  '瓶':['bottle','ბოთლი','бут.'], '副':['set','კომპლ.','компл.'],
  '件':['piece','ცალი','шт.'], '套':['set','კომპლ.','компл.'],
  '条':['piece','ცალი','шт.']
};
export const localizeUnit = unit => index() === undefined ? unit : (units[unit]?.[index()] || unit);
