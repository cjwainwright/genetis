const rimraf = require('rimraf');

module.exports = async function deleteFiles(pattern) {
    return await new Promise((resolve, reject) => {
        rimraf(pattern, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
};