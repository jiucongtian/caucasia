import {messages} from './translations.js';
export const languages=[{id:'ka',label:'ქართული',locale:'ka-GE'},{id:'ru',label:'Русский',locale:'ru-RU'},{id:'en',label:'English',locale:'en-US'},{id:'zh',label:'中文',locale:'zh-CN'}];
export const supportedLanguage=value=>languages.some(l=>l.id===value);
export const initialLanguage=(pathname,saved)=>supportedLanguage(pathname.split('/')[1])?pathname.split('/')[1]:supportedLanguage(saved)?saved:'ka';
export const localeFor=lang=>languages.find(l=>l.id===lang)?.locale||'ka-GE';
export const translate=(lang,zh,en)=>lang==='zh'?zh:lang==='en'?en:(messages[zh]?.[lang]||en);
export function localizedName(car,lang){return car[lang]?.trim()||car.en?.trim()||car.zh?.trim()||car.ka?.trim()||car.ru?.trim()||car.code;}
export function localizedDescription(car,lang){
 const keys={zh:'descriptionZh',en:'descriptionEn',ka:'descriptionKa',ru:'descriptionRu'};
 for(const language of [lang,'en','zh','ka','ru']){const text=car[keys[language]]?.trim();if(text)return {text,language};}
 return {text:'',language:lang};
}
export function switchLanguageURL(pathname,search,language){
 if(!supportedLanguage(language))throw new Error('Unsupported language');
 const params=new URLSearchParams(search),back=params.get('returnTo');
 if(back&&/^\/(ka|ru|zh|en)\/(vehicles|favorites)(\?|$)/.test(back))params.set('returnTo',back.replace(/^\/(ka|ru|zh|en)(?=\/|$)/,'/'+language));
 const pathnameNext=pathname==='/'?'/'+language:pathname.replace(/^\/(ka|ru|zh|en)(?=\/|$)/,'/'+language);
 return pathnameNext+(params.size?'?'+params:'');
}
