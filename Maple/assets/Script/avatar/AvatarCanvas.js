/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 纸娃娃主要逻辑.
 * @end
 ******************************************/

const AvatarPartManager = require('AvatarPartManager');
const AvatarSpecialActionConfig = require('AvatarSpecialActionConfig');

const AvatarZMap = require('AvatarZMap');
const Gear = require('Gear');
const GearType = Gear.GearType;
const Bone = require('Bone');
const GoodsConfig = require('GoodsConfig');

// 皮肤
var Skin = cc.Class({
    name: 'Skin',
    properties: {
        Name: "",
        Image: null,
        Offset: null,
        Z: ""
    }
});

// 位图信息
var BitmapOrigin = cc.Class({
    name: 'BitmapOrigin',
    properties: {
        BitmapPath: "",
        Origin: cc.p(0, 0)
    }
});

// 动作帧
var ActionFrame = cc.Class({
    name: 'ActionFrame',
    properties: {
        Action: "",
        Frame: 0,
        Delay: 0,
        Face: false,
        Flip: false,
        Move: null,
        Ratate: 0,
        RatateProp: 0
    },
    init: function (action, frame) {
        this.Action = action;
        this.Frame = frame;
    }
});

// 纸娃娃部位
var AvatarPart = cc.Class({
    name: 'AvatarPart',
    properties: {
        _node: null,
        Node: {
            get: function () {
                return this._node;
            },
            set: function (value) {
                if (this._node == value) return;
                this._node = value;
                this.ID = value.id;
            }
        },
        ISlog: "",
        Visible: true,
        ID: 0
    }
});


