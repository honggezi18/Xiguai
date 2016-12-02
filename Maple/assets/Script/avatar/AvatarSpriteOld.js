const AvatarCanvas = require('AvatarCanvas');
const AvatarPartManager = require("../manager/AvatarPartManager.js");

var AvatarSpriteOld = cc.Class({
    extends : cc.Node,
    properties : {
        _action : "",
        _emotion : ""
    },

    ctor : function(){
        cc.log("AvatarSprite ");
        this.isAvatarSprite = true;
        this._canvas = new AvatarCanvas();
        this._avc = this.addComponent(AvatarSpriteComponent);
        this._defaultSprite = this.addComponent(cc.Sprite);
        
        // 默认形象
        // this.changePart(["00002000","00012000","00020000","00030000","01040036","01060026"]); // 无武器
        // this.changePart(["00002000","00012000","00020000","00030000","01040036","01060026","01452163"]); // 弓
        // this.changePart(["00002000","00012000","00020000","00030000","01040036","01060026","01432124"]); // 枪
        this.changePart(["00002000" // 身体
                        ,"00012000" // 头部
                        ,"00020000" // 表情 
                        ,"00030136" // 头发
                        ,"01040036" // 上衣
                        ,"01060026" // 裤子 
                        ,"01000023" // 帽子 cap
                        ,"01032013" // 耳环 earrings 
                        ,"01022014" // 眼饰 EyeAccessory 
                        ,"01012028" // 脸饰 FaceAccessory 
                        ,"01102068" // 披风 Cape 
                        ,"01080003" // 手套 Glove 
                        ,"01070001" // 鞋子 Shoes 
                        // ,"01092086" // 盾 SubWeapon
                        ,"01432124"
                    ]); // 全套不戴武器
        let stand = this._avc.getActionStandName();
        this.changeAction(stand);
        this.changeEmotion("default");
    

    },

    // 改变全身纸娃娃部位
    changePart : function(parts){
        this._canvas.RemoveAllPart();
        this._avc.initPart();
        for(let i=0; i<parts.length; i++){
            this.addPart(parts[i], false);
        }
    },

    // 新增或改变纸娃娃部位
    addPart : function(id, init){
        if(init == true){
            this._avc.initPart();
        }
        let imgNode = AvatarConfig["Avatar"+id];
        if(imgNode){
            this._canvas.AddPart(imgNode);
        }
    },

    // 删除纸娃娃部位
    delPart : function(gearType){
        this._canvas.RemovePartByGearType(gearType);
        this._avc.initPart();
    },

    // 改变动作
    changeAction : function(action){
        if(this._action == action) return;
        this._action = action;
        this._canvas.ActionName = action;
        this._avc.initPart();
        this._avc.initAction(action);
    },

    // 改变表情
    changeEmotion : function(emotion){
        if(this._emotion == emotion) return;
        this._emotion = emotion;
        this._canvas.EmotionName = emotion;
        this._avc.initPart();
        this._avc.initEmotion(emotion);
    },

    // 获取武器节点
    getWeaponNode : function(){
        if(this._canvas.Weapon){
            return this._canvas.Weapon.Node;
        }
        return null;
    },


});

