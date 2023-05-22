#!/usr/bin/env node

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const log = require('single-line-log').stdout;

/**
 * Returns true if success or error object.  
 * 
 * @param {String} src - SRC of a file or url to presentation. Default is empty, it needs users creation
 * ```JS
 * callPuppeteer({src:"file:///path/to/file/index.html"})
 * ``` 
 * @param {String} folderToSave - Parameter for where the images should be saved. Default is root of the folder, 
 * where it creates folder `SCREENSHOTS`.
 * ```JS
 * callPuppeteer({folderToSave:"/path/to/file/"})
 * ``` 
 * @param {String} path - Parameter for where the script is called from. Default is `__dirname`
 * ```JS
 * callPuppeteer({path:"/path/to/file/"})
 * ``` 
 * @param {String} naming - Naming of the screenshots. Default name is: `Screenshot_YYYYMMDD_HHmmSS` 
 * with additional count number from the lenght picked from slide count of `<slide>`
 * 
 */

exports.callPuppeteer = function (src = "", folderToSave="", forStart="console.log('START Script here')", path=process.cwd(), naming = "") {
        
    if (folderToSave == "")
        try {
            var folder = path.split("/");
            folder.pop();
            folder = folder.join("/");
            folderToSave = folder + "/SCREENSHOTS/"
            log("folderToSave=" + folderToSave);
            if (!fs.existsSync(folderToSave)) {
                fs.mkdirSync(folderToSave);
            }
        } catch (err) {
            return err;
        }
    console.log("Folder Path: "+folderToSave);
    puppeteer.launch({
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    })

        .then(async (browser) => {
            const page = await browser.newPage();
            await page.goto(src);
            await log(page.evaluate(forStart));
            
            const aHandle = await page.evaluate(() => { return document.getElementsByTagName("section").length+document.getElementsByClassName("fragment").length });
            await page.evaluate(async () => {
                document.getAnimations().forEach((animation) => {
                    animation.finish();
                });
            });
            for (let index = 0; index < aHandle; index++) {
                if (!naming) {
                    var d = new Date();
                    var naming = "Screenshot_" + d.getFullYear() + d.getMonth() + d.getDate() + "_" +
                        d.getHours() + d.getMinutes();
                }
                

                await page.screenshot({ path: folderToSave + naming + "_"+ (1000+ index) + ".jpeg" });
                await page.evaluate(async () => {
                    Reveal.next();
                });
                var eHandle = await page.evaluate(() => { return document.getElementsByClassName("present")[0].dataset.backgroundVideo });
                if(eHandle){
                    //await setTimeout(()=>{log("its a movie!")}, 5000);
                }
                await log(page.evaluate(async () => {
                    
                    document.getAnimations().forEach((animation) => {
                        if(animation.animationName!="pulse_animNEW"&&animation.animationName!="pulse_anim")
                        animation.finish();
                    });
                }));
                log("NAME of the File: "+naming+ "_"+ (1000+ index) + ".jpeg"+"; which is: "+index + "-" + aHandle);
            }
            await browser.close();
            return true;
        }).catch((err) => {
            return err;
        });
}
