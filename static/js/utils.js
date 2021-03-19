const Utils = new function () {
    this.compareCondition = (value, condition) => {
        if (condition.indexOf(">=") >= 0) {
            const compareVal = parseFloat(condition.replace(">=", ""));
            return value >= compareVal;
        } else if (condition.indexOf("<=") >= 0) {
            const compareVal = parseFloat(condition.replace("<=", ""));
            return value <= compareVal;
        } else if (condition.indexOf(">") >= 0) {
            const compareVal = parseFloat(condition.replace(">", ""));
            return value > compareVal;
        } else if (condition.indexOf("<") >= 0) {
            const compareVal = parseFloat(condition.replace("<", ""));
            return value < compareVal;
        } else if (condition.indexOf("=") >= 0) {
            const compareVal = parseFloat(condition.replace("=", ""));
            return value == compareVal;
        } else {
            return value.indexOf(condition) >= 0;
        }
    }

    this.dynamicSort = (property, sortingOrder) => {
        var sortOrder = sortingOrder == "asc" ? 1 : -1;
        if (sortingOrder === "") sortOrder = 0;
        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    this.datediff = (first, second) => {
        if ((typeof first) == 'string') {
            const temp = first.split('.')
            first = new Date(temp[2], parseInt(temp[1], 10) - 1, temp[0])
        }
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }
}