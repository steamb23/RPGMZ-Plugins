/*:
 * @target MZ
 * @plugindesc Window_NameInput의 기능을 확장하여 한국어 입력을 지원합니다.
 * @author 맛난호빵
 */

(()=>{
    'use strict';
    /**
     * 한글 입력 조합 클래스
     */
    class HangulInputProcessor {
        constructor(){
            this.reset();
        }

        static HANGUL_CHOSEONG_CODE = {
            'ㄱ': 0, 'ㄲ': 1, 'ㄴ': 2, 'ㄷ': 3, 'ㄸ': 4, 'ㄹ': 5, 'ㅁ': 6, 'ㅂ': 7, 'ㅃ': 8, 
            'ㅅ': 9, 'ㅆ': 10, 'ㅇ': 11, 'ㅈ': 12, 'ㅉ': 13, 'ㅊ': 14, 'ㅋ': 15, 'ㅌ': 16, 
            'ㅍ': 17, 'ㅎ': 18
        };
        static HANGUL_JUNGSEONG_CODE = {
            'ㅏ': 0, 'ㅐ': 1, 'ㅑ': 2, 'ㅒ': 3, 'ㅓ': 4, 'ㅔ': 5, 'ㅕ': 6, 'ㅖ': 7, 'ㅗ': 8, 
            'ㅘ': 9, 'ㅙ': 10, 'ㅚ': 11, 'ㅛ': 12, 'ㅜ': 13, 'ㅝ': 14, 'ㅞ': 15, 'ㅟ': 16, 
            'ㅠ': 17, 'ㅡ': 18, 'ㅢ': 19, 'ㅣ': 20
        };
        static HANGUL_JONGSEONG_CODE = {
            '': 0, 'ㄱ': 1, 'ㄲ': 2, 'ㄳ': 3, 'ㄴ': 4, 'ㄵ': 5, 'ㄶ': 6, 'ㄷ': 7, 'ㄹ': 8, 
            'ㄺ': 9, 'ㄻ': 10, 'ㄼ': 11, 'ㄽ': 12, 'ㄾ': 13, 'ㄿ': 14, 'ㅀ': 15, 'ㅁ': 16, 
            'ㅂ': 17, 'ㅄ': 18, 'ㅅ': 19, 'ㅆ': 20, 'ㅇ': 21, 'ㅈ': 22, 'ㅊ': 23, 'ㅋ': 24, 
            'ㅌ': 25, 'ㅍ': 26, 'ㅎ': 27
        };
        // 겹자음 패턴
        static HANGUL_DOUBLE_CHOSEONG_PATTERN = {
            'ㄱㄱ':'ㄲ',
            'ㄷㄷ':'ㄸ',
            'ㅂㅂ':'ㅃ',
            'ㅅㅅ':'ㅆ',
            'ㅈㅈ':'ㅉ'
        };

        // 겹받침 패턴
        static HANGUL_DOUBLE_JONGSEONG_PATTERN = {
            'ㄱㅅ':'ㄳ',
            'ㄴㅈ':'ㄵ',
            'ㄴㅎ':'ㄶ',
            'ㄹㄱ':'ㄺ',
            'ㄹㅁ':'ㄻ',
            'ㄹㅂ':'ㄼ',
            'ㄹㅅ':'ㄽ',
            'ㄹㅌ':'ㄾ',
            'ㄹㅍ':'ㄿ',
            'ㄹㅎ':'ㅀ',
            'ㅂㅅ':'ㅄ'
        }

        getDoubleChoseong(characters) {
            return HangulInputProcessor.HANGUL_DOUBLE_CHOSEONG_PATTERN[characters] ?? HangulInputProcessor.HANGUL_DOUBLE_JONGSEONG_PATTERN[characters];
        }

        getDoubleJongseong(characters) {
            return HangulInputProcessor.HANGUL_DOUBLE_JONGSEONG_PATTERN[characters];
        }

        getChoseongCode(character) {
            return HangulInputProcessor.HANGUL_CHOSEONG_CODE[character] ?? -1;
        }

        getJungseongCode(character) {
            return HangulInputProcessor.HANGUL_JUNGSEONG_CODE[character] ?? -1;
        }

        getJongseongCode(character) {
            return HangulInputProcessor.HANGUL_JONGSEONG_CODE[character] ?? 0;
        }

        inputBack(){
            this._editWindow.back();
        }

        inputAdd(character) {
            this._editWindow.add(character);
        }

        setEditWindow(editWindow) {
            this._editWindow = editWindow;
        }

        getHangul() {
            return this._hangul;
        }

        addCharacter(character) {
            // 초성이 아직 저장되어 있지 않은 경우
            if (this._choseongCode == -1) {
                this._choseongCode = this.getChoseongCode(character);
                if (this._choseongCode != -1)
                    this._choseongChar = character;

                this._hangul = character;
                return this.hangul;
            }

            // 중성이 아직 저장되어 있지 않은 경우
            if (this._jungseongCode == -1) {
            
                // // 초성이 저장되었지만 초성이 재 입력된 경우 겹자음이면 입력처리
                // const doubleChoseong = this.getDoubleChoseong(this._choseongChar + character)
                // if (doubleChoseong != null) {
                //     this._choseongCode = this.getChoseongCode(doubleChoseong);
                //     if (this._choseongCode != -1)
                //         this._choseongChar = doubleChoseong;
    
                //     this._hangul = doubleChoseong;
                //     this.inputBack();
                //     return this.hangul;
                // }
                
                if ((this._jungseongCode = this.getJungseongCode(character)) != -1){
                    this._hangul = this.combineCode();
                    this.inputBack();
                    return this._hangul;
                } else {
                    this.reset();
                    return this.addCharacter(character);
                }
            }

            // 종성이 아직 저장되어 있지 않은 경우
            if (this._jongseongCode == 0) {
                if ((this._jongseongCode = this.getJongseongCode(character)) != 0){
                    this._jongseongChar = character;
                    this._hangul = this.combineCode();
                    this.inputBack()
                    return this._hangul;
                } else {
                    this.reset();
                    return this.addCharacter(character);
                }
            }
            
            // // 모든 글자가 저장되었지만 종성이 입력된 것으로 판단될 경우 겹받침 처리
            // const doubleJongseong = this.getDoubleJongseong(this._jongseongChar + character);
            // if (doubleJongseong && (this._jongseongCode = this.getJongseongCode(doubleJongseong)) != 0) {
            //     this._jongseongChar = doubleJongseong;
            //     this._hangul = this.combineCode();
            //     this.inputBack()
            //     return this._hangul;
            // }
            // 모든 글자가 저장되었고 중성이 입력되었을 때 도깨비불 처리
            const dokkaebiJungseongCode = this.getJungseongCode(character);
            const dokkaebiChoseongCode = this.getChoseongCode(this._jongseongChar);

            if (dokkaebiJungseongCode !== -1 && dokkaebiChoseongCode !== -1) {
                this.inputBack();
                this.inputAdd(HangulInputProcessor.combine(this._choseongCode, this._jungseongCode, 0));

                this._choseongCode = dokkaebiChoseongCode;
                this._jungseongCode = dokkaebiJungseongCode;
                this._jongseongCode = 0;
                this._hangul = this.combineCode();
                return this._hangul;
            }

            // 모든 문자가 저장되어있거나 한글이 아닌 글자가 들어온 경우 리셋하고 새로 작성
            this.reset();
            return this.addCharacter(character);
        }

        combineCode() {
            return HangulInputProcessor.combine(this._choseongCode, this._jungseongCode, this._jongseongCode);
        }

        static combine(choseongCode, jungseongCode, jongseongCode) {
            return String.fromCharCode(((choseongCode * 21) + jungseongCode) * 28 + jongseongCode + 0xac00);
        }

        reset() {
            this._hangul = '';
            this._choseongChar = '';
            this._jongseongChar = ''; // 
            this._choseongCode = -1;
            this._jungseongCode = -1;
            this._jongseongCode = 0;
        }

        cancel() {
            if (this._jongseongCode != 0){
                this._jongseongCode = 0;
                this._hangul = this.combineCode();
                this.inputAdd(this._hangul);
            } else if(this._jungseongCode != -1) {
                this._jungseongCode = -1;
                // this._hangul = this.combineCode();
                this._hangul = this._choseongChar;
                this.inputAdd(this._hangul);
            } else if (this._choseongCode != -1) {
                this._choseongCode = -1;
                this._choseongChar = '';
                this._hangul = '';
            }
        }
    }

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
        static HANGUL2 = // 미완성
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
                return [
                    Window_NameInputEx.HANGUL1,
                    Window_NameInputEx.LATIN1
                ];
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
            return $gameSystem.isKorean() && this._page == 0 && !this.isPageChange();
        }

        refresh() {
            super.refresh();

            this._hangulProcessor.reset();
        }
    }

    Window_NameEdit = Window_NameEditEx;
    Window_NameInput = Window_NameInputEx;
})();