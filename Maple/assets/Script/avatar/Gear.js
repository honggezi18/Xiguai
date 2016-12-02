/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 纸娃娃部位定义逻辑.
 * @end
 ******************************************/

var Gear = Gear || {};
Gear.GearType = {
    body            : 0,
    head            : 1,
    face            : 2,
    hair            : 3,
    hair2           : 4,

    cap             : 100,  // 头盔 100
    faceAccessory   : 101,  // 脸饰 101
    eyeAccessory    : 102,  // 眼饰 102
    earrings        : 103,  // 耳环 103
    coat            : 104,  // 上衣 104
    longcoat        : 105,  // 套服 105
    pants           : 106,  // 裤/裙 106
    shoes           : 107,  // 鞋子 107
    glove           : 108,  // 手套 108
    shield          : 109,  // 盾牌 109
    soulShield      : 1098, // 灵魂盾 1098xxx
    demonShield     : 1099, // 精气盾 1099xxx

    cape            : 110,  // 披风 110

    ring            : 111,  // 戒指 111
    pendant         : 112,  // 坠子 112
    belt            : 113,  // 腰带 113
    medal           : 114,  // 勋章 114
    shoulderPad     : 115,  // 肩饰 115


    shiningRod      : 121,  // 双头杖 121
    soulShooter     : 122,  // 灵魂手铳 122
    desperado       : 123,  // 亡命剑 123
    energySword     : 124,  // 亡命剑 123
    magicStick      : 125,  // 驯兽魔法棒 125
    espLimiter      : 126,  // ESP限制器
    ohSword         : 130,  // 单手剑 130
    ohAxe           : 131,  // 单手斧 131
    ohBlunt         : 132,  // 单手钝器 132
    dagger          : 133,  // 短刀 133
    katara          : 134,  // 刀 134

    cane            : 136,  // 手杖
    wand            : 137,  // 短杖 137
    staff           : 138,  // 长杖 138
    barehand        : 139,  // 空手 139
    thSword         : 140,  // 双手剑 140
    thAxe           : 141,  // 双手斧 141
    thBlunt         : 142,  // 双手钝器 142
    spear           : 143,  // 枪 143
    polearm         : 144,  // 矛 144
    bow             : 145,  // 弓 145
    crossbow        : 146,  // 弩 146

    cashWeapon      : 170,  // 点装武器
    weapon          : -1,   // 武器
    subWeapon       : -2,   // 武器

    
};

// 获取装备类型
Gear.GetGearType = function(id){
    switch (Math.floor(id / 1000))
    {
        case 1098:
            return this.GearType.soulShield;
        case 1099:
            return this.GearType.demonShield;
    }

    return Math.floor(id / 10000);
};

// 是否武器
Gear.IsWeapon = function(type){
    return Gear.IsLeftWeapon(type) || Gear.IsDoubleHandWeapon(type);
};  

// 获取一个值，指示装备类型是否为主手武器。
Gear.IsLeftWeapon = function(type) {
    type = parseInt(type);
    return type >= 121 && type <= 139 && type != this.GearType.katara;
};

// 获取一个值，指示装备类型是否为双手武器。
Gear.IsDoubleHandWeapon = function(type) {
    type = parseInt(type);
    return (type >= 140 && type <= 149) || (type >= 152 && type <= 158);
};    

// 根据id获取部位名
Gear.GetPartGearNameById = function(id){
    let gearType = this.GetGearType(id);
    switch(gearType){
        case this.GearType.body: return "Body"; 
        case this.GearType.head: return "Head";
        case this.GearType.face: return "Face";
        case this.GearType.hair:
        case this.GearType.hair2: return "Hair";
        case this.GearType.cap: return "Cap";
        case this.GearType.coat: return "Coat";
        case this.GearType.longcoat: return "Longcoat";
        case this.GearType.pants: return "Pants";
        case this.GearType.shoes: return "Shoes";
        case this.GearType.glove: return "Glove";
        case this.GearType.shield:
        case this.GearType.demonShield:
        case this.GearType.soulShield:
        case this.GearType.katara: return "Subweapon";
        case this.GearType.cape: return "Cape";
        case this.GearType.shovel:
        case this.GearType.pickaxe:
        case this.GearType.cashWeapon: "Weapon";
        case this.GearType.earrings: return "Earrings";
        case this.GearType.faceAccessory: return "FaceAccessory";
        case this.GearType.eyeAccessory: return "EyeAccessory";
        default:
            if (this.IsWeapon(gearType))
            {
                return "Weapon";
            }
            break;
    }
    return "";
};

module.exports = Gear;