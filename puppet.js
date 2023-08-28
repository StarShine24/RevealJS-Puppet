#!/usr/bin/env node

const puppeteer = require("puppeteer");
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

exports.callPuppeteer = function (objSet={src:"",
                                    folderToSave:"",
                                        forStart:"console.log('START Script here')",
                                                naming:""}) {
    if(objSet.folderToSave=="")
    {
        return error("Missing value :folderToSave");
    }                            
    console.log("Folder Path: "+objSet.folderToSave);
    puppeteer.launch({
        defaultViewport: {
            width: 1920,
            height: 1080,
        },
    })

        .then(async (browser) => {
            const page = await browser.newPage();
            if(objSet.src.substring(0,4)!="file"||objSet.src.substring(0,4)!="http"){
                objSet.src= "file:///"+objSet.src;
                log("Changing address name to:"+objSet.src);
            }
            await page.goto(objSet.src);
            await log(page.evaluate(objSet.forStart));            

            /* Animation ending to allow smooth screenshots*/
            await page.evaluate(async () => {
                document.getAnimations().forEach((animation) => {
                    animation.finish();
                });
            });

            var progressAmount= await page.evaluate(() => { return Reveal.getProgress()});
            let index = 0;
            while(progressAmount<1) {
                if (objSet.naming=="") {
                    var d = new Date();
                    objSet.naming = "Screenshot_" + d.getFullYear() + d.getMonth() + d.getDate() + "_" +
                        d.getHours() + d.getMinutes();
                }
                

                await page.screenshot({ path: objSet.folderToSave + objSet.naming + "_"+ (1000+ index) + ".jpeg" });
                /* Checking how deep we are in the presentation:
                * 0 = start  
                * 1 = end
                */
                progressAmount= await page.evaluate(() => { return Reveal.getProgress()});

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
                log("NAME of the File: "+objSet.naming+ "_"+ (1000+ index) + ".jpeg"+" || progress ("+Math.floor(progressAmount*100)+"/100)");
                index++;
            }
            console.log("FINISHED");
            return browser;
        }).catch((err) => {
            return err;
        }).then(async (browser)=>{
            await browser.close();
            return true;
        });

}
