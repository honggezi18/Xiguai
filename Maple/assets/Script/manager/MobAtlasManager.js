/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 怪物资源管理.
 * @end
 ******************************************/

var MobAtlasManager = {
	_atlasCache : {},

	//加载plist到spritframe中
	loadAtlasPList : function (imgId, finishCallBack){
		
		let plistPath = "Mob/"+imgId;
		let atlasKey = imgId;

		if(this._atlasCache[atlasKey]){
            if(finishCallBack){
                finishCallBack(this._atlasCache[atlasKey]);
            }
			return;
        }

		let self = this;
        // cc.log("load part began ", (new Date()).getTime(), plistPath, finishCallBack);
		cc.loader.loadRes(plistPath,cc.SpriteAtlas,
            function (err, atlas) {                
				if(err){
					cc.log("load mob res Error", plistPath, err);
					return;
				} 
            	self._atlasCache[atlasKey] = atlas;

                if(finishCallBack){
                    finishCallBack(atlas);
                }
            });

	},

    // 获取资源
	getAtlasFrame : function(atlasKey, path){
		let atlas = this._atlasCache[atlasKey];
		if(!atlas) {
            this.loadAtlasPList(atlasKey);
            return null;
        }

		let sp = atlas.getSpriteFrame(path);
		return sp;

	},
	

	//释放资源
	releaseCaches : function(noReleaseList){
		for(let key in this._atlasCache){
            let atlas = this._atlasCache[key];
            if(noReleaseList.indexOf(key) == -1){
                cc.loader.releaseAsset(atlas);
                delete this._atlasCache[key];
            }
        }
	},

};

module.exports = MobAtlasManager;