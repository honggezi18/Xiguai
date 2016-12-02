/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 主界面.
 * @end
 ******************************************/
const Gear = require('Gear');

cc.Class({
    extends: cc.Component,

    properties: {
        svNode : cc.Node,
        mapNode : cc.Node
    },

    // use this for initialization
    onLoad: function () {
        
        this.svContent = this.svNode.getChildByName("view").getChildByName("content");
        this.itemTmp = this.svNode.getChildByName("view").getChildByName("item");


    },

    resetSVActive : function(key){
        let sv = this.svNode;
        if(sv.nowShowType==key && sv.active==true){
            sv.active = false;
        }else if(sv.active == false){
            sv.active = true;
        }
    },

    putItemListToSV : function(key, list){
        this.svNode.nowShowType = key;
        let content = this.svContent;
        content.removeAllChildren();
        content.height = list.length *40;
        for(let i=0; i<list.length; i++){
            let item = cc.instantiate(this.itemTmp);
            item.active = true;
            item.getComponent(cc.Label).string = list[i];
            item._mykey = key;
            item.position = cc.p(-item.width/2, -i*40);
            content.addChild(item);
        }
    },

    changeMapBtnEvent : function(){
        this.resetSVActive("map");
        if(this.svNode.active){
            let mapConfigKeys = Object.keys(MapConfig);
            this.putItemListToSV("map", mapConfigKeys);
        }
    },

    changeEmotionBtnEvent : function(){
        this.resetSVActive("emotion");
        if(this.svNode.active){
            let EmotionList = Object.keys(AvatarConfig["Avatar00020000"]);
            cc.js.array.remove(EmotionList, "id");
            cc.js.array.remove(EmotionList, "info");
            cc.js.array.remove(EmotionList, "default");
            cc.js.array.remove(EmotionList, "blink");
            this.putItemListToSV("emotion", EmotionList);
        }
    },

    changeActionBtnEvent : function(){
        this.resetSVActive("action");
        if(this.svNode.active){
            let role = this.mapNode.getComponent('mapHelper').role;
            let weaponNode = role.getWeaponNode();
            let ActionList = [];
            if(weaponNode){
                ActionList = Object.keys(weaponNode);
                ActionList.push("sit");
                ActionList.push("ladder");
                ActionList.push("rope");
            }else{
                ActionList = Object.keys(AvatarConfig["Avatar00002000"]);
                cc.js.array.remove(ActionList, "walk2");
                cc.js.array.remove(ActionList, "stand2");
            }
            cc.js.array.remove(ActionList, "id");
            cc.js.array.remove(ActionList, "info");
            this.putItemListToSV("action", ActionList);
        }
    },

    changePartBtnEvent : function(){
        this.resetSVActive("part");
        if(this.svNode.active){
            let PartGearList = ["Weapon","Cap","Earrings","EyeAccessory","FaceAccessory","Hair","Head","Body","Cape","Coat","Face","Glove","Pants","Shoes","Subweapon"];
            this.putItemListToSV("part", PartGearList);
        }
    },

    changeMobActionBtnEvent : function(){
        this.resetSVActive("mobAction");
        if(this.svNode.active){
            let List = ["move","stand","hit1","die1"];
            this.putItemListToSV("mobAction", List);
        }
    },

    skillBtnEvent : function(){
        this.resetSVActive("skill");
        if(this.svNode.active){
            let list = [];
            for(let key in SkillConfig){
                let id = SkillConfig[key].id;
                list.push(id);
            }
            this.putItemListToSV("skill", list);
        }
    },

    showandhiteBtnEvent : function(){
        this.resetSVActive("showandhite");
        if(this.svNode.active){
            let List = ["role","mob","tile_obj","back","front"];
            this.putItemListToSV("showandhite", List);
        }
    },



    btnTouchEvent : function(event){
        let obj = event.target;
        let key = obj._mykey;
        let value = obj.getComponent(cc.Label).string;
        switch(key){
            case "map" : 
                this.mapNode.getComponent('mapHelper').setMap(value);
                break;
            case "emotion" :
                this.mapNode.getComponent('mapHelper').role.changeEmotion(value);
                break;
            case "action" :
                this.mapNode.getComponent('mapHelper').role.changeAction(value);
                break;
            case "part" :
                let config = AvatarConfig;
                let list = [];
                for(let key in config){
                    let id = parseInt(config[key].id);
                    let gearTypeName = Gear.GetPartGearNameById(id);
                    if(gearTypeName == value){
                        list.push(config[key].id);
                    }
                }
                this.putItemListToSV("partId", list);
                break;
            case "partId" :
                this.mapNode.getComponent('mapHelper').role.addPart(value, true);
                break;
            case "mobAction" :
                this.mapNode.getComponent('mapHelper').mob.getComponent("mobRender").changeAction(value);
                break;
            case "skill":
                let role = this.mapNode.getComponent('mapHelper').role;
                this.mapNode.getComponent('mapHelper').addSkillEffect(value, role.position, role.scaleX);
                break;
            case "showandhite" :
                this.mapNode.getComponent('mapHelper').showandhiteChildren(value);
                break;
            default :
                break;
        }
    },

    


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
