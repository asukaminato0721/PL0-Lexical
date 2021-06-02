function strEnum(o) {
    return o.reduce((res, key, cur) => {
        res[key] = cur;
        res[cur] = key;
        return res;
    }, Object.create(null));
}
let dynamicArrayJSON = ["RED", "BLUE", "GREEN"];
const Colors = strEnum(dynamicArrayJSON);
console.log(Colors);
var colors;
(function (colors) {
    colors[colors["red"] = 0] = "red";
    colors[colors["green"] = 1] = "green";
    colors[colors["blue"] = 2] = "blue";
})(colors || (colors = {}));
console.log(colors);
