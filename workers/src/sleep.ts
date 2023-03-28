module.exports = (timeInMs: any) =>
  new Promise(resolve => {
    setTimeout(resolve, timeInMs);
  });
