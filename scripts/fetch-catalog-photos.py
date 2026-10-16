"""Download category-matched Wikimedia Commons photos for the order demo."""

from pathlib import Path
from subprocess import CalledProcessError, run
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "assets" / "catalog"
FILES = {
    "oil-filter": "Oil filter.JPG",
    "engine-air": "Air filter, opel astra(2).JPG",
    "cabin-air": "Filtro abitacolo.JPG",
    "fluid": "Motor oil bottles variousbrands.jpg",
    "brake-pad": "Performance Disk Brake Pads.jpg",
    "control-arm": "Gm epsilon arm.jpg",
    "shock": "Close-up of a car mechanic holding a shock absorber.jpg",
    "bearing": "Wheel hub assembly.jpg",
    "stabilizer-link": "Stabilisatorkoppelstange mit Kugelgelenken BWCM IMG 20160202 1602.jpg",
    "bumper": "9091frontbumper.jpg",
    "lamp": "Car headlamp.JPG",
    "grille": "Radiator grille (10807635615).jpg",
    "fender": "1935 Chrysler Deluxe left front fender (cropped).jpg",
    "tie-rod": "Tie rod end.jpeg",
}
EXTERNAL_URLS = {
    "disc": "https://images.pexels.com/photos/34277923/pexels-photo-34277923/free-photo-of-close-up-of-car-disc-brake-system.jpeg?auto=compress&dpr=1&h=750&w=1260",
}

DEST.mkdir(parents=True, exist_ok=True)
for key, url in {**{key: f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}?width=640" for key, filename in FILES.items()}, **EXTERNAL_URLS}.items():
    target = DEST / f"{key}.jpg"
    if target.exists() and target.stat().st_size >= 5000:
        print(f"{key}: already present")
        continue
    temporary = target.with_suffix(".download")
    try:
        run(["curl", "-L", "--fail", "--silent", "--show-error", "--retry", "2", "--retry-all-errors", "--retry-delay", "1", "--max-time", "20", "-o", str(temporary), url], check=True)
        if temporary.stat().st_size < 5000:
            raise RuntimeError(f"Suspicious image size: {temporary}")
        temporary.rename(target)
        print(f"{key}: {target.stat().st_size} bytes")
    except (CalledProcessError, RuntimeError) as error:
        temporary.unlink(missing_ok=True)
        print(f"{key}: FAILED ({error})")
