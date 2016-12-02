/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 类型定义.
 * @end
 ******************************************/

// 地图层类型
const MapRenderObjectType = cc.Enum({
    Back : 1,
    Obj : -1,
    Tile : -1,
    Npc : -1,
    Mob : -1,
    Skill1 : -1,
    Role : -1,
    Skill2 : -1,
    LadderRope : -1,
    
    Front : -1
});

// 平铺方向
const TileMode = cc.Enum({
	None : 0,
	Horizontal : 1,
	Vertical : 2,
	BothTile : 1 | 2,
	ScrollHorizontial : 4,
	ScrollVertical : 8
});

// 地图编辑块类型
const MapTileType = cc.Enum({
    Tile : 1,   // 地表块
    Ladder : 2, // 梯子
    Rope : 3    // 绳子
});



module.exports = {
    MapRenderObjectType,
    TileMode,
    MapTileType
};