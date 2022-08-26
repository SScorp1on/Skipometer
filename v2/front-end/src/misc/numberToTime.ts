export const numberToTime = (milliseconds: number) => {
 const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    return [hours, minutes, seconds]
        .map((val) => (val < 10 ? `0${val}` : val))
        .join(":");
};

