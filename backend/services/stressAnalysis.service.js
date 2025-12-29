export function getStressScore(sentimentLogs = []) {
    if (sentimentLogs.length === 0) return { currentLevel: "Green", highStressCount: 0 };

    const highStressEvents = sentimentLogs.filter(log => log.score === "High");

    let alertLevel = "Green";
    if (highStressEvents.length >= 3) alertLevel = "Red";
    else if (highStressEvents.length >= 1) alertLevel = "Yellow";

    return {
        currentLevel: alertLevel,
        highStressCount: highStressEvents.length
    };
}