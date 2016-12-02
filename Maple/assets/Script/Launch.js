/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 登录.
 * @end
 ******************************************/

const ZipHelp = require("ZipHelper");

cc.Class({
    extends: cc.Component,

    properties: {
        loadstr : cc.Node
        
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this._time = 0;
        this._index = 0;
        this._max = 0;
        this.node.on("load_zip_end", function(event){
            cc.log("load_zip_end",event.detail);
            this._max = event.detail;
        }, this);

        this.node.on("add_zip", function(event){
            let addNum = event.detail;
            this._index+=addNum;
        }, this);
    },

    start : function(){
        cc.log("launch start...");
        let zipHelp = new ZipHelp();
        zipHelp.start(this.node);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // this._time += dt;
        // if(this._time > 0.5){
        //     this.node.emit("add_zip",1);
        //     this._time = 0;
        // }

        let str = `Loading...(${this._index}/${this._max})`;
        this.loadstr.getComponent(cc.Label).string = str;

        if(this._index>0 && this._index >= this._max){
            cc.log("end ============ ", (new Date()).getTime() );
            // setTimeout(function(){
            //     cc.log("change ============ ", (new Date()).getTime() );
                cc.director.loadScene('helloworld');
            // }, 2000);
            
            this.node.active = false;
        }
    },
});
