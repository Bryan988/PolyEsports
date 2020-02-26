

exports.checkPastDate = function(newDate) {
    let today = new Date(Date.now());

    if (newDate.getFullYear() < today.getFullYear()) {
        return false;
    } else {
        if (newDate.getMonth() < today.getMonth()) {
            return false;
        } else {
            if (newDate.getDate() < today.getDate()) {
                return false;
            } else {
                return true;
            }
        }
    }
}