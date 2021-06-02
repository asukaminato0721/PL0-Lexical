function lexer(file: string, kw: string) {
  let res: Array<string | number>[] = [];
  const log = false ? console.log : (...s: string[]) => {};
  const OK = 1;
  const ERROR = -1;
  const SPACE = " ";
  const TABLE = "\t";
  const RETURN = "\n";
  function strEnum<T extends string>(o: T[]): { [K in T]: number } {
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

  let ReservedWordNameVsTypeTable = new Map(
    kw.split("\n").map((k) => [k, WORD_TYPE_ENUM[k.toUpperCase()]])
  );
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
  interface WORD_STRUCT {
    szName: string;
    eType: number;
    nNumberValue: number;
    nLineNo: number;
  }
  const RESERVED_WORDS = new Set(kw.split("\n"));

  let EOF = false;
  let g_nLineNo = 0;

  let g_Words = Array<WORD_STRUCT>();

  function LexicalAnalysis() {
    let nResult = GetAWord();
    while (nResult === 1 && g_Words.length > 0) {
      PrintInLexis(g_Words.length - 1);
      log("打印了一个");
      nResult = GetAWord();
    }
  }
  function* generate() {
    for (const char of file) {
      if (char === RETURN) {
        g_nLineNo++;
      }
      yield char;
    }
  }
  let cACharacter = " ";
  const gen = generate();
  const GetACharacterFromFile = () => {
    const o = gen.next();
    if (o.done) {
      EOF = true;
      cACharacter = "\n";
      return;
    } else {
      //@ts-ignore
      cACharacter = o.value;
      EOF = false;
    }
  };
  function GetAWord() {
    log("GetAWord");
    const isalpha = (ch: string) => /^[A-Z]/i.test(ch);
    const isdigit = (ch: string) => /^[0-9]/.test(ch);
    if (typeof cACharacter === "undefined") {
      GetACharacterFromFile();
    }
    let szAWord = []; // 存累积的字母
    let nNumberValue: number = -99;
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
            nLineNo: g_nLineNo,
            nNumberValue,
          });

          szAWord = [];
          log(g_Words);
          return OK;
        } else {
          log("error");
          return ERROR;
        }
      } else if (isdigit(cACharacter)) {
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
            nLineNo: g_nLineNo,
          });
          log(szAWord, "isdigit");
          szAWord = [];
          return OK;
        } else {
          return ERROR;
        }
      } else if (cACharacter === ":") {
        log(":");
        GetACharacterFromFile();
        //@ts-ignore
        if (cACharacter === "=") {
          log("=");
          g_Words.push({
            eType: WORD_TYPE_ENUM.ASSIGN,
            szName: ":=",
            nLineNo: g_nLineNo,
            nNumberValue,
          });
          GetACharacterFromFile();
          return OK;
        }
      } else if (cACharacter === "<") {
        GetACharacterFromFile();
        //@ts-ignore
        if (cACharacter === "=") {
          g_Words.push({
            eType: WORD_TYPE_ENUM.LEQ,
            szName: "<=",
            nLineNo: g_nLineNo,
            nNumberValue,
          });
          GetACharacterFromFile();
          return OK;
        } else {
          g_Words.push({
            eType: WORD_TYPE_ENUM.LES,
            szName: "<",
            nLineNo: g_nLineNo,
            nNumberValue,
          });
          return OK;
        }
      } else if (cACharacter === ">") {
        GetACharacterFromFile();
        //@ts-ignore
        if (cACharacter === "=") {
          g_Words.push({
            eType: WORD_TYPE_ENUM.GEQ,
            szName: ">=",
            nLineNo: g_nLineNo,
            nNumberValue,
          });
          GetACharacterFromFile();
        } else {
          g_Words.push({
            eType: WORD_TYPE_ENUM.GTR,
            szName: ">",
            nLineNo: g_nLineNo,
            nNumberValue,
          });
        }
        return OK;
      } else {
        g_Words.push({
          //@ts-ignore
          eType:
            SingleCharacterWordTypeTable.get(cACharacter) ??
            WORD_TYPE_ENUM.INVALID_WORD,
          szName: cACharacter,
          nLineNo: g_nLineNo,
          nNumberValue,
        });
        GetACharacterFromFile();
        return OK;
      }
    }
    return ERROR;
  }

  function PrintInLexis(nIndex: number) {
    let szWordName = g_Words[nIndex].szName;
    let szWordType = WordTypeToString(g_Words[nIndex].eType);
    switch (g_Words[nIndex].eType) {
      case WORD_TYPE_ENUM.IDENTIFIER:
        res.push([nIndex, szWordName, szWordType]);
        break;
      case WORD_TYPE_ENUM.NUMBER:
        res.push([
          nIndex,
          szWordName,
          szWordType,
          g_Words[nIndex].nNumberValue,
        ]);
        break;
      case WORD_TYPE_ENUM.CONST:
      case WORD_TYPE_ENUM.VAR:
      case WORD_TYPE_ENUM.PROCEDURE:
      case WORD_TYPE_ENUM.BEGIN:
      case WORD_TYPE_ENUM.END:
      case WORD_TYPE_ENUM.IF:
      case WORD_TYPE_ENUM.THEN:
      case WORD_TYPE_ENUM.WHILE:
      case WORD_TYPE_ENUM.DO:
      case WORD_TYPE_ENUM.WRITE:
      case WORD_TYPE_ENUM.READ:
      case WORD_TYPE_ENUM.CALL:
      case WORD_TYPE_ENUM.LEFT_PARENTHESIS:
      case WORD_TYPE_ENUM.RIGHT_PARENTHESIS:
      case WORD_TYPE_ENUM.COMMA:
      case WORD_TYPE_ENUM.SEMICOLON:
      case WORD_TYPE_ENUM.PERIOD:
      case WORD_TYPE_ENUM.PLUS:
      case WORD_TYPE_ENUM.MINUS:
      case WORD_TYPE_ENUM.MULTIPLY:
      case WORD_TYPE_ENUM.DIVIDE:
      case WORD_TYPE_ENUM.ODD:
      case WORD_TYPE_ENUM.EQL:
      case WORD_TYPE_ENUM.NEQ:
      case WORD_TYPE_ENUM.LES:
      case WORD_TYPE_ENUM.LEQ:
      case WORD_TYPE_ENUM.GTR:
      case WORD_TYPE_ENUM.GEQ:
      case WORD_TYPE_ENUM.ASSIGN:
        res.push([nIndex, szWordName, szWordType]);
        break;
      default:
        res.push([nIndex, szWordName, szWordType]);
    }
  }

  function WordTypeToString(T: number) {
    return WORD_TYPE_ENUM[T];
  }
  LexicalAnalysis();
  return res;
}
/*
console.log(
  lexer(
    `const c1=2,c2=4;
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
end.`,
    `begin
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
write`
  )
);
*/
