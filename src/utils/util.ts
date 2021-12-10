
export function formateDate(time: Date, fmt = 'yyyy-MM-dd HH:mm:ss') {
    time = time ? new Date(time) : new Date();
    if (!(time instanceof Date)) throw new Error('传入数据不可转换为时间对象');
    let o = {
        'M+': time.getMonth() + 1, // 月份
        'd+': time.getDate(), // 日
        'H+': time.getHours(), // 小时
        'm+': time.getMinutes(), // 分
        's+': time.getSeconds(), // 秒
        'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
        S: time.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
            RegExp.$1,
            (time.getFullYear() + '').substr(4 - RegExp.$1.length)
        );
    }
    for (var k in o) {
        if (new RegExp('[^[](' + k + ')').test(fmt)) {
            // 使用方括号标识不需要格式化的字符 (如 [A] [MM])
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
            );
        }
    }
    return fmt;
}