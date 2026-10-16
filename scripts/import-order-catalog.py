"""Build the demo catalog from the supplied order workbook (read-only input)."""

import json
import re
import sys
from pathlib import Path

import pandas as pd


SOURCE = Path(sys.argv[1])
OUTPUT = Path(__file__).resolve().parents[1] / "src" / "order-catalog.js"

MODEL_BRANDS = {
    "秦PLUS": "比亚迪", "秦": "比亚迪", "宋PLUS": "比亚迪", "宋L": "比亚迪", "宋": "比亚迪",
    "汉": "比亚迪", "唐": "比亚迪", "驱逐舰05": "比亚迪", "护卫舰07": "比亚迪",
    "海豹06": "比亚迪", "海豹07": "比亚迪", "海豹": "比亚迪", "海狮05": "比亚迪",
    "海狮07": "比亚迪", "海狮": "比亚迪", "海豚": "比亚迪", "海鸥": "比亚迪",
    "元PLUS": "比亚迪", "钛7": "方程豹", "钛9": "方程豹",
    "启源Q05": "长安启源", "启源Q07": "长安启源",
    "深蓝S05": "深蓝汽车", "深蓝S07": "深蓝汽车",
}
ALIASES = {"元puls": "元PLUS", "宋 pulas": "宋PLUS", "宋pulas": "宋PLUS"}
ORDERED_MODELS = sorted(MODEL_BRANDS, key=len, reverse=True)

RULES = [
    ("机油滤芯", "滤清系统", 18, "oil-filter", "过滤发动机机油中的杂质；更换前需核对发动机型号及密封件规格。"),
    ("机油滤清器", "滤清系统", 18, "oil-filter", "过滤发动机机油中的杂质；更换前需核对发动机型号及密封件规格。"),
    ("机油格", "滤清系统", 18, "oil-filter", "过滤发动机机油中的杂质；更换前需核对发动机型号及密封件规格。"),
    ("钛系列空滤", "滤清系统", 21, "engine-air", "过滤进入发动机的空气；需按进气盒形状核对适配。"),
    ("空气", "滤清系统", 21, "engine-air", "过滤进入发动机的空气；需按进气盒形状核对适配。"),
    ("空调", "滤清系统", 19, "cabin-air", "过滤车内空调进气；需核对滤芯尺寸与安装位置。"),
    ("减速器滤芯", "传动系统", 32, "reducer-filter", "用于减速器润滑回路过滤；需核对动力平台与接口。"),
    ("混动滤芯", "传动系统", 32, "reducer-filter", "用于混动传动系统过滤；需核对动力平台与接口。"),
    ("齿轮油", "油液养护", 29, "fluid", "传动机构润滑用油；加注前应核对车辆要求的油品规格。"),
    ("变速箱油", "油液养护", 38, "fluid", "变速器润滑用油；加注前应核对车辆要求的油品规格。"),
    ("分动箱油", "油液养护", 34, "fluid", "分动箱润滑用油；加注前应核对车辆要求的油品规格。"),
    ("机油4L", "油液养护", 45, "fluid", "发动机润滑油；黏度以订单编号为参考，实际适配需核对车辆手册。"),
    ("刹车片", "制动系统", 68, "brake-pad", "制动摩擦件；需核对前后轴、卡钳及驱动版本。"),
    ("刹车盘", "制动系统", 92, "disc", "盘式制动件；需核对前后轴、直径、厚度及卡钳版本。"),
    ("摆臂", "悬挂系统", 115, "control-arm", "连接车轮与车身的悬挂部件；需核对安装侧及车架版本。"),
    ("减震器", "悬挂系统", 135, "shock", "衰减悬挂振动；需核对前后轴、左右侧及驱动版本。"),
    ("轴承", "行走系统", 88, "bearing", "车轮旋转支承件；需核对前后轴与轮毂规格。"),
    ("小吊杆", "悬挂系统", 32, "stabilizer-link", "稳定杆连接件；需核对安装侧与连接尺寸。"),
    ("前保", "车身外饰", 210, "bumper", "前保险杠外覆盖件；需核对年款、雷达孔位及涂装。"),
    ("大灯", "照明系统", 245, "lamp", "前照明总成；需核对安装侧、光源与年款。"),
    ("中网", "车身外饰", 98, "grille", "前格栅外饰件；需核对年款、标识与摄像头孔位。"),
    ("格栅", "车身外饰", 98, "grille", "前格栅外饰件；需核对年款、标识与摄像头孔位。"),
    ("叶子板", "车身外饰", 160, "fender", "车轮上方车身覆盖件；需核对安装侧与年款。"),
    ("翼子板", "车身外饰", 160, "fender", "车轮上方车身覆盖件；需核对安装侧与年款。"),
    ("球头", "转向系统", 52, "tie-rod", "转向拉杆连接件；需核对内外侧和螺纹规格。"),
]

