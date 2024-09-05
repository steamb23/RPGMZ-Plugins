// MIT License
// 
// Copyright (c) 2024 SteamB23

/*:
 * @target MZ
 * @plugindesc 한글 조합형 한글 입력기
 * @author SteamB23
 * 
 * @help KoreanNameInput.js
 * 
 * 이 플러그인은 RPG Maker MZ 기본 입력기 구현을 확장하여
 * 한글 조합에 의한 두벌식 한글 입력 기능을 제공합니다.
 * 
 * 입력 배열 타입은 현재 두가지가 제공되고 있습니다.
 * - HANGUL1: 조합 가능한 모든 자모음을 배열합니다.
 * - HANGUL2: 기본 자모음을 조합하여 겹자모음을 입력할 수 있는 배열입니다.
 *   (예: ㄱ+ㄱ=ㄲ, ㅏ+ㅣ=ㅐ)
 * 
 * 호환성:
 * - VisuStella MZ - Core Engine: 호환됩니다. 그러나 키보드 입력에 대한
 *   한국어 입력 기능 구현은 되어있지 않습니다.
 * 
 * 단모음 입력 기능은 구현 예정입니다.
 * 
 * @param inputTableType
 * @text 입력 배열 타입
 * @type select
 * @desc 입력 창 배열의 종류를 선택합니다.
 * @default HANGUL1
 * @option HANGUL1
 * @option HANGUL2
 * 
 * @param shortVowelInput
 * @text 단모음 입력
 * @type boolean
 * @desc 단모음 입력 지원 여부를 설정합니다.
 * @default false
 * @on 단모음 입력
 * @off 일반 입력
 */

