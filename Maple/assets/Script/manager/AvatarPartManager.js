/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 纸娃娃资源管理.
 * @end
 ******************************************/

const Gear = require('Gear');
const GearType = Gear.GearType;

var AvatarPartManager = {
	_addPartCache : {},
    _defaultPartImgIdList : ["00002000","00012000","00020000","00030136","01040036","01060026","01000023","01032013","01022014","01012028","01102068", "01080003","01070001","01432124"],
    _myPartImgIdList : [],

    getMyAvartarPartList : function(){
        return this._myPartImgIdList;
    },


	//根据纸娃娃部位加载plist到spritframe中
	loadAvatarPartPList : function (imgId, finishCallBack){
		
		let gearType = Gear.GetGearType(imgId);
		let plistPath = "Avatar/";
		let atlasKey = imgId;
		switch(gearType){
            case GearType.body: plistPath += "Body/"+imgId; break;
            case GearType.head: plistPath += "Head";atlasKey="00Head"; break;
            case GearType.face: plistPath += "Face/"+imgId; break;
            case GearType.hair:
            case GearType.hair2: plistPath += "Hair";atlasKey="00Hair"; break;
            case GearType.cap: plistPath += "Cap";atlasKey="00Cap"; break;
            case GearType.coat: plistPath += "Coat/"+imgId; break;
            case GearType.longcoat: plistPath += "Longcoat/"+imgId; break;
            case GearType.pants: plistPath += "Pants/"+imgId; break;
            case GearType.shoes: plistPath += "Shoes/"+imgId; break;
            case GearType.glove: plistPath += "Glove/"+imgId; break;
            case GearType.shield:
            case GearType.demonShield:
            case GearType.soulShield:
            case GearType.katara: plistPath += "Subweapon/"+imgId; break;
            case GearType.cape: plistPath += "Cape/"+imgId; break;
            case GearType.shovel:
            case GearType.pickaxe:
            case GearType.cashWeapon: plistPath += "Weapon/"+imgId; break;
            case GearType.earrings: plistPath += "Earrings";atlasKey="00Earrings"; break;
            case GearType.faceAccessory: plistPath += "FaceAccessory";atlasKey="00FaceAccessory"; break;
            case GearType.eyeAccessory: plistPath += "EyeAccessory";atlasKey="00EyeAccessory"; break;
            default:
                if (Gear.IsWeapon(gearType))
                {
                    plistPath += "Weapon/"+imgId;
                }
                break;
        }

		if(this._addPartCache[atlasKey]){
            if(finishCallBack){
                finishCallBack(this._addPartCache[atlasKey]);
                // emitNode.emit('add_item', {
                //     err : null,
                //     type : 3
                // })
            }
			return;
        }

		let self = this;
        // cc.log("load part began ", (new Date()).getTime(), plistPath, finishCallBack);
		cc.loader.loadRes(plistPath,cc.SpriteAtlas,
            function (err, atlas) {                
				if(err){
					cc.log("load avatar res Error", plistPath, err);
					return;
				} 
            	self._addPartCache[atlasKey] = atlas;

                if(finishCallBack){
                    finishCallBack(atlas);
                    // cc.log("load part end ", (new Date()).getTime(), plistPath );
                    // emitNode.emit('add_item', {
                    //     err : err,
                    //     type : 3
                    // })
                }
                
            });

	},

    // 获取纸娃娃资源
	getAtlasFrame : function(atlasKey, path){
		let atlas = this._addPartCache[atlasKey];
		if(!atlas) return null;

		let sp = atlas.getSpriteFrame(path);
		return sp;

	},
	

	//释放资源
	releaseCaches : function(){
        // 默认不释放的资源
        let noReleaseList = ["00Head","00Hair","00Cap","00Earrings","00FaceAccessory","00EyeAccessory"];
        // 本人用到的纸娃娃暂时不释放
        for(let i=0; i<this._myPartImgIdList.length; i++){
            noReleaseList.push(this._myPartImgIdList[i]);
        }
        // 释放其他资源
		for(let key in this._addPartCache){
            let atlas = this._addPartCache[key];
            if(noReleaseList.indexOf(key) == -1){
                cc.loader.releaseAsset(atlas);
                delete this._addPartCache[key];
            }
        }
	},

};

module.exports = AvatarPartManager;