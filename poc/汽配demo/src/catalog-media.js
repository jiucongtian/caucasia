// Category photographs only. A photo is not a fitment or brand claim.
const commons = file => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=640`;
const photo = (key, file, credit) => ({
  src: `./assets/catalog/${key}.jpg`,
  fallback: commons(file),
  page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%20/g, '_')}`,
  credit
});

export const CATALOG_MEDIA = {
  'oil-filter': photo('oil-filter', 'Oil filter.JPG', 'PHGCOM · CC BY-SA 3.0'),
  'engine-air': photo('engine-air', 'Air filter, opel astra(2).JPG', 'Donar Reiskoffer · CC BY 3.0'),
  'cabin-air': photo('cabin-air', 'Filtro abitacolo.JPG', 'A7N8X · CC BY-SA 4.0'),
  'reducer-filter': {
    src: './assets/catalog/reducer-filter.webp',
    fallback: 'https://cdn.evsupplychina.com/parts/byd-destroyer-05-external-gearbox-oil-filter-102.webp',
    page: 'https://evsupplychina.com/en/catalog/byd-destroyer-05-external-gearbox-oil-filter-102',
    credit: 'EV Supply China · BYD 变速箱滤芯实物'
  },
  fluid: photo('fluid', 'Motor oil bottles variousbrands.jpg', 'Frankieleon · CC BY 2.0'),
  'brake-pad': photo('brake-pad', 'Performance Disk Brake Pads.jpg', 'Treemonster86 · CC BY-SA 3.0'),
  disc: {
    src: './assets/catalog/disc.jpg',
    fallback: 'https://images.pexels.com/photos/34277923/pexels-photo-34277923/free-photo-of-close-up-of-car-disc-brake-system.jpeg?auto=compress&dpr=1&h=750&w=1260',
    page: 'https://www.pexels.com/photo/close-up-of-car-disc-brake-system-34277923/',
    credit: 'Erik Mclean · Pexels'
  },
  'control-arm': photo('control-arm', 'Gm epsilon arm.jpg', 'Sigmund419 · Public domain'),
  shock: photo('shock', 'Close-up of a car mechanic holding a shock absorber.jpg', 'Shixart1985 · CC BY 2.0'),
  bearing: photo('bearing', 'Wheel hub assembly.jpg', 'Cschirp · CC BY 3.0'),
  'stabilizer-link': photo('stabilizer-link', 'Stabilisatorkoppelstange mit Kugelgelenken BWCM IMG 20160202 1602.jpg', 'Hans Haase · CC BY-SA 4.0'),
  bumper: photo('bumper', '9091frontbumper.jpg', 'MustardCat · Public domain'),
  lamp: photo('lamp', 'Car headlamp.JPG', 'Prabhupuducherry · CC BY-SA 3.0'),
  grille: photo('grille', 'Radiator grille (10807635615).jpg', 'Tim Green · CC BY 2.0'),
  fender: photo('fender', '1935 Chrysler Deluxe left front fender (cropped).jpg', 'gadfium · Public domain'),
  'tie-rod': photo('tie-rod', 'Tie rod end.jpeg', 'Craig Howell · CC BY 2.0')
};

export const catalogImage = p => CATALOG_MEDIA[p.imageKey]?.src || '';
export const catalogFallback = p => CATALOG_MEDIA[p.imageKey]?.fallback || '';
