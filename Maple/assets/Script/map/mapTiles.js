
/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 地图工具类.
 * @end
 ******************************************/
const MapTileType = require('Type').MapTileType;

//单例
var mapTiles = (function(){
    //私有构造方法
    function _mapTiles() {
        this.all = [];
        this.tiles = [];
        this.mobIndexDict = {};
        this.mobIndex = 100;
    }

	let unique;
	unique = new _mapTiles();
	return unique;
})();

mapTiles._getTypeAndStartEndPoint = function(node){
    let type = node.opacity;
    let x1=0; let y1=0; let x2=0; let y2=0;
    if(type != MapTileType.Tile){ // 绳子或者梯子，取左下角到左上角
        x1 = node.x - node.width*node.anchorX;
        y1 = node.y - node.height*node.anchorY;
        x2 = x1;
        y2 = y1 + node.height;
    }else{ // 地表去左下角到右下角
        x1 = node.x - node.width*node.anchorX;
        y1 = node.y - node.height*node.anchorY;
        x2 = x1 + node.width;
        y2 = y1;
    }

    return {
        id : node.name,
        type : type,
        startPoint : cc.p(x1,y1),
        endPoint : cc.p(x2, y2) 
    };

};

mapTiles._getConnectInfo = function(allNodes, myNode, hisNode){
    let myType = myNode.type;
    let myStart = myNode.startPoint;
    let myEnd = myNode.endPoint;
    let hisType = hisNode.type;
    let hisStart = hisNode.startPoint;
    let hisEnd = hisNode.endPoint;

    // 地表到地表逻辑
    let moveType = "jump";
    let fromInfo = null;
    let toInfo = null;
    if(myType==MapTileType.Tile && hisType==MapTileType.Tile){
        let myY = myStart.y;
        let hisY = hisStart.y;
        if(myStart.x-hisEnd.x > 80 || hisStart.x-myEnd.x > 80){ //  距离太远不能连接
            return null;
        }
        let minX = Math.max(myStart.x, hisStart.x);
        let maxX = Math.min(myEnd.x, hisEnd.x);
        let heightDes = Math.abs(myY - hisY);
        
        // 求出连接范围和连接方式
        if(heightDes<80 && minX > maxX && myStart.x >= hisStart.x){ // 左跳跃方式
            fromInfo = [myStart.x, myY];
            toInfo = [myStart.x-80, hisY];
        }else if(heightDes<80 && minX > maxX && myStart.x < hisStart.x){ // 右跳跃方式
            fromInfo = [myEnd.x, myY];
            toInfo = [myEnd.x+80, hisY]; 
        }else if(heightDes<80 && myY < hisY){ // 上跳跃方式 
            fromInfo = [minX, myY, maxX, myY];
            toInfo = [minX, hisY, maxX, hisY];  
        }else if(myY > hisY){ // 下落方式 (暂时不做中间阻碍过滤 TODO)
            fromInfo = [minX, myY, maxX, myY];
            toInfo = [minX, hisY, maxX, hisY];   
            moveType = "drop";     
        }else{
            moveType = null;
        }

        if(moveType)
            return {moveType:moveType, fromInfo:fromInfo, toInfo:toInfo};
        else
            return null;
    }

    // 地表到绳梯逻辑(只有向上爬，下来都是跳的)
    if(myType==MapTileType.Tile && hisType!=MapTileType.Tile){
        let myY = myStart.y;
        let hisY1 = hisStart.y;
        let hisX = hisStart.x;
        if(hisY1 - myY < 0) return null;    // 在下方 
        if(hisY1 - myY > 80) return null;   // 太高
        if(myStart.x > hisX+10) return null;// 在左边(给10像素误差)
        if(myEnd.x < hisX-10) return null;  // 在右边(给10像素误差)

        // 暂时不考虑绳梯中间跳跃 TODO

        let moveType = "jump";
        fromInfo = [hisX-80, myY, hisX+80, myY];
        toInfo = [hisX, myY+80];

        return {moveType:moveType, fromInfo:fromInfo, toInfo:toInfo};

    }

    // 绳梯到地表逻辑（只有上爬连接点）
    if(myType!=MapTileType.Tile && hisType==MapTileType.Tile){
        let myX = myStart.x;
        let myY = myEnd.y;
        let hisY = hisStart.y;

        if(myX < hisStart.x-10) return null;// 在左边(给10像素误差)
        if(myX > hisEnd.x+10) return null;  // 在右边(给10像素误差)
        if(myY > hisY+10) return null;
        if(myY < hisY-10) return null;
        // 暂时不考虑绳梯中间跳跃 TODO

        let moveType = "stand";
        fromInfo = [myX, hisY];
        toInfo = fromInfo;

        return {moveType:moveType, fromInfo:fromInfo, toInfo:toInfo};
    }

    // 其他
    return null;
};

mapTiles.setMapTile = function(mapTilePrefab){
    let obj = cc.instantiate(mapTilePrefab);
    let nodes = [];
    for(let i=obj.children.length-1; i>=0; i--){
        nodes.push(this._getTypeAndStartEndPoint(obj.children[i]));
    }

    let all = {};
    let tileList = [];
    cc.log("makeMapTile ", nodes);
    for(let i=nodes.length-1; i>=0; i--){
        let myNode = nodes[i];
        let connectInfoList = [];
        for(let j=nodes.length-1; j>=0; j--){
            if(j==i) continue;

            let hisNode = nodes[j];
            let connectInfo = this._getConnectInfo(nodes, myNode, hisNode);
            if(connectInfo){
                connectInfoList.push(connectInfo);
            }
        }
        myNode.connectInfoList = connectInfoList;
        all[myNode.id] = myNode;
        if(myNode.type == MapTileType.Tile){
            tileList.push(myNode);
        }
    }

    this.all = all;
    this.tiles = tileList;
    this.mobIndexDict = {};
    this.mobIndex = 100;
    cc.log("setMapTile ", this.all, this.tiles);
};

mapTiles.getMobIndex = function(mobId){
    if(this.mobIndexDict[mobId])
        return ++this.mobIndexDict[mobId];
    
    this.mobIndex += 100 ; // 同种怪物最多100只
    this.mobIndexDict[mobId] = this.mobIndex;
    return this.mobIndex;
};

// 在所有地表随机一个站立点
mapTiles.randTilePoint = function(){
    let tileList = this.tiles;
    let tileLength = tileList.length;
    let pickTileNth = this.GetRandomNum(0,tileLength-1);
    let pickTile = tileList[pickTileNth];
    let pickX = this.GetRandomNum(pickTile.startPoint.x, pickTile.endPoint.x);
    return {
        id : pickTile.id,
        point : cc.p(pickX, pickTile.startPoint.y),
        minX : pickTile.startPoint.x,
        maxX : pickTile.endPoint.x
    }

};

mapTiles.GetRandomNum = function(Min, Max){
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
};


module.exports = mapTiles;