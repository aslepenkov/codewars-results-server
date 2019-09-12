/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable no-console */
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const challengeSlugs = JSON.parse(fs.readFileSync(path.join('./', 'json', 'slugs.json'))).data;
const players = JSON.parse(fs.readFileSync(path.join('./', 'json', 'playersReal.json'))).data;
const itemsJsonPath = path.join(path.join('./', 'json'), 'items.json');

const TWO_WEEKS = 12096e5;

async function getResultsAsync() {
    const data = [];
    try {
        for (let i = 0; i < players.length; i += 1) {
            const p = players[i];
            const player = p.nick;
            const url = `https://www.codewars.com/api/v1/users/${player}/code-challenges/completed?page=0`;

            await axios
                .get(url)
                .then((response) => {
                    response.data.data.forEach((val) => {
                        if (challengeSlugs.map((s) => s.name).includes(val.slug)) {
                            data.push({
                                player,
                                slug: val.slug,
                                completedAt: val.completedAt,
                                done: '+'
                            });
                        } else {
                            data.push({
                                player,
                                slug: val.slug,
                                completedAt: '',
                                done: '-'
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {});
        }
    } catch (error) {
        console.log(error);
    }
    return data;
}

function kFormatter(num) {
    return Math.abs(num) > 999
        ? `${Math.sign(num) * (Math.abs(num) / 1000).toFixed(1)}k`
        : Math.sign(num) * Math.abs(num);
}

async function fetchTableData() {
    const results = await getResultsAsync();

    const items = await players.map((p) => {
        const row = {};
        const player = p.nick;
        row.playerName = p;
        row.doneCount = 0;
        row.diffTime = 0;
        row._cellVariants = {};


        for (let i = 0; i < challengeSlugs.length; i += 1) {
            const slugObj = challengeSlugs[i];
            const slug = slugObj.name;
            const {
                expiryDate
            } = slugObj;
            const {
                startDate
            } = slugObj;

            const timestr = results
                .filter((res) => res.player === player && res.slug === slug)
                .map((s) => s.completedAt)
                .reverse()[0];


            const comletedTime = new Date(timestr);

            const resultTime = new Date(expiryDate) - comletedTime; // new Date(timestr);
            const fastestTime = results
                .filter((res) => res.slug === slug)
                .map((s) => new Date(s.completedAt))
                .filter((d) => d instanceof Date)
                .sort((a, b) => {
                    if (+a.getTime() > +b.getTime()) return 1;
                    if (+a.getTime() < +b.getTime()) return -1;
                    return 0;
                })[0];

            if (resultTime) {
                row.doneCount += 1;
                row[slug] = '+';

                let diff = Math.abs(
                    comletedTime.getTime() - fastestTime.getTime()
                );
                const maxDiff = TWO_WEEKS;

                if (diff > maxDiff) {
                    diff = Math.abs(
                        comletedTime.getTime() - new Date(startDate).getTime()
                    );
                }

                let seconds = diff / 1000;
                const hours = parseInt(seconds / 3600, 10);
                seconds %= 3600;
                const minutes = parseInt(seconds / 60, 10);

                if (fastestTime.getTime() === comletedTime.getTime()) {
                    row._cellVariants[slug] = 'success';
                } else {
                    row.diffTime += Math.ceil(diff / 60000 / 60);
                    row[slug] = `+${hours}:${minutes}`;
                }

                if (resultTime < 0) {
                    row._cellVariants[slug] = 'warning';
                }
            } else {
                row[slug] = '-';
                row._cellVariants[slug] = 'danger';
            }
        }

        row.doneCount = {
            done: row.doneCount,
            max: challengeSlugs.length
        };
        return row;
    });

    // sort by done count and leader-diff time
    items.sort((a, b) => {
        const adoneCount = a.doneCount.done;
        const bdoneCount = b.doneCount.done;
        const aLow = a.diffTime;
        const bLow = b.diffTime;
        if (adoneCount === bdoneCount) {
            // eslint-disable-next-line no-nested-ternary
            return aLow < bLow ? -1 : aLow > bLow ? 1 : 0;
        }
        return adoneCount < bdoneCount ? 1 : -1;
    });

    // format thousands
    items.forEach((i) => i.diffTime = kFormatter(i.diffTime));

    // ready for b-table data
    return items;
}

module.exports.writeData = async () => {
    console.log('writeData');

    const data = await fetchTableData();
    const json = JSON.stringify(data);
    fs.writeFileSync(itemsJsonPath, json);

    return json;
};
