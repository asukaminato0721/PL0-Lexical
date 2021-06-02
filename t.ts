function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key, cur) => {
    res[key] = cur;
    res[cur] = key;
    return res;
  }, Object.create(null));
}
let dynamicArrayJSON = ["RED", "BLUE", "GREEN"];
const Colors = strEnum(dynamicArrayJSON);
console.log(Colors);
enum colors {
  red,
  green,
  blue,
}
console.log(colors);