(() => {
    "use strict";

    const pluginName = "KoreanNameInput";

    const params = PluginManager.parameters(pluginName);
    const inputTableType = String(params["inputTableType"]);
    const shortVowelInput = Boolean(params["shortVowelInput"]);
    
    /**
     * 한글 입력 조합 클래스
     */
    class HangulInputProcessor {
        static HANGUL_CHOSEONG_CODE = {
            "ㄱ": 0, "ㄲ": 1, "ㄴ": 2, "ㄷ": 3, "ㄸ": 4, "ㄹ": 5, "ㅁ": 6, "ㅂ": 7, "ㅃ": 8, 
            "ㅅ": 9, "ㅆ": 10, "ㅇ": 11, "ㅈ": 12, "ㅉ": 13, "ㅊ": 14, "ㅋ": 15, "ㅌ": 16, 
            "ㅍ": 17, "ㅎ": 18
        };
        static HANGUL_JUNGSEONG_CODE = {
            "ㅏ": 0, "ㅐ": 1, "ㅑ": 2, "ㅒ": 3, "ㅓ": 4, "ㅔ": 5, "ㅕ": 6, "ㅖ": 7, "ㅗ": 8, 
            "ㅘ": 9, "ㅙ": 10, "ㅚ": 11, "ㅛ": 12, "ㅜ": 13, "ㅝ": 14, "ㅞ": 15, "ㅟ": 16, 
            "ㅠ": 17, "ㅡ": 18, "ㅢ": 19, "ㅣ": 20
        };
        static HANGUL_JONGSEONG_CODE = {
            "": 0, "ㄱ": 1, "ㄲ": 2, "ㄳ": 3, "ㄴ": 4, "ㄵ": 5, "ㄶ": 6, "ㄷ": 7, "ㄹ": 8, 
            "ㄺ": 9, "ㄻ": 10, "ㄼ": 11, "ㄽ": 12, "ㄾ": 13, "ㄿ": 14, "ㅀ": 15, "ㅁ": 16, 
            "ㅂ": 17, "ㅄ": 18, "ㅅ": 19, "ㅆ": 20, "ㅇ": 21, "ㅈ": 22, "ㅊ": 23, "ㅋ": 24, 
            "ㅌ": 25, "ㅍ": 26, "ㅎ": 27
        };
        // 겹자음 패턴
        static HANGUL_DOUBLE_CHOSEONG_PATTERN = {
            "ㄱㄱ": "ㄲ",
            "ㄷㄷ": "ㄸ",
            "ㅂㅂ": "ㅃ",
            "ㅅㅅ": "ㅆ",
            "ㅈㅈ": "ㅉ"
        };

        // 겹모음 패턴
        static HANGUL_DOUBLE_JUNGSEONG_PATTERN = {
            "ㅏㅣ": "ㅐ",
            "ㅑㅣ": "ㅒ",
            "ㅓㅣ": "ㅔ",
            "ㅕㅣ": "ㅖ",
            "ㅗㅏ": "ㅘ",
            "ㅗㅐ": "ㅙ",
            "ㅗㅣ": "ㅚ",
            "ㅜㅓ": "ㅝ",
            "ㅜㅔ": "ㅞ",
            "ㅜㅣ": "ㅟ",
            "ㅡㅣ": "ㅢ"
        }

        // 단모음 패턴
        static HANGUL_SHORT_VOWEL_PATTERN = {
            "ㅏㅏ": "ㅑ",
            "ㅐㅐ": "ㅒ",
            "ㅓㅓ": "ㅕ",
            "ㅔㅔ": "ㅖ",
            "ㅗㅗ": "ㅛ",
            "ㅜㅜ": "ㅠ"
        }

        // 겹받침 패턴
        static HANGUL_DOUBLE_JONGSEONG_PATTERN = {
            "ㄱㅅ": "ㄳ",
            "ㄴㅈ": "ㄵ",
            "ㄴㅎ": "ㄶ",
            "ㄹㄱ": "ㄺ",
            "ㄹㅁ": "ㄻ",
            "ㄹㅂ": "ㄼ",
            "ㄹㅅ": "ㄽ",
            "ㄹㅌ": "ㄾ",
            "ㄹㅍ": "ㄿ",
            "ㄹㅎ": "ㅀ",
            "ㅂㅅ": "ㅄ"
        }

        static getChoseongCode(character) {
            return HangulInputProcessor.HANGUL_CHOSEONG_CODE[character] ?? -1;
        }

        static getJungseongCode(character) {
            return HangulInputProcessor.HANGUL_JUNGSEONG_CODE[character] ?? -1;
        }

        static getJongseongCode(character) {
            return HangulInputProcessor.HANGUL_JONGSEONG_CODE[character] ?? 0;
        }

        static isChoseong(character) {
            return HangulInputProcessor.HANGUL_CHOSEONG_CODE[character] != null;
        }

        static isJungseong(character) {
            return HangulInputProcessor.HANGUL_JUNGSEONG_CODE[character] != null;
        }

        static isJongseong(character) {
            return HangulInputProcessor.HANGUL_JONGSEONG_CODE[character] != null;
        }

        static getDoubleChoseong(characters) {
            return HangulInputProcessor.HANGUL_DOUBLE_CHOSEONG_PATTERN[characters] ?? HangulInputProcessor.HANGUL_DOUBLE_JONGSEONG_PATTERN[characters];
        }
        
        static getDoubleJungseong(characters) {
            return HangulInputProcessor.HANGUL_DOUBLE_JUNGSEONG_PATTERN[characters];
        }

        static getDoubleJongseong(characters) {
            return HangulInputProcessor.getDoubleChoseong(characters);
        }

        static isDoubleChoseong(character) {
            return HangulInputProcessor.getDoubleChoseong(character) != null;
        }

        static isDoubleJungseong(character) {
            return HangulInputProcessor.getDoubleJungseong(character) != null;
        }

        static isDoubleJongseong(character) {
            return HangulInputProcessor.isDoubleChoseong(character);
        }

        static get isShortVowelInput() {
            return shortVowelInput;
        }
        hangul = "";
        
        // 0: 초성
        // 1: 중성
        // 2: 종성
        // 3: 겹받침
        charBuffer = [];
        codeBuffer = [];

        setEditWindow(editWindow) {
            this._editWindow = editWindow;
        }

        addCharacter(character) {
            return this.hangul = this.processCharacter(character);
        }

        processCharacter(character) {
            let temp;
            // 내부에서 사용할 함수 정의
            const push = (type, character, code = null) => {
                this.charBuffer.push(character);
                this.codeBuffer.push(code ?? [
                    HangulInputProcessor.getChoseongCode,
                    HangulInputProcessor.getJungseongCode,
                    HangulInputProcessor.getJongseongCode][type](character));
            };

            const pop = () => {
                this.codeBuffer.pop();
                return this.charBuffer.pop();
            }

            const reset = () => this.reset();

            const editBack = () => this._editWindow.back();

            const editAdd = (character) => this._editWindow.add(character);

            const combine = (choseongCode, jungseongCode, jongseongCode) => HangulInputProcessor.combine(choseongCode, jungseongCode, jongseongCode);

            // 로직 구현부

            if (this.charBuffer.length == 0) {
                // 초성 처리
                if (HangulInputProcessor.isChoseong(character)) {
                    push(0, character);
                }
                // 초성이 아니더라도 출력
                return character;
            }
            if (this.charBuffer.length == 1) {
                // 모음일 경우 자음+모음 처리
                if (HangulInputProcessor.isJungseong(character)) {
                    push(1, character);
                    editBack();
                    return combine(this.codeBuffer[0], this.codeBuffer[1], 0);
                }
                // 초성일 경우 겹자음 처리
                if (HangulInputProcessor.isChoseong(character)) {
                    if (temp = HangulInputProcessor.getDoubleChoseong(pop() + character)) {
                        push(0, temp);
                        return temp;
                    }
                    // 겹자음 처리에 실패했을 경우 분기 최종 처리에 의존
                }
            }
            if (this.charBuffer.length == 2) {
                // 자음일 경우 자음+모음+받침 처리
                if (HangulInputProcessor.isJongseong(character)) {
                    push(2, character);
                    editBack();
                    return combine(this.codeBuffer[0], this.codeBuffer[1], this.codeBuffer[2]);
                }
                // 모음일 경우 자음+겹모음 처리
                if (HangulInputProcessor.isJungseong(character)) {
                    if (temp = HangulInputProcessor.getDoubleJungseong(pop() + character)) {
                        push(1, temp);
                        editBack();
                        return combine(this.codeBuffer[0], this.codeBuffer[1], 0);
                    }
                }
            }
            if (this.charBuffer.length == 3) {
                // 모음일 경우 도깨비불 처리
                if (HangulInputProcessor.isJungseong(character)) {
                    editBack();
                    editAdd(combine(this.codeBuffer[0], this.codeBuffer[1], 0));
                    // 마지막 받침을 초성으로
                    const choseong = this.charBuffer[2];
                    reset();
                    // 초성으로 변환할 수 없는 경우는 여기서 처리하지 않아도 됨
                    push(0, choseong);
                    push(1, character);
                    return combine(this.codeBuffer[0], this.codeBuffer[1], 0);
                }
                // 자음일 경우 자음+모음+겹받침 처리
                if (HangulInputProcessor.isJongseong(character)) {
                    // pop 대신 받침 자리를 온전히 가져옴
                    if (temp = HangulInputProcessor.getDoubleJongseong(this.charBuffer[2] + character)) {
                        // 도깨비불 처리를 위해 문자는 원래값으로, 코드값은 겹받침값으로 함
                        push(2, character, HangulInputProcessor.getJongseongCode(temp));
                        editBack();
                        return combine(this.codeBuffer[0], this.codeBuffer[1], this.codeBuffer[3]);
                    }
                }
            }
            if (this.charBuffer.length == 4) {
                // 모음일 경우 도깨비불 처리
                if (HangulInputProcessor.isJungseong(character)) {
                    // 마지막 받침을 초성으로
                    const choseong = this.charBuffer[3];
                    // 여기서는 초성으로 변환되지 않는 경우가 발생할 수 있음
                    if (HangulInputProcessor.isChoseong(choseong)) {
                        editBack();
                        editAdd(combine(this.codeBuffer[0], this.codeBuffer[1], this.codeBuffer[2]));
                        reset();
                        push(0, choseong);
                        push(1, character);
                        return combine(this.codeBuffer[0], this.codeBuffer[1], 0);
                    }
                }
            }
            // 해당 없을 경우 버퍼 비우고 출력
            reset();
            if (HangulInputProcessor.isChoseong(character)) {
                push(0, character);
            }
            return character;
        }

        cancel() {
            const recombine = () => {
                if (this.codeBuffer.length == 3) {
                    return HangulInputProcessor.combine(this.codeBuffer[0], this.codeBuffer[1], this.codeBuffer[2]);
                } else if (this.codeBuffer.length == 2) {
                    return HangulInputProcessor.combine(this.codeBuffer[0], this.codeBuffer[1], 0);
                } else if (this.codeBuffer.length == 1) {
                    return this.charBuffer[0];
                }
                return null;
            }

            if (this.charBuffer.length > 0) {
                this.charBuffer.length--;
                this.codeBuffer.length--;
                this.hangul = recombine();
                if (this.hangul != null)
                    this._editWindow.add(this.hangul);
            }
        }

        getHangul() {
            return this.hangul;
        }

        reset() {
            this.hangul = "";
            this.bufferReset();
        }

        bufferReset() {
            this.charBuffer = [];
            this.codeBuffer = [];
        }

        static combine(choseongCode, jungseongCode, jongseongCode) {
            // 오류 처리
            if (choseongCode == -1 || jungseongCode == -1) {
                return null;
            }
            return String.fromCharCode(((choseongCode * 21) + jungseongCode) * 28 + jongseongCode + 0xac00);
        }
    }

    /**
     * 한국어의 경우 fullWidth를 지원하도록
     */
    class Window_NameEditEx extends Window_NameEdit {
        charWidth() {
            const text = $gameSystem.isJapanese() || $gameSystem.isKorean ? "\uff21" : "A";
            return this.textWidth(text);
        }
    }

    class Window_NameInputEx extends Window_NameInput {

        static HANGUL1 = 
              [ "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ",  "ㅏ","ㅐ","ㅑ","ㅒ","ㅓ",
                "ㄹ","ㅁ","ㅂ","ㅃ","ㅅ",  "ㅔ","ㅕ","ㅖ","ㅗ","ㅘ",
                "ㅆ","ㅇ","ㅈ","ㅉ","ㅊ",  "ㅙ","ㅚ","ㅛ","ㅜ","ㅝ",
                "ㅋ","ㅌ","ㅍ","ㅎ","ㄳ",  "ㅞ","ㅟ","ㅠ","ㅡ","ㅢ",
                "ㄵ","ㄵ","ㄶ","ㄺ","ㄻ",  "ㅣ"," " ," " ," " ," " ,
                "ㅄ","[" ,"]" ,"^" ,"_" ,  " " ,"{" ,"}" ,"|" ,"~" ,
                "0" ,"1" ,"2" ,"3" ,"4" ,  "!" ,"#" ,"$" ,"%" ,"&" ,
                "5" ,"6" ,"7" ,"8" ,"9" ,  "(" ,")" ,"*" ,"+" ,"-" ,
                "/" ,"=" ,"@" ,"<" ,">" ,  ":" ,";" ," " ,"영어" ,"확인"];

        static HANGUL2 = 
              [ "ㄱ","ㄴ","ㄷ","ㄹ","ㅁ",  "ㅏ","ㅑ","ㅓ","ㅕ","ㅗ",
                "ㅂ","ㅅ","ㅇ","ㅈ","ㅊ",  "ㅛ","ㅜ","ㅠ","ㅡ","ㅣ",
                "ㅋ","ㅌ","ㅍ","ㅎ"," " ,  " " ," " ," " ," " ," " ,
                " " ," " ," " ," " ," " ,  " " ," " ," " ," " ," " ,
                " " ," " ," " ," " ," " ,  " " ," " ," " ," " ," " ,
                " " ,"[" ,"]" ,"^" ,"_" ,  " " ,"{" ,"}" ,"|" ,"~" ,
                "0" ,"1" ,"2" ,"3" ,"4" ,  "!" ,"#" ,"$" ,"%" ,"&" ,
                "5" ,"6" ,"7" ,"8" ,"9" ,  "(" ,")" ,"*" ,"+" ,"-" ,
                "/" ,"=" ,"@" ,"<" ,">" ,  ":" ,";" ," " ,"영어" ,"확인"];

        static HANGUL0 = // 미완성
              [ "ㄱ","ㄴ","ㅁ","ㅅ","ㅇ",  "ㅏ","ㅓ","ㅗ","ㅜ","ㅡ",
                "ㄲ","ㄷ","ㅂ","ㅆ","ㅎ",  "ㅑ","ㅕ","ㅛ","ㅠ","ㅣ",
                "ㅋ","ㄸ","ㅃ","ㅈ"," " ,  "ㅐ","ㅔ","ㅘ","ㅝ","ㅢ",
                " " ,"ㅌ","ㅍ","ㅊ","Ｔ",  "ㅒ","ㅖ","ㅙ","ㅞ"," " ,
                " " ,"ㄹ","ㅊ"," " ," " ,  " " ,"ㅚ","ㅟ"," " ," " ,
                " " ," " ," " ," " ," " ,  " " ," " ," " ," " ," " ,
                " " ," " ," " ," " ," " ,  " " ," " ," " ," " ," " ,
                " " ," " ," " ," " ," " ,  " " ," " ," " ," " ," " ,
                " " ," " ," " ," " ," " ,  " " ," " ," " ,"영어" ,"확인"];
        static LATIN1 =
              [ "A","B","C","D","E",  "a","b","c","d","e",
                "F","G","H","I","J",  "f","g","h","i","j",
                "K","L","M","N","O",  "k","l","m","n","o",
                "P","Q","R","S","T",  "p","q","r","s","t",
                "U","V","W","X","Y",  "u","v","w","x","y",
                "Z","[","]","^","_",  "z","{","}","|","~",
                "0","1","2","3","4",  "!","#","$","%","&",
                "5","6","7","8","9",  "(",")","*","+","-",
                "/","=","@","<",">",  ":",";"," ","한글","확인" ];

        initialize() {
            super.initialize(...arguments);

            this._hangulProcessor = new HangulInputProcessor();
        }
        
        setEditWindow(editWindow) {
            super.setEditWindow(editWindow);
            this._hangulProcessor.setEditWindow(editWindow);
        }

        table() {
            if ($gameSystem.isKorean()) {
                switch (inputTableType) {
                    default: 
                        return [
                            Window_NameInputEx.HANGUL1,
                            Window_NameInputEx.LATIN1
                        ];
                    case "HANGUL2":
                        return [
                            Window_NameInputEx.HANGUL2,
                            Window_NameInputEx.LATIN1
                        ];
                }
            } else {
                return super.table();
            }
        }

        // Ok 입력의 처리
        processOk() {
            // 한글 입력 모드일 경우 한글 문자를 처리한 후 _hangul 변수에 저장
            if (this.isHangulMode()){
                const character = super.character();
                if (character)
                    this._hangulProcessor.addCharacter(character);
            }
            super.processOk();
        }

        processBack() {
            if (this._editWindow.back()) {
                this._hangulProcessor.cancel();
                SoundManager.playCancel();
            }
        }

        character() {
            // 한글 입력 모드일 경우 저장된 한글 문자를 반환하고 그 외에는 기본 구현 사용
            if (this.isHangulMode())
                return this._hangulProcessor.getHangul();
            return super.character();
        }

        isHangulMode() {
            return $gameSystem.isKorean() && this._page == 0 && !this.isPageChange() && !this.isOk();
        }

        refresh() {
            super.refresh();

            this._hangulProcessor.reset();
        }
    }

    Window_NameEdit = Window_NameEditEx;
    Window_NameInput = Window_NameInputEx;
})();