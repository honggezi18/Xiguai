/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 地图背景组件.
 * @end
 ******************************************/

const TileMode = require('Type').TileMode;
const SpriteNodePool = require('SpriteNodePool');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {

    },

    init : function(sp, backNode, infoNode, w, h, mapW, mapH){
        this.backNode = backNode;
        this.infoNode = infoNode;
        this.w = w;
        this.h = h;

        let cx = w;
        if(infoNode.cx > 0){
            cx = infoNode.cx;
        }
        let cy = h;
        if(infoNode.cy > 0){
            cy = infoNode.cy
        }

        let tileMode = this.getBackTileMode(infoNode.type);
        let xNum = 0;
        let yNum = 0;
        if(tileMode != TileMode.None){
            if( (tileMode & TileMode.Horizontal) !== 0 ){
                xNum = Math.ceil(mapW*1.0/cx);
            }
            if( (tileMode & TileMode.Vertical) !== 0){
                yNum = Math.ceil(mapH*1.0/cy);
            }

            
        }

        if(xNum>0&&yNum==0&&cx==w){ // 横向平铺 (2*xNum+1)=增加的平铺个数 removeComponent去掉原来的那个
            // let subNode = new cc.Node();
            // let sprite = subNode.addComponent(cc.Sprite);
            let subNode = SpriteNodePool.get();
            let sprite = subNode.getComponent(cc.Sprite);
            sprite.type = cc.Sprite.Type.TILED;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = sp;
            subNode.anchorX = 0.5;
            subNode.anchorY = 1;
            subNode.width = (2*xNum+1)*w;
            subNode.height = h; 
            subNode.position = cc.p(w/2,0);
            this.node.getComponent(cc.Sprite).spriteFrame = null;
            this.node.addChild(subNode);
        }else if(xNum==0&&yNum>0&&cy==h){ // 纵向平铺
            // let subNode = new cc.Node();
            // let sprite = subNode.addComponent(cc.Sprite);
            let subNode = SpriteNodePool.get();
            let sprite = subNode.getComponent(cc.Sprite);
            sprite.type = cc.Sprite.Type.TILED;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = sp;
            subNode.anchorX = 0;
            subNode.anchorY = 0.5;
            subNode.width = w;
            subNode.height = (2*yNum+1)*h;
            subNode.position = cc.p(0,-h/2);
            this.node.getComponent(cc.Sprite).spriteFrame = null;
            this.node.addChild(subNode);
        }else if(xNum>0&&yNum>0&&cx==w&&cy==h){ // 矩形平铺
            // let subNode = new cc.Node();
            // let sprite = subNode.addComponent(cc.Sprite);
            let subNode = SpriteNodePool.get();
            let sprite = subNode.getComponent(cc.Sprite);
            sprite.type = cc.Sprite.Type.SIMPLE;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = sp;            
            subNode.anchorX = 0.5;
            subNode.anchorY = 0.5;
            subNode.width = mapW;
            subNode.height = mapH;
            subNode.position = cc.p(0,0);
            this.node.getComponent(cc.Sprite).spriteFrame = null;
            this.node.addChild(subNode);
        }else{
            for(let i=-xNum; i<=xNum; i++){
                for(let j=-yNum; j<=yNum; j++){
                    if(i==0 && j==0) continue;

                    // let subNode = new cc.Node();
                    // let sprite = subNode.addComponent(cc.Sprite);
                    let subNode = SpriteNodePool.get();
                    let sprite = subNode.getComponent(cc.Sprite);
                    sprite.spriteFrame = sp;
                    subNode.anchorX = 0;
                    subNode.anchorY = 1;
                    subNode.position = cc.p(i*cx, j*cy);
                    this.node.addChild(subNode);
                }
            }
        }
        
        this.ms = 0;
       

    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.ms += dt*1000;

        let infoNode = this.infoNode;
        let backNode = this.backNode;

        let cx = this.w;
        if(infoNode.cx > 0){
            cx = infoNode.cx;
        }

        let offsetX = 0;
        if((this.getBackTileMode(infoNode.type)&TileMode.ScrollHorizontial)!=0){
            // cc.log("update back x ", infoNode.rx, this.ms, infoNode.cx, cx);
            offsetX = (infoNode.rx*15*this.ms/1000) % cx;
        }else{
            offsetX = (-this.node.parent.parent.x)*(100+infoNode.rx)/100;
        }

        let cy = this.h;
        if(infoNode.cy > 0){
            cy = infoNode.cy;
        }
        let offsetY = 0;
        if((this.getBackTileMode(infoNode.type)&TileMode.ScrollVertical)!=0){
            offsetY = (infoNode.ry*15*this.ms/1000) % cy;
        }else{
            offsetY = (-this.node.parent.parent.y)*(100+infoNode.ry)/100;
        }

        if(!backNode.origin)
            cc.log("x", backNode);
        this.node.position = cc.p(infoNode.x-backNode.origin[0]+offsetX, -infoNode.y+backNode.origin[1]+offsetY);

        // if((this.getBackTileMode(infoNode.type)&4)!=0){
        //     if(backNode.png_path=="grassySoil_new.img/back-3")
        //         this.node.active = false;
        //     cc.log("update back ", backNode.png_path, infoNode.x-backNode.origin[0]+offsetX, -infoNode.y+backNode.origin[1]+offsetY, offsetX, cx, infoNode.rx);
        // }else{
        //     this.node.active = false;
        // }
    },

    getBackTileMode : function(type){
        switch(type){
            case 0: return TileMode.None;
            case 1: return TileMode.Horizontal;
            case 2: return TileMode.Vertical;
            case 3: return TileMode.BothTile;
            case 4: return TileMode.Horizontal | TileMode.ScrollHorizontial;
            case 5: return TileMode.Vertical | TileMode.ScrollVertical;
            case 6: return TileMode.BothTile | TileMode.ScrollHorizontial;
            case 7: return TileMode.BothTile | TileMode.ScrollVertical;
            default: return TileMode.None;
        }
    }



});