def classify(name, code):
    for word, category, price, image, description in RULES:
        if word in name:
            if "后" in name and "刹车" in name:
                price = round(price * .85)
            if "钛" in name or "高性能" in code or "C2" in code:
                price = round(price * 1.3)
            return category, price, image, description
    return "其他配件", 50, "pump", "按原订单名称展示；采购前需核对具体规格。"

def models_for(raw):
    raw = next((raw.replace(a, b) for a, b in ALIASES.items() if a in raw), raw)
    if "启源Q05 Q07" in raw:
        raw = raw.replace("启源Q05 Q07", "启源Q05 启源Q07")
    if "深蓝S05 S07" in raw:
        raw = raw.replace("深蓝S05 S07", "深蓝S05 深蓝S07")
    raw = raw.replace("海豹06/07", "海豹06 海豹07").replace("海狮05/07", "海狮05 海狮07")
    if raw == "通用":
        return [{"brand": "通用", "model": "通用"}]
    found = []
    for token in ORDERED_MODELS:
        if token in raw and not any(token in entry["model"] for entry in found):
            found.append({"brand": MODEL_BRANDS[token], "model": token})
            raw = raw.replace(token, " ")
    if "王朝" in raw or "海洋" in raw:
        found.append({"brand": "比亚迪", "model": "王朝/海洋车系"})
    return found

df = pd.read_excel(SOURCE, sheet_name="销售", header=4, dtype=str).fillna("")
products = []
current_model = None
for _, row in df.iterrows():
    number = str(row["序号"]).strip()
    if not number.isdigit():
        continue
    number = int(number)
    part_number = str(row["配件编号"]).strip()
    name = str(row["配件名称"]).strip()
    raw_vehicle = str(row["车型"]).strip()
    if not name and not part_number and re.search(r"比亚迪", raw_vehicle):
        current_model = next((m for m in ["汉", "元PLUS", "宋PLUS", "海豹06"] if m in next((raw_vehicle.replace(a,b) for a,b in ALIASES.items() if a in raw_vehicle), raw_vehicle)), None)
        continue
    if not name and not part_number and raw_vehicle:
        name = {"前保": "前保险杠", "大灯": "前大灯总成", "中网": "前格栅", "叶子板": "前翼子板"}.get(raw_vehicle, raw_vehicle)
        vehicle_text = current_model or ""
        models = [{"brand": "比亚迪", "model": current_model}] if current_model else []
    else:
        vehicle_text = raw_vehicle
        models = models_for(raw_vehicle)
    if not name:
        continue
    category, base_price, image, description = classify(name, part_number)
    if current_model == "汉" and number >= 46 and not part_number:
        base_price = round(base_price * 1.15)
    if current_model == "海豹06" and number >= 86 and not part_number:
        base_price = round(base_price * 1.08)
    quantity = str(row["数量"]).strip()
    products.append({
        "id": f"order-{number:03d}", "name": name, "en": name,
        "brand": "—", "oe": part_number if re.fullmatch(r"[A-Za-z0-9-]+", part_number) else "—",
        "sourceCode": part_number, "sku": f"ORD-20261009-{number:03d}",
        "category": category, "vehicle": models[0]["brand"] if models else "待核车型",
        "model": models[0]["model"] if models else "待核车型", "fitments": models,
        "generation": "订单适配", "vehicleText": vehicle_text,
        "spec": "1 瓶" if category == "油液养护" else "1 副" if "刹车片" in name else "1 件",
        "description": description, "price": base_price, "stock": 120,
        "type": "stock", "arrival": "本地仓现货", "volume": .012, "weight": 1.2,
        "stack": True, "tag": "", "color": "#7f9fab", "imageKey": image,
        "sourceRow": number, "orderedQty": int(float(quantity)) if quantity.isdigit() else None,
    })

OUTPUT.write_text("// Generated from the supplied order workbook. Source row and original text are retained.\nexport const ORDER_PRODUCTS = " + json.dumps(products, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
print(f"Wrote {len(products)} products to {OUTPUT}")
