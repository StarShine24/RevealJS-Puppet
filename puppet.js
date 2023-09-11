#!/usr/bin/env node

const puppeteer = require("puppeteer");
const fs = require("fs");
//const log = console.log;
const log = require('single-line-log').stdout;
const error = require('single-line-log').stderr;

/**
 * Returns true if success or error object.  
 * 
 * @param {String} src - SRC of a file or url to presentation. Default is empty, it needs users creation
 * ```JS
 * callPuppeteer({src:"file:///path/to/file/index.html"})
 * ``` 
 * or
 * ```JS
 * callPuppeteer({src:"https://path/to/file/index.html"})
 * ``` 
 * or
 * ```JS
 * callPuppeteer({src:"path/to/file/index.html"})
 * ``` 
 * @param {String} folderToSave - Parameter for where the images should be saved. Default is root of the folder, 
 * where it creates folder `SCREENSHOTS`.
 * ```JS
 * callPuppeteer({folderToSave:"/path/to/file/"})
 * ``` 
 * @param {String} forStart - Parameter that lets you call function inside webpages.
 * ```JS
 * callPuppeteer({forStart:"console.log('START Script here')"})
 * ``` 
 * @param {String} naming - Naming of the screenshots. Default name is: `Screenshot_YYYYMMDD_HHmmSS` 
 * with additional count number starting at 1000
 * 
 */

let index = 0;
var List = new Array;
var SlideName = "";
var ProperNaming = "";


exports.callPuppeteer = function (objSet = {
    src: "",
    folderToSave: "",
    forStart: "",
    beforeScreenshots: "",
    naming: "",
    orderName: false
}) {
    if (objSet.folderToSave == undefined)
        return Promise.reject("Missing value :folderToSave");
    else
        if (objSet.folderToSave.slice(-1) != "/")
            objSet.folderToSave += "/";

    log("Folder Path: " + objSet.folderToSave);
    return new Promise((res, rej) => {

        puppeteer.launch({
            headless: "new",
            defaultViewport: {
                width: 1920,
                height: 1080,
            },
        }).then(async (browser) => {
            const page = await browser.newPage();

            if (objSet.src.substring(0, 4) != "file" && objSet.src.substring(0, 4) != "http") {
                if (!fs.existsSync(objSet.src)) {
                    log("File " + objSet.src + " doesnt exist");
                    return browser;
                }
                objSet.src = "file://" + objSet.src;
                log("Changing address name to:" + objSet.src);
            }
            log(" address name : " + objSet.src);

            await page.goto(objSet.src);
            if (objSet.forStart != undefined)
                await page.evaluate(objSet.forStart);

            log(await page.evaluate(async () => { return "Document state: " + document.readyState; }));

            var progressAmount = await page.evaluate(async () => { return Reveal.getProgress(); });
            while (progressAmount < 1) {
                if (objSet.naming == undefined) {
                    var d = new Date();
                    ProperNaming = "Screenshot_" + d.getFullYear() + d.getMonth() + d.getDate() + "_" +
                        d.getHours() + d.getMinutes() + "_" + (1000 + index);
                } else {
                    if (objSet.orderName == false) {
                        var d = new Date();
                        ProperNaming = objSet.naming + "_" + (1000 + index);
                    } else {
                        SlideName = "";
                        SlideName = await page.evaluate(async () => { return Reveal.getCurrentSlide().dataset.js ? Reveal.getCurrentSlide().dataset.js : document.querySelector("section.present").dataset.js });
                        if (SlideName == undefined)
                            Setname = SlideName = "no_data-js";
                        else
                            Setname = SlideName;
                        if (List.includes(Setname)) {
                            if (List.includes(Setname)) {
                                var counts = {};
                                List.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
                                Setname += counts.length > 0 ? "_" + counts.length : "";
                            }
                        }
                        List.push(SlideName);
                        ProperNaming = objSet.naming + "_" + (1000 + index) + "_" + Setname;
                    }
                }
                await page.evaluate(async () => {
                    document.getAnimations().forEach((animation) => {
                        if (animation.animationName != "pulse_animNEW" && animation.animationName != "pulse_anim")
                            animation.finish();
                    });
                });

                //Call function on the webpage before the screening//
                if (objSet.beforeScreenshots != undefined)
                    await page.evaluate(objSet.beforeScreenshots);

                await page.screenshot({ path: objSet.folderToSave + ProperNaming + ".jpeg" });
                /* Checking how deep we are in the presentation:
                * 0 = start  
                * 1 = end
                */
                progressAmount = await page.evaluate(() => { return Reveal.getProgress() });

                await page.evaluate(async () => {
                    Reveal.next();
                });
                var eHandle = await page.evaluate(() => { return document.getElementsByClassName("present")[0].dataset.backgroundVideo });
                if (eHandle) {
                    //await setTimeout(()=>{log("its a movie!")}, 5000);
                }

                log("NAME of the File: " + ProperNaming + ".jpeg" + " || progress (" + Math.floor(progressAmount * 100) + "/100)");
                index++;
            }
            log("FINISHED. Path to Screenshots: " + objSet.folderToSave);

            return browser;
        })
            .then(async (browser) => {
                await browser.close();
                res(true);
            }).catch(rej);
    });
}
