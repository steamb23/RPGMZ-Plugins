/*:
 * @target MZ
 * @plugindesc 게임 오브젝트의 기능을 확장합니다.
 * @author 맛난호빵
 */

(()=>{
    'use strict';
    class Game_MapEx extends Game_Map {
        /**
         * 맵 이름을 가져옵니다.
         * @returns 
         */
        mapName() {
            return $dataMapInfos[super.mapId()]?.name;
        }
    }

    Game_Map = Game_MapEx;
})();