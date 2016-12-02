/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 地图组件逻辑.
 * @end
 ******************************************/

const MapRenderObjectType = require('Type').MapRenderObjectType;
const SpriteNodePool = require('SpriteNodePool');
const SkillSprite = require("SkillSprite");
const AvatarSprite = require("AvatarSprite");
const AvatarPartManager = require("AvatarPartManager");
const mapTiles = require("mapTiles");
const SceneConfig = require("SceneConfig");


cc.Class({
    extends: cc.Component,

    properties: {
        mapId : "",
        mapFront : cc.Node
    },

    // use this for initialization
    onLoad: function () {
        // this.mapId = "Map001010000";
        // this.mapConfig = MapConfig[this.mapId];
        // cc.log(this.mapConfig);

        this.mapId = ""; // "Map001010000"
        this.mapIdInt = "0"; // "001010000"
        this.mapEditPrefab = null;

        this.renderList = [];
        this.spriteFrames = {};
        this.spriteAtlass = {};
        this.loadFrameNum = 0;
        this.loadAtlasNum = 0;
        this.loadFrameIndex = 0;
        this.loadAtlasIndex = 0;
        
        this.mapLayer = new cc.Node();
        this.mapLayer.parent = this.node;

        this.startInitMapIndex = 0;
        this.startInitMapFlag = false;
        this.startLoadAvatarIndex = 0;
        this.startLoadAvatarFlag = false;

        let loadingNode = this.mapFront.getChildByName("loading");
        loadingNode.opacity = 255;
        loadingNode.getComponent(cc.Label).string = "0/0(0%)";


        this.loadingHelper = this.mapFront.getChildByName("loading").getComponent("mapLoadingHelper");

        this.node.on("add_item", function(event){
            let item = event.detail;
            if(!item.err){
                switch(item.type){
                    case 1 : // 地图图片资源
                        this.spriteFrames[item.key] = item.data; 
                        break;
                    case 2 : // 地图合图资源
                        this.spriteAtlass[item.key] = item.data;
                        break;
                    case 4 :
                        this.mapEditPrefab = item.data;
                        break; 
                    default :
                        break;
                }
            }
            switch(item.type){
                case 4 : // 地图编辑信息(prefab)
                case 1 : // 地图图片资源
                    this.loadingHelper.addResNum(1, 0);
                    this.loadFrameIndex ++;
                    break;
                case 2 : // 地图合图资源
                case 3 : // 纸娃娃合图资源
                    this.loadingHelper.addResNum(0, 1);
                    this.loadAtlasIndex ++;
                    break;
                default :
                    break;
            }
            // cc.log("add_item ", (new Date()).getTime(), item.type, item.key, this.loadingHelper.loadFrameIndex, this.loadingHelper.loadAtlasIndex);
            
            // cc.log("xx ", this.loadFrameIndex, this.loadFrameNum, this.loadAtlasIndex, this.loadAtlasNum);
            // 加载地图资源完毕
            if(this.loadFrameIndex>0&&this.loadFrameIndex>=this.loadFrameNum &&
               this.loadAtlasIndex>0&&this.loadAtlasIndex>=this.loadAtlasNum){
                this.loadFrameNum = 0;
                this.loadAtlasNum = 0;
                this.loadFrameIndex = 0;
                this.loadAtlasIndex = 0;
                this.startInitMap();
                   
            }
        }, this);

        // cc.log("MapRenderObjectType = ", MapRenderObjectType);
        
    },

    returnAllNode : function(nodeList){
        // cc.log("returnAllNode XX ", pool.size, pool.idx, nodeList);
        for(let i=nodeList.length-1; i>=0; i--){
            let node = nodeList[i];
            if(node.isAvatarSprite == true){
                node.removeFromParent();
                continue;
            }

            let children = node.children;
            this.returnAllNode(children);
            SpriteNodePool.put(node);
        }


    },

    // 开始加载地图
    startInitMap : function(){
        // 清理上个场景节点
        this.returnAllNode(this.mapLayer.children);
        // this.mapLayer.removeAllChildren();

        // 设置地图大小
        this.calcMapSize();
        // 设置加载地图初始参数，分帧加载
        this.startInitMapFlag = true;
        this.startInitMapIndex = 0;     
        // cc.log("startInitMap ", (new Date()).getTime() );
        this.loadingHelper.initMapObjNum(this.renderList.length);   

        // 构造地图编辑信息
        mapTiles.setMapTile(this.mapEditPrefab);


        // 测试
        // cc.log("startInitMap add role began ", (new Date()).getTime() );
        let role = new AvatarSprite();
        role.position = mapTiles.randTilePoint().point;
        this.addNodeToMapLayer(role, MapRenderObjectType.Role, 0);
        this.role = role;
        this.node.getComponent("RoleCtrl").setRole(role);
        // cc.log("role = ",role);
        this.addFollowRoleAction();

        let mob = SpriteNodePool.get();
        cc.log("mob xxx ", mob.position, mob.x, mob.y);
        mob.anchorX = 0.5;
        mob.anchorY = 0;
        let mobrender = mob.addComponent('mobRender');
        mobrender.mobId = "9303002";
        mob.position = mapTiles.randTilePoint().point;
        this.addNodeToMapLayer(mob, MapRenderObjectType.Mob, 0);
        this.mob = mob;
        cc.log("mob = ", mob.position, mob.x, mob.y, mob);

        this.loadMob();

        // cc.log("startInitMap add role end ", (new Date()).getTime() );
    
    },

    // 地图元素比较函数
    comparison : function(a, b){
        var aZList = a._ZIndex;
        var bZList = b._ZIndex;
        for(var i=0; i<aZList.length; i++){
            var dz = aZList[i] - bZList[i];
            if(dz!=0){
                return dz;
            }
        }
        return -1;
    },

    // 更换场景
    setMap : function(mapId){
        // 黑色遮罩
        this.mapFront.opacity = 255;
        this.loadingHelper.init();

        this.mapId = mapId;
        this.mapIdInt = mapId.substr(3);
        let mapNode = MapConfig[mapId];
        // cc.log("setMap", mapNode);
        // 所有渲染元素
        let renderList = [];
        // 该地图需要使用的图片：一般存放Obj和Back的资源
        let spriteFrames = {};
        // 该地图需要使用的合图：一般存放Tile的资源
        let spriteAtlass = {};

        for(let i=0;;i++){
            let objTileNode = mapNode[i];
            if(objTileNode == null) break;
            // 地图物件元素
            let objListNode = objTileNode.obj;
            if(objListNode){
                let loadIndex = 0;
                for(let key in objListNode){
                    let node = objListNode[key];
                    let oS = node.oS;
                    let l0 = node.l0;
                    let l1 = node.l1;
                    let l2 = node.l2;
                    let x = node.x;
                    let y = node.y;
                    let z = node.z;
                    let f = node.f;
                    let zM = node.zM;
                    let tags = node.tags;
                    if(oS!=null && l0!=null && l1!=null && l2!=null){
                        let objNode = ObjConfig["Obj"+oS][l0][l1][l2];
                        let objPaths = {};
                        for(let objkey in objNode){
                            if(objNode[objkey].png_path){
                                let path = "Map/Obj/" + objNode[objkey].png_path;
                                // let path = `Map/Obj/${oS}.img/${l0}-${l1}-${l2}-${objkey}`;
                                spriteFrames[path] = true;
                                objPaths[objkey] = path;
                            }
                        }

                        let render = {};
                        render.x = x;
                        render.y = y;
                        render.objPaths = objPaths; 
                        render.objNode = objNode;
                        render.objType = MapRenderObjectType.Obj;
                        render.flip = f;
                        render._ZIndex = [];
                        render._ZIndex.push(MapRenderObjectType.Obj);
                        render._ZIndex.push(i);
                        render._ZIndex.push(MapRenderObjectType.Obj);
                        render._ZIndex.push(z);
                        render._ZIndex.push(loadIndex);
                        render._ZIndex.push(zM);
                        renderList.push(render);

                    }
                    loadIndex ++;
                }
            }

            let tS = objTileNode.info.tS;
            if(tS==null) continue;
            // 地图块元素
            let tileListNode = objTileNode.tile;
            if(tileListNode){
                let loadIndex = 0;
                for(let key in tileListNode){
                    let node = tileListNode[key];
                    let x = node.x;
                    let y = node.y;
                    let u = node.u;
                    let no = node.no;
                    let zM = node.zM;
                    if(u!=null && no!=null){
                        let tileNode = TileConfig["Tile"+tS][u][no];
                        spriteAtlass[tS] = true;

                        let render = {};
                        render.x = x;
                        render.y = y;
                        render.AtlasPath = tS;
                        render.AtlasKey = `${u}-${no}`;
                        render.tileNode = tileNode;
                        render.objType = MapRenderObjectType.Tile;
                        render._ZIndex = [];
                        render._ZIndex.push(MapRenderObjectType.Obj);
                        render._ZIndex.push(i);
                        render._ZIndex.push(MapRenderObjectType.Tile);
                        render._ZIndex.push(tileNode.z);
                        render._ZIndex.push(loadIndex);
                        render._ZIndex.push(zM);
                        renderList.push(render);

                    }
                    loadIndex ++ ;
                }
            }
        }

        // 背景元素
        let backListNode = mapNode["back"];
        if(backListNode!=null){
            for(let key in backListNode){
                let node = backListNode[key];
                let x = node.x;
                let y = node.y;
                let bS = node.bS;
                let ani = node.ani;
                let no = node.no;
                let f = node.f;
                let front = node.front;
                let type = node.type;
                let cx = node.cx;
                let cy = node.cy;
                let rx = node.rx;
                let ry = node.ry;
                let a = node.a;
                let screenMode = node.screenMode;

                if(bS!=null && no!=null){
                    let subPath = "";
                    switch(ani){
                        case 0 : subPath = "back";break;
                        case 1 : subPath = "ani";break;
                        case 2 : subPath = "spine";break;
                    }
                    let backNode = BackConfig["Back"+bS][subPath][no];

                    let objType = front!=0?MapRenderObjectType.Front:MapRenderObjectType.Back;
                    let path = "";
                    if(ani==0){
                        path = "Map/Back/" + backNode.png_path;
                        // path = `Map/Back/${bS}.img/${subPath}-${no}`;
                    }else{
                        backNode = backNode[0];
                        path = "Map/Back/" + backNode.png_path;
                        // path = `Map/Back/${bS}.img/${subPath}-${no}-0`;
                    }
                    spriteFrames[path] = true;

                    let render = {};
                    render.spriteFramePath = path;  
                    render.infoNode = node;
                    render.backNode = backNode;
                    render.objType = objType;
                    render._ZIndex = [];
                    render._ZIndex.push(objType);
                    render._ZIndex.push(key);
                    render.flip = f;
                    renderList.push(render);

                }

            }
        }

        // 所有地图元素排序
        this.renderList = renderList.sort(this.comparison);

        // cc.log("renderList = ", renderList);
        // cc.log("spriteFrames = ", spriteFrames);
        // cc.log("spriteAtlass = ", spriteAtlass);
        // 清理地图纸娃娃部位资源
        AvatarPartManager.releaseCaches();
        // 开始加载地图资源
        this.loadResouces(spriteFrames, spriteAtlass);
        

    },

    // 计算设置地图大小
    calcMapSize : function(){
        let mapNode = MapConfig[this.mapId];
        let renderList = this.renderList;
        let t = -mapNode.info.VRTop;
        let l = mapNode.info.VRLeft;
        let b = -mapNode.info.VRBottom;
        let r = mapNode.info.VRRight;
        // 边坐标信息不存在，则通过renderList计算
        if(!t||!l||!b||!r){
            let worldRect = new cc.rect();
            for(let i=0,len=renderList.length; i<len; i++){
                let render = renderList[i];
                if(render.objType==MapRenderObjectType.Tile){
                    let atlas = this.spriteAtlass[render.AtlasPath];
                    let sf = atlas.getSpriteFrame(render.AtlasKey);
                    let w = sf.getOriginalSize().width;
                    let h = sf.getOriginalSize().height;
                    let tileNode = render.tileNode;
                    let x = render.x-tileNode.origin[0];
                    let y = -render.y+tileNode.origin[1]-h;
                    let tileRect = new cc.rect(x,y,w,h);
                    worldRect = cc.rectUnion(worldRect, tileRect); 
                }
            }
            t = worldRect.y + worldRect.height + 400;
            l = worldRect.x;
            b = worldRect.y;
            r = worldRect.x + worldRect.width;
        }
        this.mapVRTop = t;
        this.mapVRLeft = l;
        this.mapVRBottom = b;
        this.mapVRRight = r;

        let mapsizeInfoNode = cc.find("Canvas/MainUI/topUILayer/topInfo/mapSize");
        mapsizeInfoNode.getComponent(cc.Label).string = `(${l},${b},${r-l},${t-b})`;
        // cc.log(`map size ${this.mapVRTop},${this.mapVRLeft},${this.mapVRBottom},${this.mapVRRight}`);
        // 设置地图初始坐标
        let winSize = cc.director.getWinSize();
        this.node.position = cc.p(-this.mapVRLeft-winSize.width/2, -this.mapVRBottom-winSize.height/2);
    },

    // 加载地图资源
    loadResouces : function(spriteFrames, spriteAtlass){
        let self = this;

        if(this.mapEditPrefab){
            cc.loader.releaseAsset(this.mapEditPrefab);
            this.mapEditPrefab = null;
        }
        cc.loader.loadRes("Prefab/mapEditor/mapEditor"+this.mapIdInt, cc.Prefab, function(err, prefab){
            if(err){
                cc.log("Load Map edit prefab Error : " , err);
            }
            self.node.emit('add_item', {
                err : err,
                type : 4,
                data : prefab,
            });
        });


        // 所有旧资源设置为清理标识
        for(let key in this.spriteFrames){
            this.spriteFrames[key].clear = true;
        }
        for(let key in this.spriteAtlass){
            this.spriteAtlass[key].clear = true;
        }

        // 计算需要新加载的图片资源
        let needLoadFrames = [];
        for(let key in spriteFrames){
            if(this.spriteFrames[key]){
                this.spriteFrames[key].clear = false;
            }else{
                needLoadFrames.push(key);
            }
        }
        // 清理本地图不需要的图片资源
        for(let key in this.spriteFrames){
            if(this.spriteFrames[key].clear){
                cc.loader.releaseAsset(this.spriteFrames[key]);
                delete this.spriteFrames[key];
            }
        }      
        
        // 计算需要新加载的合图资源
        let needLoadAtlass = [];
        for(let key in spriteAtlass){
            if(this.spriteAtlass[key]){
                this.spriteAtlass[key].clear = false;
            }else{
                needLoadAtlass.push(key);
            }
        }
        // 清理本地图不需要的合图资源
        for(let key in this.spriteAtlass){
            if(this.spriteAtlass[key].clear){
                cc.loader.releaseAsset(this.spriteAtlass[key]);
                delete  this.spriteAtlass[key];
            }
        }

        // 加载本人的纸娃娃部位资源
        let myAvatarPartList = [];
        myAvatarPartList = AvatarPartManager.getMyAvartarPartList();
        this._myAvatarPartList = myAvatarPartList;
        this.startLoadAvatarFlag = true;
        this.startLoadAvatarIndex = 0;


        this.loadFrameNum = needLoadFrames.length + 1; // 1是地图编辑信息(prefab)
        this.loadAtlasNum = needLoadAtlass.length;// + myAvatarPartList.length;
        this.loadingHelper.initResNum(this.loadFrameNum, this.loadAtlasNum);
        // 加载图片资源
        for(let i=0; i<needLoadFrames.length; i++){
            cc.loader.loadRes(needLoadFrames[i], cc.SpriteFrame, function(err, sf){
                if(err){
                    cc.log("Load Map sf Error : " , err);
                }
                // cc.log("load map res frame ", (new Date()).getTime(), needLoadFrames[i] );
                self.node.emit('add_item', {
                    err : err,
                    type : 1,
                    data : sf,
                    key : needLoadFrames[i]
                })
            });
        }
        if(this.loadFrameNum == 0){
            this.loadFrameNum = 1;
            self.node.emit('add_item',{err:1, type:1});
        }

        // 加载合图资源
        for(let i=0; i<needLoadAtlass.length; i++){
            cc.loader.loadRes("Map/Tile/"+needLoadAtlass[i], cc.SpriteAtlas, function(err, atlas){
                if(err){
                    cc.log("Load Map atlas Error : ", err);
                }
                // cc.log("load map res atlas ", (new Date()).getTime(), needLoadAtlass[i] );
                self.node.emit('add_item', {
                    err : err,
                    type : 2,
                    data : atlas,
                    key : needLoadAtlass[i]
                })
            })
        }
        // 加载纸娃娃合图资源 改为顺序加载
        this.loadAvatarPart();

        if(this.loadAtlasNum == 0){
            this.loadAtlasNum = 1;
            self.node.emit('add_item',{err:true, type:2});
        }
 
    },

    // 顺序加载纸娃娃资源
    loadAvatarPart : function(){
        if(this.startLoadAvatarFlag==true&&this._myAvatarPartList.length>0&&this.startLoadAvatarIndex<this._myAvatarPartList.length){
            let nowIndex = this.startLoadAvatarIndex;
            this.startLoadAvatarIndex ++;
            AvatarPartManager.loadAvatarPartPList(this._myAvatarPartList[nowIndex], function(){
                this.node.emit('add_item', {
                    err : null,
                    type : 3
                })
                if(this.startLoadAvatarIndex >= this._myAvatarPartList.length){
                    cc.log("load Avatar part end ");
                    this.startLoadAvatarFlag = false;
                }
                this.loadAvatarPart();
            }.bind(this));
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

        // 分帧加载地图
        if(this.startInitMapFlag==true&&this.renderList.length>0 && this.startInitMapIndex<this.renderList.length){
            // cc.log("map update ", (new Date()).getTime(), this.startInitMapIndex, dt,1/dt );
            for(let i=0; i<20; i++){
                this.addMapItem(this.startInitMapIndex);
                this.startInitMapIndex ++;
            }       

            // 加载地图完成
            if(this.startInitMapIndex >= this.renderList.length){
                this.startInitMapFlag = false;         
                // cc.log("map update end ", (new Date()).getTime(), this.startInitMapIndex, this.renderList.length );
            }    
        }
    },

    addFollowRoleAction : function(){
        this.node.stopAllActions();
        let winSize = cc.director.getWinSize();
        this._follow =  cc.follow(this.role, new cc.rect(this.mapVRLeft+winSize.width/2,this.mapVRBottom+winSize.height/2, this.mapVRRight-this.mapVRLeft, this.mapVRTop-this.mapVRBottom));
        this._follow.retain();
        this.node.runAction(this._follow);
    },

    addNodeToMapLayer : function(node, type, zorder){
        node._mapObjType = type;
        this.mapLayer.addChild(node, type*100000+zorder);
    },

    addMapItem : function(i){
        let render = this.renderList[i];
        if(!render) return;

        // let node = new cc.Node();
        let node = SpriteNodePool.get();
        let sp = node.getComponent(cc.Sprite);
        if(render.objType == MapRenderObjectType.Tile){
            // let sp = node.addComponent(cc.Sprite);
            let atlas = this.spriteAtlass[render.AtlasPath];
            let tileNode = render.tileNode;
            node.anchorX = 0;
            node.anchorY = 1;
            node.position = cc.p(render.x-tileNode.origin[0],-render.y+tileNode.origin[1]);
            sp.spriteFrame = atlas.getSpriteFrame(render.AtlasKey);
            this.addNodeToMapLayer(node, MapRenderObjectType.Obj, i);
        }else if(render.objType == MapRenderObjectType.Obj){
            // let sp = node.addComponent(cc.Sprite);
            let objrender = node.addComponent('mapObjRender');
            objrender.init(this.spriteFrames, sp, render.objNode, render.x, render.y, render.flip);
            node.anchorX = 0;
            node.anchorY = 1;
            this.addNodeToMapLayer(node, MapRenderObjectType.Obj, i);
        }else if(render.objType == MapRenderObjectType.Back || render.objType==MapRenderObjectType.Front){
            // let sp = node.addComponent(cc.Sprite);
            sp.spriteFrame = this.spriteFrames[render.spriteFramePath];
            let w = sp.spriteFrame.getOriginalSize().width;
            let h = sp.spriteFrame.getOriginalSize().height;
            let backrender = node.addComponent('mapBackRender');
            let mapWidth = this.mapVRRight - this.mapVRLeft;
            let mapHeight = this.mapVRTop - this.mapVRBottom;
            backrender.init(this.spriteFrames[render.spriteFramePath], render.backNode, render.infoNode, w, h, mapWidth, mapHeight);
            node.anchorX = 0;
            node.anchorY = 1;
            if(render.flip == 1)
                node.scaleX = -1;
            if(!render.backNode.origin)
                cc.log(render.backNode);
            node.position = cc.p(render.infoNode.x-render.backNode.origin[0],-render.infoNode.y+render.backNode.origin[1]);
            
            this.addNodeToMapLayer(node, render.objType, i);
        }

        this.loadingHelper.addMapObjNum(1);
    },

    // 根据配置加载所有怪物
    loadMob : function(){
        let sceneConfig = SceneConfig[this.mapIdInt];
        if(!sceneConfig) return;

        let mobList = sceneConfig.mob_list;
        for(let i=0; i<mobList.length; i++){
            let mobId = mobList[i][0];
            let num = mobList[i][1];
            
            for(let j=0; j<num; j++){
                let mob = SpriteNodePool.get();
                mob.anchorX = 0.5;
                mob.anchorY = 0;
                let mobrender = mob.addComponent('mobRender');
                let mobai = mob.addComponent('mobAI');
                mobrender.mobId = mobId;
                let randTilePoint = mapTiles.randTilePoint(); 
                mob.position = randTilePoint.point;
                mobai.maxX = randTilePoint.maxX;
                mobai.minX = randTilePoint.minX;
                cc.log("randTilePoint ", randTilePoint);
                this.addNodeToMapLayer(mob, MapRenderObjectType.Mob, mapTiles.getMobIndex(mobId));
            }
            
        }

        // this.addMapTilesShowSprites();

    },


    addSkillEffect : function(skillId, position, scaleX){
        // cc.log("add skill effect ", skillId, position, scaleX);
        let skill = new SkillSprite();
        skill.position = position;
        skill.scaleX = scaleX;
        let objType = skill.playEffect(skillId);
        this.addNodeToMapLayer(skill, objType, 0);

        this.role.changeAction("burster");

    },

    addMapTilesShowSprites : function(){
        let tiles = mapTiles.tiles;
        let sp = cc.find("Canvas/bg").getComponent(cc.Sprite).spriteFrame;
        for(let i=0; i<tiles.length; i++){
            let tile = tiles[i];
            let tileSprite = SpriteNodePool.get();
            tileSprite.anchorX = 0;
            tileSprite.anchorY = 0;
            tileSprite.getComponent(cc.Sprite).type = cc.Sprite.Type.SIMPLE;
            tileSprite.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.CUSTOM;
            tileSprite.getComponent(cc.Sprite).spriteFrame = sp;
            tileSprite.width = tile.endPoint.x - tile.startPoint.x;
            tileSprite.height = 30;
            tileSprite.position = cc.p(tile.startPoint.x,tile.startPoint.y);
            this.addNodeToMapLayer(tileSprite, MapRenderObjectType.Front, i);
        }
        

    },

    // 测试函数
    showandhiteChildren : function(typeString){
        let parent = this.mapLayer;
        let type = 0;
        switch(typeString){
            case "role" : type = MapRenderObjectType.Role;break;
            case "mob" : type = MapRenderObjectType.Mob;break;
            case "back" : type = MapRenderObjectType.Back;break;
            case "front" : type = MapRenderObjectType.Front;break;
            case "tile_obj" : type = MapRenderObjectType.Obj;break;
            default : break; 
        }
        if(type == 0){
            parent.active = !parent.active;
        }else{
            let children = parent.children;
            for(let i=0; i<children.length; i++){
                if(children[i]._mapObjType == type){
                    children[i].active = !children[i].active;
                }
            }
        }
    },

    // 

});