var AvatarSpriteComponent = cc.Class({
    extends: cc.Component,
    // use this for initialization
    onLoad: function () { 
        this._msAction = 1000;
        this._msEmotion = 0;
        this._msResetEmotionDefault = 0;
        this._blinkNum = 0; // 间隔眨眼次数统计
        this._showInfo = [];  
        this._spList = [];

        this._actionAlert = 5000;       // 警戒5s后站立
        this._emotionContinue = 5000;   // 表情持续时间5s
        this._emotionBlink = 3000;      // 眨眼间隔3s（default状态下每3秒眨眼N次）
        this._blinkNumMax = 2;          // 间隔眨眼次数
    },

    // 重置部位信息
    initPart : function(){
        this._showInfo = [];
    },

    // 初始化动作
    initAction : function(action){
        this._msAction = 1000;
        this._msAlert = 0;
        let canvas = this.node._canvas;
        let BodyFrameNodes = canvas.Body.Node[action];
        this._maxBodyFrame = Object.keys(BodyFrameNodes).length - 1;
        this._nowBodyFrame = -1;
        this._actionDelay = BodyFrameNodes[0].delay;
        if(!this._actionDelay){
            this._actionDelay = 1000;
        }
    },

    // 初始化表情
    initEmotion : function(emotion){
        this._msEmotion = 1000;
        this._msResetEmotionDefault = 0;
        this._msBlink = 0;
        this._blinkNum = 0;
        let canvas = this.node._canvas;
        let EmotionFrameNodes = canvas.Face.Node[emotion];
        this._maxEmotionFrame = Object.keys(EmotionFrameNodes).length - 1;
        this._nowEmotionFrame = 0;
        if(EmotionFrameNodes[0]){
            this._emotionDelay = EmotionFrameNodes[0].delay;
        }else{
            this._emotionDelay = null;
        }
    },

    // 是否是循环动作
    isRepeatAction : function(action){
        let repeatActionList = ["walk1","walk2","stand1","stand2","alert","prone","fly","jump","sit","ladder","rope","blaze"];
        if(repeatActionList.indexOf(action) == -1){
            return false;
        }else{
            return true;
        }
    },

    // 获取站立动作名
    getActionStandName : function(){
        if(this.node._canvas.Weapon){
            if(this.node._canvas.Weapon.Node["stand1"]) return "stand1";
            else return "stand2";
        }else{
            return "stand1";
        }
    },

    // called every frame
    update: function (dt) {
        let canvas = this.node._canvas;
        let dtms = dt*1000;
        this._msAction += dtms;
        this._msEmotion += dtms;

        let nextBodyFrame = -1;
        if(this._msAction > this._actionDelay){
            this._msAction = 0;
            nextBodyFrame = this._nowBodyFrame + 1;
            if(nextBodyFrame > this._maxBodyFrame){
                if(this.isRepeatAction(canvas.ActionName)==false){
                    this.node.changeAction("alert");
                }
                nextBodyFrame = 0;
            }
        }else{
            nextBodyFrame = this._nowBodyFrame;
        }

        if(canvas.ActionName == "alert"){
            this._msAlert += dtms;
            if(this._msAlert > this._actionAlert){
                let stand = this.getActionStandName();
                this.node.changeAction(stand);
                nextBodyFrame = 0;
            }
        }

        let nextEmotionFrame = -1;
        if(this._emotionDelay && this._msEmotion > this._emotionDelay){
            this._msEmotion = 0;
            nextEmotionFrame = this._nowEmotionFrame + 1;
            if(nextEmotionFrame > this._maxEmotionFrame){
                // 只眨一次眼睛
                if(canvas.EmotionName=="blink"){
                    this._blinkNum ++;                  
                }
                nextEmotionFrame = 0;
            }
        }else{
            nextEmotionFrame = this._nowEmotionFrame;
        }

        if(canvas.EmotionName!="default" && canvas.EmotionName!="blink"){
            this._msResetEmotionDefault += dtms;
            if(this._msResetEmotionDefault > this._emotionContinue){
                // 重新设置为默认表情
                this.node.changeEmotion("default");
                nextEmotionFrame = 0;
            }
        }else if(canvas.EmotionName=="default"){ // default状态下每N秒眨眼睛
            this._msBlink += dtms;
            if(this._msBlink > this._emotionBlink){
                this.node.changeEmotion("blink");
                nextEmotionFrame = 0;
            }
        }else if(canvas.EmotionName=="blink"){
            if(this._blinkNum >= this._blinkNumMax){ 
                this.node.changeEmotion("default");
                nextEmotionFrame = 0;
            }  
        }
        
        if(!this._showInfo[nextBodyFrame]){
            this._showInfo[nextBodyFrame] = [];
        }
        if(!this._showInfo[nextBodyFrame][nextEmotionFrame]){
            let bone = canvas.CreateBoneByFrameId(nextBodyFrame, nextEmotionFrame);
            let spriteInfoList = canvas.GenerateSprite(bone, cc.p(0,0));
            this._showInfo[nextBodyFrame][nextEmotionFrame] = spriteInfoList;
        }

        if(nextBodyFrame==0||nextBodyFrame!=this._nowBodyFrame || nextEmotionFrame==0||nextEmotionFrame!=this._nowEmotionFrame){
            for(let name in this._spList){
                this._spList[name].active = false;
            }
            let spriteInfoList = this._showInfo[nextBodyFrame][nextEmotionFrame];
            for(let i=0,len=spriteInfoList.length; i<len; i++){
                let sp = spriteInfoList[i];
                let sprite = this._spList[sp.name];
                if(!sprite){
                    sprite = new cc.Node();
                    sprite.addComponent(cc.Sprite);
                    sprite.setAnchorPoint(0,1);
                    this.node.addChild(sprite);
                    this._spList[sp.name] = sprite;
                }
                
                let spframe = AvatarPartManager.getAtlasFrame(sp.atlas, sp.png_path);
                sprite.getComponent(cc.Sprite).spriteFrame = spframe;
                sprite.position = sp.pos;
                sprite.zIndex = sp.z;
                sprite.active = true;
            }

            if(nextBodyFrame!=this._nowBodyFrame){
                this._actionDelay = canvas.Body.Node[canvas.ActionName][nextBodyFrame].delay;
                this._nowBodyFrame = nextBodyFrame;
            }
            if(nextEmotionFrame!=this._nowEmotionFrame){
                this._emotionDelay = canvas.Face.Node[canvas.EmotionName][nextEmotionFrame].delay;
                this._nowEmotionFrame = nextEmotionFrame;
            }
            
        }
    },


});

module.exports = AvatarSpriteOld;
