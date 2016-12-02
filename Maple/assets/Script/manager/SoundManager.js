/******************************************
 * @author 严利宏 <542430172@qq.com>
 * @copyright Nemo 2016.10.27
 * @doc 音频资源管理.
 * @end
 ******************************************/

var SoundManager = {
	silence : false,
};

//播放背景音乐
SoundManager.playBgMusic = function(file){
	if(!this.silence){
		var musicUrl = "res/Sound/" + file;
		cc.audioEngine.playMusic(musicUrl,true);
	}
};

//按钮点击音乐
SoundManager.playbtnClickMusic = function(){
	if(!this.silence){
		cc.audioEngine.playEffect("res/music/sound_sy_btn_click.mp3",false);
	}
};

//播放受击效果音乐
SoundManager.playHit = function(){
	if(!this.silence){
		// cc.audioEngine.playEffect("",false);
	}
};

//关闭或者打开声音
SoundManager.toggleOnOff = function(){
	if(this.silence){
		this.silence = false;
		cc.audioEngine.setMusicVolume(1);
		cc.audioEngine.setEffectsVolume(1);
	}else{
		this.silence = true;
		cc.audioEngine.setEffectsVolume(0);
		cc.audioEngine.setMusicVolume(0);
	}
};

module.exports = SoundManager;