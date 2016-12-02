/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 游戏入口.
 * @end
 ******************************************/

const JSZip = require("./common/jszip.min.js");
const JSZipUtils = require("./common/jszip-utils.min.js");
// const AvatarSprite = require('AvatarSprite');
const ZipHelp = require("ZipHelper");
const AvatarSprite = require("AvatarSprite");
const AvatarPartManager = require("AvatarPartManager");
const SkillAtlasManager = require('SkillAtlasManager');

cc.Class({
    extends: cc.Component,

    properties: {
        role: cc.Prefab,
        anim : cc.Animation
    },

    // use this for initialization
    onLoad: function () {

        cc.director.setDisplayStats(true);
        // cc.director.setAnimationInterval(1/30);

        cc.log("Game a");
        this._index = 0;
        this._max = 0;
        this.speed = 100;

        this.node.on("load_zip_end", function(event){
            this._max = event.detail;
        }, this);

        this.node.on("add_zip", function(event){
            let addNum = event.detail;
            this._index+=addNum;
            if(this._index>0 && this._index >= this._max){
                let maphelper = this.node.getChildByName("Scene").getChildByName("MapNode").getComponent("mapHelper");
                // cc.log("load zip finished, ", this._index, this._max, maphelper);
                setTimeout(function(){
                    maphelper.setMap("Map001010200");
                }, 100);
            }
        }, this);

        this.direction = cc.p(0,0);
        
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            let touches = event.getTouches();
            let touch = touches[0];

            let preLoc = touch.getPreviousLocation();
            let nowLoc = touch.getLocation();
            let a = cc.pSub(nowLoc, preLoc);

            // let dis = cc.pDistance(startLoc, nowLoc);
            // this.speed = dis;
            // this.direction = cc.pNormalize(cc.pSub(nowLoc, preLoc));
            // cc.log("touch move ", this.direction, preLoc, nowLoc, dis);

            let node = this.node.getChildByName("Scene").getChildByName("MapNode");
            let mapHelper = node.getComponent("mapHelper");
            // let node = this.node.getChildByName("Scene");
            let oldPos = node.position;
            // cc.log("upate ", oldPos, this.direction, dt);
            var newPos = cc.pAdd(oldPos, a);
            // set new position

            let t = mapHelper.mapVRTop;
            let l = mapHelper.mapVRLeft;
            let b = mapHelper.mapVRBottom;
            let r = mapHelper.mapVRRight;
            let winSize = cc.director.getWinSize();
            let max_x = -l - winSize.width/2;
            let min_x = max_x - (r-l) + winSize.width;
            let max_y = -b-winSize.height/2;
            let min_y = max_y - (t-b) + winSize.height;
            let x = Math.min(max_x, Math.max(min_x, newPos.x));
            let y = Math.min(max_y, Math.max(min_y, newPos.y));
            // cc.log(`xx t=${t}, l=${l}, b=${b}, r=${r}, x_in(${min_x}, ${max_x}), y_in(${min_y}, ${max_y}), (${x},${y})`);

            node.position = cc.p(x, y); // 限制
            // node.position = cc.p(newPos.x, newPos.y); // 不限制

            node.stopAllActions();
            
        }, this);
        // this.node.on(cc.Node.EventType.TOUCH_END, function(event){
        //     this.direction = cc.p(0,0);
        // }, this);

        // for(var i=0; i<20; i++){
        //     var obj = cc.instantiate(this.role);
        //     var as = obj.getComponent(AvatarSprite);
        //     cc.log("as ", obj, as);
        //     as.AddPart("00002000");
        //     as.AddPart("00012000");
        //     as.AddPart("00020000");
        //     as.AddPart("01040036");
        //     as.AddPart("01060026");
        //     as.AddPart("01022017");
        //     as.AddPart("00030131");
        //     as.AddPart("01001085");
        //     as.AddPart("01432152");
        //     as.AddPart("01102068");
        //     as.AddPart("01042037");
        //     as.AddPart("01062167");
        //     as.AddPart("01070011");
        //     as.AddPart("01032210");
        //     this.node.addChild(obj);
        //     obj.position = cc.p(0+i*40,100);
        // }

        this._i = 0;
        this._ok = false;

        



        

    },

    start : function(){
        let zipHelp = new ZipHelp();
        zipHelp.start(this.node);

        // 设置本人的纸娃娃部位
        AvatarPartManager._myPartImgIdList = AvatarPartManager._defaultPartImgIdList;
        // 加载所有技能资源（先放这里）
        SkillAtlasManager.loadAtlasPList("1311001");
        SkillAtlasManager.loadAtlasPList("1311005");
        


        // let spNode = new cc.Node();
        // let sp = spNode.addComponent(cc.Sprite);
        // cc.loader.loadRes("Map/Tile/blueToyCastle", cc.SpriteAtlas, function(err, atlas){
        //     cc.log("atlas blueToyCastle ", atlas);
        //     // sp.spriteFrame = sf;
        //     // cc.log("sp=",sp, sp.type, sp.sizeMode, cc.Sprite.Type.SIMPLE, cc.Sprite.SizeMode.CUSTOM, cc.Sprite.SizeMode, cc.Sprite.Type);
        // });
        // cc.loader.loadRes("Avatar/Cap", cc.SpriteAtlas, function(err, atlas){
        //     cc.log("atlas", atlas);
        //     // sp.spriteFrame = sf;
        //     // cc.log("sp=",sp, sp.type, sp.sizeMode, cc.Sprite.Type.SIMPLE, cc.Sprite.SizeMode.CUSTOM, cc.Sprite.SizeMode, cc.Sprite.Type);
        // });
        // spNode.parent = this.node;

        // sp.spriteFrame = new cc.SpriteFrame();
        // sp.spriteFrame.setTexture(cc.url.raw("resources/Map/Obj/acc1.img/grassySoil-artificiality-6-0.png"));
        // spNode.parent = this.node;

    },

    showEffect : function(){
        cc.log("showEffect");
    },

    // moveRole : function(){

    // },


    
    // called every frame
    update: function (dt) {
        // let node = this.node.getChildByName("Scene").getChildByName("MapNode");
        // // let node = this.node.getChildByName("Scene");
        // let oldPos = node.position;
        // // cc.log("upate ", oldPos, this.direction, dt);
        // var newPos = cc.pAdd(oldPos, cc.pMult(this.direction, this.speed * dt));
        // // set new position
        // node.setPosition(newPos);
    },
});
