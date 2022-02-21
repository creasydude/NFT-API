export const compareTime = (time) => {
    const nowTime = new Date().getTime();
    const oldTime = new Date(time).getTime();
    return oldTime > nowTime;
}

export const addTime = (minutes) => {
    const nowTime = new Date().getTime();
    const newTime = nowTime + minutes * 60000;
    return new Date(newTime).toISOString();
}