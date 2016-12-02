/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 技能组件.
 * @end
 ******************************************/

const SkillAtlasManager = require('SkillAtlasManager');
const MapRenderObjectType = require('Type').MapRenderObjectType;

var SkillSprite = cc.Class({
    extends : cc.Node,
    properties : {
    },

    ctor : function(){
        this.isSkillSprite = true;
        this.on('end', function(event){
            let name = event.detail;
            this.effectnum -- ;
            if(this.effectnum == 0){
                this.removeFromParent();
            }
        }, this);
    },

    playEffect : function(skillId){
        let skillNode = SkillConfig["Skill"+skillId];
        if(!skillNode) return;

        this.skillId = skillId;
        this.effectnum = 0;
        let skillObjectType = MapRenderObjectType.Skill2;

        let effect = skillNode['effect'];
        if(effect){
            this.addEffectNode(effect);
            if(effect.z < 0)
                skillObjectType = MapRenderObjectType.Skill1;
        }

        for(let i=0; ; i++){
            let effectx = skillNode['effect'+i];
            if(effectx){
                this.addEffectNode(effectx);
            }else{
                break;
            }
        }

        return skillObjectType;
    },

    addEffectNode : function(node){
        let child = new cc.Node();
        let sprite = child.addComponent(cc.Sprite);
        let skillcp = child.addComponent(SkillComponent);
        skillcp.init(this.skillId, sprite, node);

        this.addChild(child);
        this.effectnum ++;
    },

    

  


});

var SkillComponent = cc.Class({
    extends: cc.Component,
    properties: {
    },

    init : function(skillId, sprite, effectNode){
        this._skillId = skillId;
        this._sprite = sprite;
        this._effectNode = effectNode;


    },

    // use this for initialization
    onLoad: function () {
        this.ms = 0;
        this.curIndex = 0;
        this.flen = 0;
        for(let i=0;; i++){
            if(this._effectNode[i]){
                this.flen ++ ;
            }else{
                break;
            }
        }
        this.updateInfo();
    },


    updateInfo : function(){
        let effectNode = this._effectNode;
        let frameNode = effectNode[this.curIndex];

        let spframe = SkillAtlasManager.getAtlasFrame(this._skillId, frameNode.png_path);
        if(spframe){
            this._sprite.spriteFrame = spframe;
            let size = spframe.getOriginalSize();
            this.node.position = cc.p(-frameNode.origin[0]+size.width/2, frameNode.origin[1]-size.height/2);
        }

        this.delay = 100;
        if(frameNode.delay)
            this.delay = Math.abs(parseInt(frameNode.delay)) ;

        // 处理透明度渐变
        if(frameNode.a0 != null){
            this.node.opacity = frameNode.a0;
        }else{
            this.node.opacity = 255;
        }
        if(frameNode.a1 != null && frameNode.a1!=this.node.opacity){
            // 最终透明度
            this.a1 = frameNode.a1;
            // 偏移速度
            this.opacitySpeed = (frameNode.a1 - this.node.opacity) / (this.delay/1000);
        }

        // 处理缩放渐变
        if(frameNode.z0 != null){
            this.node.scale = frameNode.z0/100;
        }else{
            this.node.scale = 1;
        }
        if(frameNode.z1 != null && frameNode.z1!=this.node.scale){
            // 最终缩放值
            this.z1 = frameNode.z1 / 100;
            // 缩放速度
            this.scaleSpeed = (frameNode.z1/100 -this.node.scale) / (this.delay/1000);
        }
        
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.flen>1 && this.delay){
            this.ms += dt*1000;
            if(this.ms>this.delay){
                if(this.curIndex+1 >= this.flen){
                    // 动画完毕
                    this.node.parent.emit('end', this._effectNode[0].png_path);
                    this.flen = 0;
                }else{
                    this.curIndex ++;
                    this.updateInfo();
                    this.ms = 0;
                }
            }
        }
        // 透明度处理
        if(this.opacitySpeed){
            this.node.opacity += dt*this.opacitySpeed;
            if((this.opacitySpeed<0 && this.node.opacity < this.a1) || (this.opacitySpeed>0&&this.node.opacity>this.a1)){
                this.node.opacity = this.a1;
                this.a1 = null;
                this.opacitySpeed = null;
            }
        }
        // 缩放处理
        if(this.scaleSpeed){
            this.node.scale += dt*this.scaleSpeed;
            if((this.scaleSpeed<0 && this.node.scale < this.z1) || (this.scaleSpeed>0&&this.node.scale>this.z1)){
                this.node.scale = this.z1;
                this.z1 = null;
                this.scaleSpeed = null;
            }
        }
    },
});

module.exports = SkillSprite;