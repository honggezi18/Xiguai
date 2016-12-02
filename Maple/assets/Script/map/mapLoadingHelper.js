/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 地图加载组件.
 * @end
 ******************************************/

cc.Class({
    extends: cc.Component,

    properties: {
        loadFrameNum : 0,
        loadAtlasNum : 0,
        loadFrameIndex : 0,
        loadAtlasIndex : 0,

        initMapIndex : 0,
        initMapLength : 0
    },

    // use this for initialization
    onLoad: function () {
        this.label = this.node.getComponent(cc.Label);

    },

    init : function(){
        // cc.log("mapLoadingHelper init");
        this.loadFrameNum = 1;
        this.loadAtlasNum = 1;
        this.loadFrameIndex = 0;
        this.loadAtlasIndex = 0;

        this.initMapIndex = 0;
        this.initMapLength = 1;

        this.node.parent.stopAllActions();
        this.node.parent.opacity = 255;
        this.node.stopAllActions();
        this.node.opacity = 255;
        this.label.string = "初始化中……";
    },

    initResNum : function(frameNum, atlasNum){
        // cc.log("mapLoadingHelper initResNum ", frameNum, atlasNum);
        this.loadFrameNum = frameNum;
        this.loadAtlasNum = atlasNum;
        this.updateInfo1();
    },

    addResNum : function(addFrame, addAtlas){
        this.loadFrameIndex += addFrame;
        this.loadAtlasIndex += addAtlas;

        this.updateInfo1();
    },

    updateInfo1 : function(){
        let num = this.loadFrameIndex + this.loadAtlasIndex;
        let max = this.loadFrameNum + this.loadAtlasNum;
        let per = Math.floor((num/max)*100);
        // cc.log("mapLoadingHelper updateInfo1 ", num, max);
        if(max == 0)
            this.label.string = "加载资源:完成！";
        else
            this.label.string = `加载资源:${num}/${max}(${per}%)`;
    },

    initMapObjNum : function(mapObjNum){
        // cc.log("mapLoadingHelper initMapObjNum ", mapObjNum, this.initMapIndex);
        this.initMapLength = mapObjNum;
        this.updateInfo2();
    },

    addMapObjNum : function(addMapObjNum){
        this.initMapIndex += addMapObjNum;
        this.updateInfo2();
    },

    updateInfo2 : function(){
        
        let num = this.initMapIndex;
        let max = this.initMapLength;
        let per = Math.floor((num/max)*100);
        // cc.log("mapLoadingHelper updateInfo2 ", num, max);
        this.label.string = `加载地图:${num}/${max}(${per}%)`;

        if(num >= max){
            // cc.log("mapLoadingHelper load finished!!! ");
            // 加载完成
            let action1 = cc.fadeOut(1.0);
            let action2 = cc.fadeTo(0.3, 0);
            // var action = cc.scaleTo(0.2, 1, 0.6);
            this.node.parent.runAction(action1);
            this.node.runAction(action2);
        }
    },




    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // this.node
    },
});