// 纸娃娃画布
var AvatarCanvas = cc.Class({

    name: 'AvatarCanvas',
    properties: {
        HairCover: false,
        ShowHairShade: false,
        ShowEar: false,
        WeaponIndex: 0,
        WeaponType: 0,

        // 身体
        Body: null,
        // 头部
        Head: null,
        // 脸部
        Face: null,
        // 头发
        Hair: null,
        // 帽子
        Cap: null,
        // 上衣
        Coat: null,
        // 套装
        Longcoat: null,
        // 裤子
        Pants: null,
        // 鞋子
        Shoes: null,
        // 手套
        Glove: null,
        // 盾牌
        SubWeapon: null,
        // 披风
        Cape: null,
        // 武器
        Weapon: null,
        // 耳环
        Earrings: null,
        // 脸饰
        FaceAccessory: null,
        // 眼饰
        EyeAccessory: null,

        ZMap: null

    },

    ctor: function () {
        this.ZMap = AvatarZMap;
    },

    RemoveAllPart: function () {
        this.Body = null;
        this.Head = null;
        this.Face = null;
        this.Hair = null;
        this.Cap = null;
        this.Coat = null;
        this.Longcost = null;
        this.Pants = null;
        this.Shoes = null;
        this.Glove = null;
        this.SubWeapon = null;
        this.Weapon = null;
        this.Cape = null;
        this.Earrings = null;
        this.FaceAccessory = null;
        this.EyeAccessory = null;
    },

    RemovePartByGearType: function (gearType) {
        this.setPartByGearType(gearType, null);
    },

    // 添加更新纸娃娃部位
    AddPart: function (imgNode) {
        if (!imgNode.info)
            return null;

        let part = new AvatarPart();
        part.Node = imgNode;

        AvatarPartManager.loadAvatarPartPList(part.ID);

        let gearType = Gear.GetGearType(part.ID);
        this.setPartByGearType(gearType, part);

        return part;
    },

    setPartByGearType: function (gearType, value) {
        switch (gearType) {
            case GearType.body: return this.Body = value;
            case GearType.head: return this.Head = value;
            case GearType.face: return this.Face = value;
            case GearType.hair:
            case GearType.hair2: return this.Hair = value;
            case GearType.cap:
                if (GoodsConfig[value.ID] && GoodsConfig[value.ID].is_hear_cover) {
                    this.HairCover = true;
                } else {
                    this.HairCover = false;
                }
                return this.Cap = value;
            case GearType.coat: return this.Coat = value;
            case GearType.longcoat: return this.Longcoat = value;
            case GearType.pants: return this.Pants = value;
            case GearType.shoes: return this.Shoes = value;
            case GearType.glove: return this.Glove = value;
            case GearType.shield:
            case GearType.demonShield:
            case GearType.soulShield:
            case GearType.katara: return this.SubWeapon = value;
            case GearType.cape: return this.Cape = value;
            case GearType.shovel:
            case GearType.pickaxe:
            case GearType.cashWeapon: return this.Weapon = value;
            case GearType.earrings: return this.Earrings = value;
            case GearType.faceAccessory: return this.FaceAccessory = value;
            case GearType.eyeAccessory: return this.EyeAccessory = value;
            default:
                if (Gear.IsWeapon(gearType)) {
                    return this.Weapon = value;
                }
                break;
        }
        return null;
    },

    // 获取角色动作的动画帧。
    GetActionFrames: function (actionName) {

        let speActionNode = this.getSpecialActionNode(actionName);
        if(speActionNode){
            let frames = [];
            for(let i=0; ; i++){
                let node = speActionNode[i];
                if(!node) break;
                let actionFrame = new ActionFrame();
                actionFrame.init(node.action, node.frame);
                actionFrame.Delay = node.delay || 100;
                actionFrame.Flip = node.flip || 0;
                actionFrame.Face = node.face || 0;
                actionFrame.Move = node.move || 0;
                actionFrame.Rotate = node.rotate || 0;
                actionFrame.RotateProp = node.rotateProp || 0;
                frames.push(actionFrame);
            }
            return frames;
        }else{
            let actionNode = null;
            if (this.Body != null) {
                actionNode = this.Body.Node[actionName];
            }
            if (actionNode == null) {
                let bodyNode = AvatarConfig["00002000.img"];
                actionNode = bodyNode[actionName];
            }

            let frames = this.LoadStandardFrames(actionNode, actionName);
            return frames;
        }

    },

    // 获取角色表情的动画帧
    GetFaceFrames: function (emotionName) {
        let frames = [];
        if (this.Face) {
            let actionNode = this.Face.Node[emotionName];
            if (emotionName == "default") {
                let frame = new ActionFrame();
                frame.init(emotionName, 0);
                frames.push(frame);
            } else {
                frames = this.LoadStandardFrames(actionNode, emotionName);
            }
        }
        return frames;
    },

    // 加载动画帧
    LoadStandardFrames: function (actionNode, actionName) {
        if (!actionNode) return [];

        let frames = [];
        for (let i = 0; true; i++) {
            let frameNode = actionNode[i];
            if (!frameNode)
                break;

            let actionFrame = new ActionFrame();
            actionFrame.init(actionName, i);
            actionFrame.Delay = frameNode.delay || 100;
            actionFrame.Flip = frameNode.flip || 0;
            actionFrame.Face = frameNode.face || 0;
            actionFrame.Move = frameNode.move || 0;
            actionFrame.Rotate = frameNode.rotate || 0;
            actionFrame.RotateProp = frameNode.rotateProp || 0;
            frames.push(actionFrame);
        }
        return frames;
    },

    /// 计算角色骨骼层次结构。
    CreateBoneByFrameId: function (actionName, bodyFrameId, emotionName, faceFrameId) {
        let actframes = this.GetActionFrames(actionName);
        let bodyAction = (bodyFrameId > -1 && bodyFrameId < actframes.length) ? actframes[bodyFrameId] : null;

        let emoframes = this.GetFaceFrames(emotionName);
        let faceAction = (faceFrameId > -1 && faceFrameId < emoframes.length) ? emoframes[faceFrameId] : null;

        return {
            "bone" : this.CreateBoneByFrame(bodyAction, faceAction),
            "actionFrameList" : actframes
        };
    },

    CreateBoneByFrame: function (bodyAction, faceAction) {

        //获取所有部件
        let playerNodes = this.LinkPlayerParts(bodyAction, faceAction);

        //根骨骼 作为角色原点
        let bodyRoot = new Bone();
        bodyRoot.Name = "@root";
        bodyRoot.Position = cc.p(0, 0);
        this.CreateBone(bodyRoot, playerNodes, bodyAction.Face);

        return bodyRoot;
    },

    LinkPlayerParts: function (bodyAction, faceAction) {

        let partNode = [];
        if (this.Body != null && this.Head != null && bodyAction != null) {

            // 身体
            let bodyNode = this.FindBodyActionNode(bodyAction);
            partNode.push(bodyNode);

            // 头部
            let face = bodyAction.Face;
            if (!(face == null || face == 0 || face==false)) {
                let headAction = new ActionFrame();
                headAction.init("front", null);
                partNode.push(this.FindActionFrameNode(this.Head.Node, headAction));
            } else {
                partNode.push(this.FindActionFrameNode(this.Head.Node, bodyAction));
            }

            //脸
            if (this.Face != null && faceAction != null) {
                partNode.push(this.FindActionFrameNode(this.Face.Node, faceAction));
            }
            //毛
            if (this.Hair != null) {
                if (!(face == null || face == 0 || face==false)) {
                    let headAction = new ActionFrame();
                    headAction.init("default", null);
                    partNode.push(this.FindActionFrameNode(this.Hair.Node, headAction));
                }
                else {
                    partNode.push(this.FindActionFrameNode(this.Hair.Node, bodyAction));
                }
            }

            //其他部件
            let otherParts = [this.Cap, this.Coat, this.Longcoat, this.Pants, this.Shoes, this.Glove, this.SubWeapon, this.Cape, this.Weapon, this.Earrings, this.FaceAccessory, this.EyeAccessory];
            for (let i = 0, len = otherParts.length; i < len; i++) {
                let part = otherParts[i];
                if (part) {
                    if (i == 8 && Gear.GetGearType(part.ID) == GearType.cashWeapon) //点装武器
                    {
                        let wpNode = part.Node[this.WeaponType];
                        partNode.push(this.FindActionFrameNode(wpNode, bodyAction));
                    }
                    else if (i == 10) //脸饰
                    {
                        if(!(face == null || face == 0 || face==false)){
                            partNode.push(this.FindActionFrameNode(part.Node, faceAction));
                        }else{
                            continue;
                        }
                    }
                    else //其他部件
                    {
                        partNode.push(this.FindActionFrameNode(part.Node, bodyAction));
                    }
                }
            }
        }

        // 过滤不存在的部位
        let partNodeReal = [];
        for (let i = 0, len = partNode.length; i < len; i++) {
            if (partNode[i])
                partNodeReal.push(partNode[i]);
        }

        // 返回新数据
        return partNodeReal;

    },

    FindBodyActionNode: function (actionFrame) {

        let actionNode = null;
        if (this.Body != null) {
            actionNode = this.Body.Node[actionFrame.Action];
        }
        if (actionNode == null) {
            let bodyNode = AvatarConfig["00002000.img"];
            actionNode = bodyNode[actionFrame.Action];
        }
        if (actionNode != null) {
            actionNode = actionNode[actionFrame.Frame];
        }
        return actionNode;
    },

    FindActionFrameNode: function (parent, actionFrame) {

        if (parent == null || actionFrame == null) {
            return null;
        }
        let actionNode = parent;
        if (actionNode && actionNode[actionFrame.Action]) {
            actionNode = actionNode[actionFrame.Action];
        }

        if (actionNode && actionNode[actionFrame.Frame]) {
            actionNode = actionNode[actionFrame.Frame];
        }

        return actionNode;

    },

    CreateBone: function (root, frameNodes, bodyFace) {

        let face = true;

        for (let i = 0, len = frameNodes.length; i < len; i++) {
            let linkPartNode = frameNodes[i];

            for (let key in linkPartNode) {
                let linkNode = linkPartNode[key];

                if (key == "hairShade") {
                    linkNode = linkNode[0];
                    if (!linkNode) continue;
                }

                if (linkNode.png_path) { // 纹理
                    //过滤纹理
                    switch (key) {
                        case "face": if (!bodyFace && !face) continue; break;
                        case "ear": if (!this.ShowEar) continue; break;
                        case "hairOverHead":
                        case "backHairOverCape":
                        case "backHair": if (this.HairCover) continue; break;
                        case "hair":
                        case "backHairBelowCap": if (!this.HairCover) continue; break;
                        case "hairShade": if (!this.ShowHairShade) continue; break;
                        default:
                            if (key.indexOf("weapon") == 0) {
                                // //检查是否多武器颜色
                                // if (linkNode.ParentNode.FindNodeByPath("weapon1") != null)
                                // {
                                //     //只追加限定武器
                                //     string weaponName = "weapon" + (this.WeaponIndex == 0 ? "" : this.WeaponIndex.ToString());
                                //     if (childNode.Text != weaponName)
                                //     {
                                //         continue;
                                //     }
                                // }
                            }
                            break;
                    }

                    //读取纹理
                    let skin = new Skin();
                    let bitmapOrigin = new BitmapOrigin();
                    bitmapOrigin.BitmapPath = linkNode.png_path;
                    bitmapOrigin.Origin = cc.p(linkNode.origin[0], linkNode.origin[1]);
                    skin.Image = bitmapOrigin;
                    skin.Name = key;
                    skin.Z = linkNode.z;

                    //读取骨骼
                    let mapNode = linkNode.map;
                    if (mapNode) {
                        let parentBone = null;
                        for (let mapName in mapNode) {
                            let mapXY = mapNode[mapName];
                            let mapOrigin = cc.p(mapXY[0], mapXY[1]);

                            if (mapName == "muzzle") //特殊处理 忽略
                            {
                                continue;
                            }

                            if (parentBone == null) //主骨骼
                            {
                                parentBone = this.AppendBone(root, null, skin, mapName, mapOrigin);
                            }
                            else //级联骨骼
                            {
                                this.AppendBone(root, parentBone, skin, mapName, mapOrigin);
                            }
                        }
                    }
                    else {
                        root.Skins.push(skin);
                    }

                } else {
                    switch (key) {
                        case "face":
                            face = (parseInt(linkNode) != 0);
                            break;
                    }
                }
            }
        }

    },

    AppendBone: function (root, parentBone, skin, mapName, mapOrigin) {
        let bone = root.FindChild(mapName);
        let exists = true;
        if (bone == null) //创建骨骼
        {
            exists = false;
            bone = new Bone();
            bone.Name = mapName;
            bone.Position = mapOrigin;
        }

        if (parentBone == null) //主骨骼
        {
            if (!exists) //基准骨骼不存在 加到root
            {
                parentBone = root;
                bone.Parent = parentBone;
                bone.Skins.push(skin);
                skin.Offset = cc.p(-mapOrigin.x, -mapOrigin.y);
            }
            else //如果已存在 创建一个关节
            {
                let bone0 = new Bone();
                bone0.Name = "@" + bone.Name + "_" + skin.Name;
                bone0.Position = cc.p(-mapOrigin.x, -mapOrigin.y);
                bone0.Parent = bone;
                parentBone = bone0;
                bone0.Skins.push(skin);
                skin.Offset = cc.p(0, 0);
            }
            return parentBone;
        }
        else //级联骨骼
        {
            bone.Parent = parentBone;
            bone.Position = mapOrigin;

            return null;
        }
    },


    GenerateSprite: function (bone, position) {
        let list = [];

        position = cc.pAdd(position, bone.Position);
        let skins = bone.Skins;
        for (let i = 0, len = skins.length; i < len; i++) {
            let skin = skins[i];
            let image = skin.Image;
            let pngPathList = image.BitmapPath.split("|");
            let atlasKey = pngPathList[0];
            let path = pngPathList[1];
            let pngOrigin = image.Origin;
            let zIndex = this.calcZIndex(skin.Z);
            let pos = cc.p((position.x + skin.Offset.x - pngOrigin.x), -(position.y + skin.Offset.y - pngOrigin.y));
            if(skin.Name == "default"){
                skin.Name = atlasKey;
            }
            let spriteInfo = {
                name: skin.Name,
                png_path: path,
                pos: pos,
                z: zIndex,
                atlas: atlasKey
            };

            list.push(spriteInfo);
        }

        let children = bone.Children;
        for (let i = 0, len = children.length; i < len; i++) {
            let cbone = children[i];
            let clist = this.GenerateSprite(cbone, position);
            list = list.concat(clist);
        }

        return list;

    },

    calcZIndex: function (zString) {

        let zIndex = this.ZMap.indexOf(zString);
        if (zIndex < 0) {
            zIndex = 0;
        }
        return this.ZMap.length - zIndex;
    },


    getSpecialActionNode : function(speAction){
        return AvatarSpecialActionConfig[speAction];
    },


});


module.exports = AvatarCanvas;
