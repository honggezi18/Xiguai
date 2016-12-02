/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 地图物件地表组件.
 * @end
 ******************************************/

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {

    },

    init : function(sfCache, sprite, objNode, x, y, flip){
        this.sfCache = sfCache;
        this.sprite = sprite;
        this.objNode = objNode;
        this.x = x;
        this.y = y;
        this.flip = flip;
        this.curIndex = 0;
        this.flen = 0;
        for(let i=0; ; i++){
            if(objNode[i]!=null){ 
                this.flen ++;
            }else{
                break;
            }
        }
        this.ms = 0;
        this.delay = 0;

        if(flip == 1)
            this.node.scaleX = -1;

        // if(this.flen > 1)
        //     cc.log("Obj ", objNode);

        this.updateInfo();

        // if(this.objNode[0].png_path == "acc12.img/rienFD-pengiun-2-0"){
        //     cc.log("acc12.img/rienFD-pengiun-2-0 position =  ", this.node.position);
        // }
        

    },

    updateInfo : function(){
        let nowNode = this.objNode[this.curIndex];
        let sf = this.sfCache["Map/Obj/"+nowNode.png_path];
        this.sprite.spriteFrame = sf;
        if(this.flip == 1)
            this.node.position = cc.p(this.x+nowNode.origin[0], -this.y+nowNode.origin[1]);
        else
            this.node.position = cc.p(this.x-nowNode.origin[0], -this.y+nowNode.origin[1]);


        this.delay = 100;
        if(nowNode.delay)
            this.delay = nowNode.delay;
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
    },

});
