/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 怪物组件.
 * @end
 ******************************************/

const MobAtlasManager = require('MobAtlasManager');

cc.Class({
    extends: cc.Component,

    properties: {
        mobId : 0
    },

    // use this for initialization
    onLoad: function () {
        let mobId = this.mobId;
        let mobNode = MobConfig["Mob"+mobId];
        if(!mobNode){
            this.node.active = false;
            return;
        }

        this.mobNode = mobNode;
        this.ms = 0;
        this.curIndex = 0;
        this.flen = 0;
        this.sprite = this.node.getComponent(cc.Sprite);

        this.changeAction("move");
    },

    changeAction : function(action){
        if(this.action == action){
            return;
        }

        this.action = action;
        this.curIndex = 0;
        this.flen = 0;
        let actionNode = this.mobNode[this.action];
        for(let i=0;; i++){
            if(actionNode[i]){
                this.flen ++ ;
            }else{
                break;
            }
        }
        this.ms = 0;
        this.updateInfo();
    },

    updateInfo : function(){
        let actionNode = this.mobNode[this.action];
        let frameNode = actionNode[this.curIndex];

        let spframe = MobAtlasManager.getAtlasFrame(this.mobId, frameNode.png_path);
        if(spframe){
            this.sprite.spriteFrame = spframe;
            this.sprite.spriteFrame.setOffset(cc.p(-frameNode.origin[0], frameNode.origin[1]));
        }

        this.delay = 100;
        if(frameNode.delay)
            this.delay = frameNode.delay;

        // 处理透明度渐变
        if(frameNode.a0){
            this.node.opacity = frameNode.a0;
            if(frameNode.a1 != null){
                // 最终透明度
                this.a1 = frameNode.a1;
                // 偏移速度
                this.opacitySpeed = (frameNode.a1 - frameNode.a0) / (this.delay/1000);
            }
        }else{
            this.node.opacity = 255;
        }
        
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.flen>1 && this.delay){
            this.ms += dt*1000;
            if(this.ms>this.delay){
                this.curIndex = (this.curIndex+1)%this.flen;
                this.updateInfo();
                this.ms = 0;
            }
        }
        if(this.opacitySpeed){
            this.node.opacity += dt*this.opacitySpeed;
            if((this.opacitySpeed<0 && this.node.opacity < this.a1) || (this.opacitySpeed>0&&this.node.opacity>this.a1)){
                this.node.opacity = this.a1;
                this.a1 = null;
                this.opacitySpeed = null;
            }
        }
    },

});
