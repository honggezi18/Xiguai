/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.28
 * @doc 怪物AI行为.
 * @end
 ******************************************/

cc.Class({
    extends: cc.Component,

    properties: {
        maxX : 0,
        minX : 0,
    },

    // use this for initialization
    onLoad: function () {
        this.render = this.node.getComponent("mobRender");
        this.mobId = this.render.mobId;

        this.speed = 120;

        this.n = 0;
        this.moveDt = 0;
        this.actionDt = 0;
        this.actionContinue = 0;
        this.nextMoveChangeDir = false;

        if(this.getRandomNum(0,1) > 0.5)
            this.changeAction("move");
        else 
            this.changeAction("stand");

    },

    changeAction : function(action){
        if(this.action == action) return;

        this.action = action;
        this.render.changeAction(action);
        this.actionDt = 0;
        switch(action){
            case "move" :
                this.actionContinue = this.getRandomNum(0.5,2); 
                break;
            case "stand" :
                this.actionContinue = this.getRandomNum(1,2);
                break;
            default : 
                break;
        }
    },

    getRandomNum : function(Min, Max){
        var Range = Max - Min;   
        var Rand = Math.random();   
        return (Min + Rand * Range);   
    },

    changeToNextAction : function(){
        if(this.action == "move") {
            this.changeAction("stand");
            return;
        }
        if(this.action == "stand"){
            this.changeAction("move");
            // 确定方向
            if(this.nextMoveChangeDir == true){
                this.node.scaleX *= -1;
            }else{
                if(this.getRandomNum(0,1)>0.5){
                    this.node.scaleX = 1;
                }else{
                    this.node.scaleX = -1;
                }
            }
            return;
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

        if(this.action == "move"){
            this.nextMoveChangeDir = false;
            let dis = this.speed*(-this.node.scaleX)*dt;
            let newPositionX = this.node.x + dis;
            if(newPositionX < this.minX){
                this.changeToNextAction();
                this.nextMoveChangeDir = true;
                newPositionX = this.minX;
            }
            if(newPositionX > this.maxX){
                this.changeToNextAction();
                this.nextMoveChangeDir = true;
                newPositionX = this.maxX;
            }
            this.node.x = newPositionX;
        }

        if(++this.n%5!=0){
            this.actionDt += dt;
            return;
        }
        this.n = 0;

        if(this.actionDt > this.actionContinue){
            this.changeToNextAction();
            return;
        }

        

        // if(this.action=="walk" && this.actionDt)





    },

});
