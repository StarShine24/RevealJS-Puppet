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
 * @param {String} forStart - Parameter that lets you call function inside webpages.
 * ```JS
 * callPuppeteer({forStart:"console.log('START Script here')"})
 * ``` 
 * @param {String} path - Parameter for where the script is called from. Default is `__dirname`
 * ```JS
 * callPuppeteer({path:"/path/to/file/"})
 * ``` 
 * @param {String} naming - Naming of the screenshots. Default name is: `Screenshot_YYYYMMDD_HHmmSS` 
 * with additional count number from the lenght picked from slide count of `<slide>`
 * 
 */

exports.callPuppeteer = function (obj) {
    objDefault = {src:"",
    folderToSave:"",
    forStart:"console.log('START Script here')",
    path:process.cwd(),
    naming:""}
        
    Object.assign(objDefault, obj);
        console.log("naming: "+objDefault.naming);
    if (objDefault.folderToSave == "")
        try {
            var folder = objDefault.path.split("/");
            folder.pop();
            folder = folder.join("/");
            objDefault.folderToSave = folder + "/SCREENSHOTS/"
            log("objDefault.folderToSave=" + objDefault.folderToSave);
            if (!fs.existsSync(objDefault.folderToSave)) {
                fs.mkdirSync(objDefault.folderToSave);
            }
        } catch (err) {
            return err;
        }
    console.log("Folder Path: "+objDefault.folderToSave);
    puppeteer.launch({
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    })

        .then(async (browser) => {
            const page = await browser.newPage();
            await page.goto(objDefault.src);
            await log(page.evaluate(objDefault.forStart));
            
            const aHandle = await page.evaluate(() => { return document.getElementsByTagName("section").length+document.getElementsByClassName("fragment").length });
            await page.evaluate(async () => {
                document.getAnimations().forEach((animation) => {
                    animation.finish();
                });
            });
            for (let index = 0; index < aHandle; index++) {
                if (objDefault.naming=="") {
                    var d = new Date();
                    objDefault.naming = "Screenshot_" + d.getFullYear() + d.getMonth() + d.getDate() + "_" +
                        d.getHours() + d.getMinutes();
                }
                

                await page.screenshot({ path: objDefault.folderToSave + objDefault.naming + "_"+ (1000+ index) + ".jpeg" });
                /* Checking how deep we are in the presentation:
                * 0 = start  
                * 1 = end
                */
                const progressAmount= await page.evaluate(async () => {
                    Reveal.getProgress();
                });
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
                log("NAME of the File: "+objDefault.naming+ "_"+ (1000+ index) + ".jpeg"+"; which is: "+index + "-" + aHandle + " - progressAmount="+progressAmount);
            }
            await browser.close();
            return true;
        }).catch((err) => {
            return err;
        });
}
