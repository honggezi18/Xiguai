/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 地图编辑组件.
 * @end
 ******************************************/

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.log("mapEditor");
        let g = this.node.getComponent(cc.Graphics);
        g.lineWidth = 5;
        g.fillColor = cc.hexToColor('#ff0000');
        
        g.rect (0, 0, 100, 100);
        g.close();

        g.stroke();
        g.fill();

        // g.fillColor = cc.hexToColor('#00ff00');

        // g.arc(-10, 10, 100, Math.PI/2, Math.PI, true);
        // g.lineTo(-10, 10);
        // g.close();

        // g.stroke();
        // g.fill();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
