
/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 精灵对象池.
 * @end
 ******************************************/
//单例
var SpriteNodePool = (function(){
	// cc.log("SpriteNodePool init.");
    //私有构造方法
    function _SpriteNodePool() {
        this.size = 0;
        this.idx = -1;
        this.list = [];
    }

	let unique;
	unique = new _SpriteNodePool();
	return unique;
})();

SpriteNodePool.get = function(){
    if ( this.idx < 0 ) { // 已经用完，新建精灵节点
        let obj = new cc.Node();
        obj.addComponent(cc.Sprite);
        this.list[this.size] = obj;
        ++this.size;
        return obj;
    }
    let obj = this.list[this.idx];
    if ( obj ) {
        obj.active = true;
    }
    --this.idx;
    return obj;
};

SpriteNodePool.put = function(obj){
    ++this.idx;
    obj.active = false;
    obj.cleanup();
    // 返回后精灵设置为初始状态
    obj.anchorX = 0.5;
    obj.anchorY = 0.5;
    obj.scaleX = 1;
    let sprite = obj.getComponent(cc.Sprite);
    sprite.type = cc.Sprite.Type.SIMPLE;
    sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
    // 移除除了cc.Sprite外的所有组件
    for (let i = 0; i < obj._components.length; ++i) {
        let comp = obj._components[i];
        if (comp instanceof cc.Sprite) {
            continue;
        }
        comp.destroy();
    }
    if (obj.parent) {
        obj.removeFromParent();
    }
    this.list[this.idx] = obj;
};


// var SpriteNodePool = cc.Class({
//     name: 'SpriteNodePool',
//     properties: {
//         size: 0
//     },
//     ctor () {
//         this.size = 0;
//         this.idx = -1;
//         this.list = [];
//     },

//     get ()  {
//         if ( this.idx < 0 ) { // 已经用完，新建精灵节点
//             let obj = new cc.Node();
//             obj.addComponent(cc.Sprite);
//             this.list[this.size] = obj;
//             ++this.size;
//             return obj;
//         }
//         let obj = this.list[this.idx];
//         if ( obj ) {
//             obj.active = true;
//         }
//         --this.idx;
//         return obj;
//     },
//     put ( obj ) {
//         ++this.idx;
//         obj.active = false;
//         obj.cleanup();
//         // 返回后精灵设置为初始状态
//         obj.anchorX = 0.5;
//         obj.anchorY = 0.5;
//         obj.scaleX = 1;
//         let sprite = obj.getComponent(cc.Sprite);
//         sprite.type = cc.Sprite.Type.SIMPLE;
//         sprite.sizeMode = cc.Sprite.SizeMode.TRIMMED;
//         // 移除除了cc.Sprite外的所有组件
//         for (let i = 0; i < obj._components.length; ++i) {
//             let comp = obj._components[i];
//             if (comp instanceof cc.Sprite) {
//                 continue;
//             }
//             comp.destroy();
//         }
//         if (obj.parent) {
//             obj.removeFromParent();
//         }
//         this.list[this.idx] = obj;
//     }
// });

module.exports = SpriteNodePool;