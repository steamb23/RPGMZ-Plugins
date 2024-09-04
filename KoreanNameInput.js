/*:
 * @target MZ
 * @plugindesc Window_NameInput의 기능을 확장하여 한국어 입력을 지원합니다.
 * @author 맛난호빵
 * 
// * @param shortVowelInput
// * @text 단모음 입력
// * @type boolean
// * @desc 단모음 입력 지원 여부를 설정합니다.
// * @default false
// * @on 단모음 입력
// * @off 일반 입력
 */

(()=>{
    'use strict';
    const params = PluginManager.parameters('KoreanNameInput');
    const shortVowelInput = Boolean(params['shortVowelInput']);
    
    /**
     * 한글 입력 조합 클래스
     */
    class HangulInputProcessor {
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
            'ㄱㄱ': 'ㄲ',
            'ㄷㄷ': 'ㄸ',
            'ㅂㅂ': 'ㅃ',
            'ㅅㅅ': 'ㅆ',
            'ㅈㅈ': 'ㅉ'
        };

        // 겹모음 패턴
        static HANGUL_DOUBLE_JUNGSEONG_PATTERN = {
            'ㅏㅣ': 'ㅐ',
            'ㅑㅣ': 'ㅒ',
            'ㅓㅣ': 'ㅔ',
            'ㅕㅣ': 'ㅖ',
            'ㅗㅏ': 'ㅘ',
            'ㅗㅐ': 'ㅙ',
            'ㅗㅣ': 'ㅚ',
            'ㅜㅣ': 'ㅟ',
            'ㅡㅣ': 'ㅢ'
        }

        // 단모음 패턴
        static HANGUL_SHORT_VOWEL_PATTERN = {
            'ㅏㅏ': 'ㅑ',
            'ㅐㅐ': 'ㅒ',
            'ㅓㅓ': 'ㅕ',
            'ㅔㅔ': 'ㅖ',
            'ㅗㅗ': 'ㅛ',
            'ㅜㅜ': 'ㅠ'
        }

        // 겹받침 패턴
        static HANGUL_DOUBLE_JONGSEONG_PATTERN = {
            'ㄱㅅ': 'ㄳ',
            'ㄴㅈ': 'ㄵ',
            'ㄴㅎ': 'ㄶ',
            'ㄹㄱ': 'ㄺ',
            'ㄹㅁ': 'ㄻ',
            'ㄹㅂ': 'ㄼ',
            'ㄹㅅ': 'ㄽ',
            'ㄹㅌ': 'ㄾ',
            'ㄹㅍ': 'ㄿ',
            'ㄹㅎ': 'ㅀ',
            'ㅂㅅ': 'ㅄ'
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

        static getDoubleChoseong(characters) {
            return HangulInputProcessor.HANGUL_DOUBLE_CHOSEONG_PATTERN[characters] ?? HangulInputProcessor.HANGUL_DOUBLE_JONGSEONG_PATTERN[characters];
        }
        
        static getDoubleJungseong(characters) {
            return HangulInputProcessor.HANGUL_DOUBLE_JUNGSEONG_PATTERN[characters];
        }

        static getDoubleJongseong(characters) {
            return HangulInputProcessor.HANGUL_DOUBLE_CHOSEONG_PATTERN[characters] ?? HangulInputProcessor.HANGUL_DOUBLE_JONGSEONG_PATTERN[characters];
        }

        static get isShortVowelInput() {
            return shortVowelInput;
        }
        
        buffer = [];
        // 입력 버퍼 크기
        static MAX_BUFFER_SIZE = 6;

        setEditWindow(editWindow) {
            this._editWindow = editWindow;
        }

        addCharacter(character) {
            this.buffer.push(character);

            this.process(this.buffer);
        }

        cancel() {
            this.buffer.pop();

            if (this.buffer.length > 0){
                this.process(this.buffer, false);
                this._editWindow.add(this.hangul);
            }
        }

        getHangul() {
            return this.hangul;
        }

        reset() {
            this.hangul = null;
            this.buffer.length = 0;
        }

        bufferReset() {
            this.buffer.length = 0;
        }

        /** 
         * 버퍼를 합성합니다.
         * 합성이 불가능할 경우 버퍼를 비웁니다.
         *  */
        process(buffer, allowBack = true) {
            const CHO = 0;
            const JUNG = 1;
            const JONG = 2;
            // 초성, 중성, 종성 배열
            let characters = ['', '', ''];
            let codes = [-1, -1, 0];

            let back = () => {
                if (allowBack) this._editWindow.back();
            }

            let reset = () => {
                this.reset();
                characters = ['', '', ''];
                codes = [-1, -1, 0];
            }

            let setCharacter = (index, character, code) => {
                characters[index] = character;
                codes[index] = code ?? [
                    HangulInputProcessor.getChoseongCode,
                    HangulInputProcessor.getJungseongCode,
                    HangulInputProcessor.getJongseongCode][index](character);
            };

            let automata = (character) => {
                let temp;
                if (codes[CHO] == -1) {
                    setCharacter(CHO, character);
                    return true;
                }
                if (codes[JUNG] == -1) {
                    // 겹자음 처리
                    if (HangulInputProcessor.getChoseongCode(character) != -1 &&
                        (temp = HangulInputProcessor.getDoubleChoseong(characters[CHO]+character)) != null) {
                        setCharacter(CHO, temp);
                        // 겹받침용 문자, 즉 -1 가 나왔을 경우 리셋
                        if (codes[CHO] == -1)
                            this.reset();
                        back();
                        return true;
                    }
                    // 모음이 아닌 경우 리셋처리
                    if (HangulInputProcessor.getJungseongCode(character) == -1)
                    {
                        reset();
                        automata(character);
                        return false;
                    }
                    setCharacter(JUNG, character);
                    back();
                    return true;
                }
                if (codes[JONG] == 0) {
                    // 겹모음 처리
                    if (HangulInputProcessor.getJungseongCode(character) != -1 &&
                        (temp = HangulInputProcessor.getDoubleJungseong(characters[JUNG]+character)) != null) {
                        setCharacter(JUNG, temp);
                        back();
                        return true;
                    }
                    // // 단모음 처리
                    // if (this.isShortVowelInput &&
                    //     HangulInputProcessor.getJungseongCode(character) != -1 &&
                    //     (temp = HangulInputProcessor.getDoubleJungseong(characters[JUNG]+character) != null)) {
                    //     setCharacter(JUNG, temp);
                    //     break;
                    // }
                    // 받침이 아닌 경우 리셋처리
                    if (HangulInputProcessor.getJongseongCode(character) == -1)
                        {
                            reset();
                            automata(character);
                            return false;
                        }
                    setCharacter(JONG, character);
                    back();
                    return true;
                }
                
                // 겹받침 처리
                if (HangulInputProcessor.getJongseongCode(character) != 0 &&
                (temp = HangulInputProcessor.getDoubleJongseong(characters[JONG]+character)) != null) {
                    setCharacter(JONG, temp);
                    back();
                    return true;
                }
                // 도깨비불 처리
                if (HangulInputProcessor.getJungseongCode(character) != -1) {
                    back();
                    this._editWindow.add(HangulInputProcessor.combine(codes[0], codes[1], 0));
                    reset();
                    setCharacter(CHO, character);
                    return true;
                }

                this._editWindow.add(HangulInputProcessor.combine(codes[0], codes[1], codes[2]));
                reset();
                this.buffer.push(character);
                automata(character);
                return false;
            }

            for (const character of buffer) {
                if (automata(character)) continue;
                else break;
            }

            let result = HangulInputProcessor.combine(codes[0], codes[1], codes[2]);
            if (result) {
                this.hangul = result;
            } else {
                this.hangul =  characters.join('');
            }
        }

        static combine(choseongCode, jungseongCode, jongseongCode) {
            // 오류 처리
            if (choseongCode == -1 || jungseongCode == -1) {
                return null;
            }
            return String.fromCharCode(((choseongCode * 21) + jungseongCode) * 28 + jongseongCode + 0xac00);
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