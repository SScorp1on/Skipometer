export const timeToNumber = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600000 + minutes * 60000 + seconds * 1000;
};


