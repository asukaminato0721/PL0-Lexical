function lexer(输入的字符串: string, kw: string) {
  let 返回的列表: Array<string | number>[] = [];
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
  let 单词类型枚举值 = strEnum([
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

  let 保留字单词映射类型表 = new Map(
    kw.split("\n").map((k) => [k, 单词类型枚举值[k.toUpperCase()]])
  );
  const SingleCharacterWordTypeTable = new Map([
    ["+", 单词类型枚举值.PLUS],
    ["-", 单词类型枚举值.MINUS],
    ["*", 单词类型枚举值.MULTIPLY],
    ["/", 单词类型枚举值.DIVIDE],
    ["(", 单词类型枚举值.LEFT_PARENTHESIS],
    [")", 单词类型枚举值.RIGHT_PARENTHESIS],
    ["=", 单词类型枚举值.EQL],
    [",", 单词类型枚举值.COMMA],
    [".", 单词类型枚举值.PERIOD],
    ["#", 单词类型枚举值.NEQ],
    [";", 单词类型枚举值.SEMICOLON],
  ]);
  interface WORD_STRUCT {
    符号名称: string;
    类型: number;
    数字对应值: number;
    所在行数: number;
  }
  let 目前行 = 1;
  const 保留字 = new Set(kw.split("\n"));
  let EOF = false;
  let 已处理的单词 = Array<WORD_STRUCT>();
  function LexicalAnalysis() {
    let nResult: number;
    while ((nResult = GetAWord()) === 1 && 已处理的单词.length > 0) {
      PrintInLexis(已处理的单词.length - 1);
      log("打印了一个");
    }
  }

  let 当前字符 = " ";
  function* generate() {
    for (const char of 输入的字符串) {
      if (char === "\n") {
        目前行++;
      }
      yield char;
    }
  }
  const gen = generate();
  const 读下一个字符 = () => {
    const o = gen.next();

    //@ts-ignore
    当前字符 = o.value ?? "\n";
    // @ts-ignore
    EOF = o.done;
  };
  function GetAWord() {
    log("GetAWord");
    const isalpha = (ch: string) => /^[A-Z]/i.test(ch);
    const isdigit = (ch: string) => /^[0-9]/.test(ch);
    if (typeof 当前字符 === "undefined") {
      读下一个字符();
    }
    let 累积的字母 = [];
    let nNumberValue: number = -99;
    while ([SPACE, RETURN, TABLE].includes(当前字符) && !EOF) {
      读下一个字符();
      log("跳过空白字符");
    }
    if (!EOF) {
      // 找标识符或关键字
      if (isalpha(当前字符) || 当前字符 === "_") {
        log("isalpha");
        do {
          累积的字母.push(当前字符);
          读下一个字符();
        } while (
          (isalpha(当前字符) || isdigit(当前字符) || 当前字符 === "_") &&
          !EOF
        ); // fin a word
        if (!EOF) {
          已处理的单词.push({
            //@ts-ignore
            类型: 保留字.has(累积的字母.join(""))
              ? 保留字单词映射类型表.get(累积的字母.join(""))
              : 单词类型枚举值.IDENTIFIER,
            符号名称: 累积的字母.join(""),
            所在行数: 目前行,
            数字对应值: nNumberValue,
          });
          累积的字母 = [];
          log(已处理的单词);
          return OK;
        } else {
          log("error");
          return ERROR;
        }
      } else if (isdigit(当前字符)) {
        log("isdigit");
        do {
          累积的字母.push(当前字符);
          读下一个字符();
        } while (isdigit(当前字符) && !EOF);
        if (!EOF) {
          已处理的单词.push({
            类型: 单词类型枚举值.NUMBER,
            符号名称: 累积的字母.join(""),
            数字对应值: parseInt(累积的字母.join("")),
            所在行数: 目前行,
          });
          log(累积的字母, "isdigit");
          累积的字母 = [];
          return OK;
        } else {
          return ERROR;
        }
      } else if (当前字符 === ":") {
        log(":");
        读下一个字符();
        //@ts-ignore
        if (当前字符 === "=") {
          log("=");
          已处理的单词.push({
            类型: 单词类型枚举值.ASSIGN,
            符号名称: ":=",
            所在行数: 目前行,
            数字对应值: nNumberValue,
          });
          读下一个字符();
          return OK;
        }
      } else if (当前字符 === "<") {
        读下一个字符();
        //@ts-ignore
        if (当前字符 === "=") {
          已处理的单词.push({
            类型: 单词类型枚举值.LEQ,
            符号名称: "<=",
            所在行数: 目前行,
            数字对应值: nNumberValue,
          });
          读下一个字符();
          return OK;
        } else {
          已处理的单词.push({
            类型: 单词类型枚举值.LES,
            符号名称: "<",
            所在行数: 目前行,
            数字对应值: nNumberValue,
          });
          return OK;
        }
      } else if (当前字符 === ">") {
        读下一个字符();
        //@ts-ignore
        if (当前字符 === "=") {
          已处理的单词.push({
            类型: 单词类型枚举值.GEQ,
            符号名称: ">=",
            所在行数: 目前行,
            数字对应值: nNumberValue,
          });
          读下一个字符();
        } else {
          已处理的单词.push({
            类型: 单词类型枚举值.GTR,
            符号名称: ">",
            所在行数: 目前行,
            数字对应值: nNumberValue,
          });
        }
        return OK;
      } else {
        已处理的单词.push({
          类型:
            SingleCharacterWordTypeTable.get(当前字符) ??
            单词类型枚举值.INVALID_WORD,
          符号名称: 当前字符,
          所在行数: 目前行,
          数字对应值: nNumberValue,
        });
        读下一个字符();
        return OK;
      }
    }
    return ERROR;
  }

  function PrintInLexis(编号: number) {
    let 符号名 = 已处理的单词[编号].符号名称;
    let 符号类型 = WordTypeToString(已处理的单词[编号].类型);
    let 行数 = 已处理的单词[编号].所在行数;
    switch (已处理的单词[编号].类型) {
      case 单词类型枚举值.IDENTIFIER:
        返回的列表.push([编号, 行数, 符号名, 符号类型]);
        break;
      case 单词类型枚举值.NUMBER:
        返回的列表.push([
          编号,
          行数,
          符号名,
          符号类型,
          已处理的单词[编号].数字对应值,
        ]);
        break;
      default:
        返回的列表.push([编号, 行数, 符号名, 符号类型]);
    }
  }

  function WordTypeToString(T: number) {
    return 单词类型枚举值[T];
  }
  LexicalAnalysis();
  return 返回的列表;
}

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
