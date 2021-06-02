function lexer(file, kw) {
    let res = [];
    const log = false ? console.log : (...s) => { };
    const OK = 1;
    const ERROR = -1;
    const SPACE = " ";
    const TABLE = "\t";
    const RETURN = "\n";
    function strEnum(o) {
        return o.reduce((res, key, cur) => {
            res[key] = cur;
            res[cur] = key;
            return res;
        }, Object.create(null));
    }
    let WORD_TYPE_ENUM = strEnum([
        ...new Set([
            "INVALID_WORD",
            "IDENTIFIER",
            "NUMBER",
            "LEFT_PARENTHESIS",
            "RIGHT_PARENTHESIS",
            "COMMA",
            "SEMICOLON",
            "PERIOD",
            "PLUS",
            "MINUS",
            "MULTIPLY",
            "DIVIDE",
            "ODD",
            "EQL",
            "NEQ",
            "LES",
            "LEQ",
            "GTR",
            "GEQ",
            "ASSIGN",
            ...kw.toUpperCase().split("\n"),
        ]),
    ]);
    let ReservedWordNameVsTypeTable = new Map(kw.split("\n").map((k) => [k, WORD_TYPE_ENUM[k.toUpperCase()]]));
    const SingleCharacterWordTypeTable = new Map([
        ["+", WORD_TYPE_ENUM.PLUS],
        ["-", WORD_TYPE_ENUM.MINUS],
        ["*", WORD_TYPE_ENUM.MULTIPLY],
        ["/", WORD_TYPE_ENUM.DIVIDE],
        ["(", WORD_TYPE_ENUM.LEFT_PARENTHESIS],
        [")", WORD_TYPE_ENUM.RIGHT_PARENTHESIS],
        ["=", WORD_TYPE_ENUM.EQL],
        [",", WORD_TYPE_ENUM.COMMA],
        [".", WORD_TYPE_ENUM.PERIOD],
        ["#", WORD_TYPE_ENUM.NEQ],
        [";", WORD_TYPE_ENUM.SEMICOLON],
    ]);
    let 目前行 = 1;
    const RESERVED_WORDS = new Set(kw.split("\n"));
    let EOF = false;
    let g_Words = Array();
    function LexicalAnalysis() {
        let nResult = GetAWord();
        while (nResult === 1 && g_Words.length > 0) {
            PrintInLexis(g_Words.length - 1);
            log("打印了一个");
            nResult = GetAWord();
        }
    }
    let cACharacter = " ";
    function* generate() {
        for (const char of file) {
            if (char === "\n") {
                目前行++;
            }
            yield char;
        }
    }
    const gen = generate();
    const GetACharacterFromFile = () => {
        const o = gen.next();
        //@ts-ignore
        cACharacter = o.value ?? "\n";
        // @ts-ignore
        EOF = o.done;
    };
    function GetAWord() {
        log("GetAWord");
        const isalpha = (ch) => /^[A-Z]/i.test(ch);
        const isdigit = (ch) => /^[0-9]/.test(ch);
        if (typeof cACharacter === "undefined") {
            GetACharacterFromFile();
        }
        let szAWord = []; // 存累积的字母
        let nNumberValue = -99;
        while ([SPACE, RETURN, TABLE].includes(cACharacter) && !EOF) {
            GetACharacterFromFile();
            log("跳过空白字符");
        }
        if (!EOF) {
            // 找标识符或关键字
            if (isalpha(cACharacter)) {
                log("isalpha");
                do {
                    szAWord.push(cACharacter);
                    GetACharacterFromFile();
                } while ((isalpha(cACharacter) || isdigit(cACharacter)) && !EOF); // fin a word
                if (!EOF) {
                    g_Words.push({
                        //@ts-ignore
                        eType: RESERVED_WORDS.has(szAWord.join(""))
                            ? ReservedWordNameVsTypeTable.get(szAWord.join(""))
                            : WORD_TYPE_ENUM.IDENTIFIER,
                        szName: szAWord.join(""),
                        nLineNo: 目前行,
                        nNumberValue,
                    });
                    szAWord = [];
                    log(g_Words);
                    return OK;
                }
                else {
                    log("error");
                    return ERROR;
                }
            }
            else if (isdigit(cACharacter)) {
                log("isdigit");
                do {
                    szAWord.push(cACharacter);
                    GetACharacterFromFile();
                } while (isdigit(cACharacter) && !EOF);
                if (!EOF) {
                    g_Words.push({
                        eType: WORD_TYPE_ENUM.NUMBER,
                        szName: szAWord.join(""),
                        nNumberValue: parseInt(szAWord.join("")),
                        nLineNo: 目前行,
                    });
                    log(szAWord, "isdigit");
                    szAWord = [];
                    return OK;
                }
                else {
                    return ERROR;
                }
            }
            else if (cACharacter === ":") {
                log(":");
                GetACharacterFromFile();
                //@ts-ignore
                if (cACharacter === "=") {
                    log("=");
                    g_Words.push({
                        eType: WORD_TYPE_ENUM.ASSIGN,
                        szName: ":=",
                        nLineNo: 目前行,
                        nNumberValue,
                    });
                    GetACharacterFromFile();
                    return OK;
                }
            }
            else if (cACharacter === "<") {
                GetACharacterFromFile();
                //@ts-ignore
                if (cACharacter === "=") {
                    g_Words.push({
                        eType: WORD_TYPE_ENUM.LEQ,
                        szName: "<=",
                        nLineNo: 目前行,
                        nNumberValue,
                    });
                    GetACharacterFromFile();
                    return OK;
                }
                else {
                    g_Words.push({
                        eType: WORD_TYPE_ENUM.LES,
                        szName: "<",
                        nLineNo: 目前行,
                        nNumberValue,
                    });
                    return OK;
                }
            }
            else if (cACharacter === ">") {
                GetACharacterFromFile();
                //@ts-ignore
                if (cACharacter === "=") {
                    g_Words.push({
                        eType: WORD_TYPE_ENUM.GEQ,
                        szName: ">=",
                        nLineNo: 目前行,
                        nNumberValue,
                    });
                    GetACharacterFromFile();
                }
                else {
                    g_Words.push({
                        eType: WORD_TYPE_ENUM.GTR,
                        szName: ">",
                        nLineNo: 目前行,
                        nNumberValue,
                    });
                }
                return OK;
            }
            else {
                g_Words.push({
                    eType: SingleCharacterWordTypeTable.get(cACharacter) ??
                        WORD_TYPE_ENUM.INVALID_WORD,
                    szName: cACharacter,
                    nLineNo: 目前行,
                    nNumberValue,
                });
                GetACharacterFromFile();
                return OK;
            }
        }
        return ERROR;
    }
    function PrintInLexis(nIndex) {
        let szWordName = g_Words[nIndex].szName;
        let szWordType = WordTypeToString(g_Words[nIndex].eType);
        let line = g_Words[nIndex].nLineNo;
        switch (g_Words[nIndex].eType) {
            case WORD_TYPE_ENUM.IDENTIFIER:
                res.push([nIndex, line, szWordName, szWordType]);
                break;
            case WORD_TYPE_ENUM.NUMBER:
                res.push([
                    nIndex,
                    line,
                    szWordName,
                    szWordType,
                    g_Words[nIndex].nNumberValue,
                ]);
                break;
            default:
                res.push([nIndex, line, szWordName, szWordType]);
        }
    }
    function WordTypeToString(T) {
        return WORD_TYPE_ENUM[T];
    }
    LexicalAnalysis();
    return res;
}
console.log(lexer(`const c1=2,c2=4;
var x,num,sum;
procedure func1;
var y;
y:=c1;
begin
  sum:=0;
  read(x);
  num:=10-x/c2;
  if num<-2 then
	x:=-c1;
  if num>2+2*c2 then
	x:=8-c2;
	while x<num do
		begin
			sum:=sum+x*x;
			x:=x+2;
		end;
	call func1;
	sum:=-10*c2/(2*sum+num);
	write(num,sum);
	;
end.`, `begin
call
const
do
end
if
odd
procedure
read
then
var
while
write`));
