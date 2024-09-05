// MIT License
// 
// Copyright (c) 2024 SteamB23

/*:
 * @target MZ
 * @plugindesc 커스텀 흔들기 효과
 * @author SteamB23
 * 
 * @help CustomShake.js
 * 
 * 커스텀 가능한 흔들기 효과를 제공합니다.
 * 
 * 호환성:
 * - VisuStella MZ - Core Engine: 호환됩니다. 단, 해당 플러그인의 설정에서
 *   Screen Shake Setting > Default Style을 Original로 설정하지 않으면
 *   오동작할 가능성이 있습니다.
 * 
 * @command screenShake
 * @text 화면 흔들기
 * 
 * @arg power
 * @text 강도
 * @type number
 * @default 5.000
 * @decimals 3
 * @desc 화면이 흔들리는 강도를 설정합니다.
 * 
 * @arg speed
 * @text 속도
 * @type number
 * @default 5.000
 * @decimals 3
 * @desc 화면이 흔들리는 속도를 설정합니다.
 * 
 * @arg duration
 * @text 지속 시간
 * @type number
 * @default 60
 * @desc 화면이 흔들리는 지속시간을 설정합니다.
 * 
 * @arg isWait
 * @text 대기
 * @type boolean
 * @default true
 * @desc 흔들리는동안 대기 여부를 설정합니다.
 * @on 적용
 * @off 적용 안함
 * 
 * @arg dampingDuration
 * @text 감쇄 지속 시간
 * @type number
 * @default 30
 * @desc 지속 시간이 끝나기전 감쇄를 지속하는 시간을 설정합니다.
 * @on 적용
 * @off 적용 안함
 * 
 * @arg easeFunction
 * @text 감쇄 함수
 * @type select
 * @option easeOutSine
 * @option easeOutCubic
 * @option easeOutQuint
 * @option linear
 * @default easeOutSine
 * @desc 감쇄 처리에 사용되는 감쇄 함수를 설정합니다.
 * @on 적용
 * @off 적용 안함
 * 
 * @arg directionX
 * @text 방향 X
 * @type number
 * @decimals 3
 * @min -1
 * @max 1
 * @default 1.000
 * @desc 화면이 흔들리는 방향을 설정합니다.
 * 
 * @arg directionY
 * @text 방향 Y
 * @type number
 * @decimals 3
 * @min -1
 * @max 1
 * @default 0.000
 * @desc 화면이 흔들리는 방향을 설정합니다.
 */
(() => {
    "use strict";

    const pluginName = "CustomShake";

    PluginManager.registerCommand(pluginName, "screenShake", function (args) {
        const power = Number(args["power"]);
        const speed = Number(args["speed"]);
        const duration = Number(args["duration"]);
        const isWait = (args["isWait"] === "true");

        const dampingDuration = Number(args["dampingDuration"]);
        const directionX = Number(args["directionX"]);
        const directionY = Number(args["directionY"]);
        const easeFunction = (() => {
            switch (String(args["easeFunction"])) {
                default: return Game_ScreenEx.easeOutSine;
                case "easeOutCubic": return Game_ScreenEx.easeOutCubic;
                case "easeOutQuint": return Game_ScreenEx.easeOutQuint;
                case "linear": return Game_ScreenEx.linear;
            }
        })();
        $gameScreen.startShake(power, speed, duration, dampingDuration, easeFunction, directionX, directionY);
        if (isWait) {
            this.wait(args["duration"]);
        }
    });

    class Game_ScreenEx extends Game_Screen {
        static easeOutSine(x) {
            return Math.sin((x * Math.PI) / 2);
        }

        static easeOutCubic(x) {
            return 1 - Math.pow(1 - x, 3);
        }

        static easeOutQuint(x) {
            return 1 - Math.pow(1 - x, 5);
        }

        static linear(x) {
            return x;
        }

        shakeX() {
            return this._shakeX;
        }

        shakeY() {
            return this._shakeY;
        }

        startShake(power, speed, duration, dampingDuration = 30, ease = Game_ScreenEx.easeOutSine, directionX = 1, directionY = 0) {
            this._dampingDuration = dampingDuration;
            this._shakeTotalDuration = duration;
            this._ease = ease;

            const length = Math.sqrt(directionX * directionX + directionY * directionY);

            // 벡터의 길이가 0이 아닌 경우에만 정규화 수행
            if (length !== 0) {
                this._directionX = directionX / length;
                this._directionY = directionY / length;
            } else {
                // 벡터의 길이가 0인 경우, 기본값 설정
                this._directionX = 1;
                this._directionY = 0;
            }
            super.startShake(power, speed, duration);
        }
        
        clearShake() {
            super.clearShake();
            this._shakeX = 0;
            this._shakeY = 0;
        }

        updateShake() {
            if (this._shakeDuration > 0) {
                let deltaTime = this._shakeDuration / 60.0;
                if (isNaN(deltaTime))
                    deltaTime = 0;
                let shake = Math.sin(deltaTime * this._shakeSpeed * (Math.PI)) * this._shakePower * 2;
        
                // 시간에 따른 감쇠 적용
                if (this._shakeDuration < this._dampingDuration) {
                    const damping = this._ease(this._shakeDuration / this._dampingDuration);
                    shake *= damping;
                }

                this._shakeX = shake * this._directionX;
                this._shakeY = shake * this._directionY;
                this._shakeDuration--;
            } else if (this._shakeX != 0 || this._shakeY != 0 ) {
                this._shakeX = 0;
                this._shakeY = 0;
            }
        }
    };
    

    // Spriteset_Base는 상속받아 사용하는 클래스이기 때문에 prototype으로 대체
    
    // class Spriteset_BaseEx extends Spriteset_Base {
    //     updatePosition() {
    //         super.updatePosition();
    //         const screen = $gameScreen;
            
    //         this.x += Math.round(screen.shakeX());
    //         this.y += Math.round(screen.shakeY());
    //     }
    // }

    // 함수 백업
    const Spriteset_Base_updatePosition = Spriteset_Base.prototype.updatePosition;

    Spriteset_Base.prototype.updatePosition = function() {
        Spriteset_Base_updatePosition.call(this);
        const screen = $gameScreen;
            
        this.x += Math.round(screen.shakeX());
        this.y += Math.round(screen.shakeY());
    }
    

    Game_Screen = Game_ScreenEx;
    // Spriteset_Base = Spriteset_BaseEx;
})();